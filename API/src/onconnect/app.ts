import { PutItemInput } from "../utility/DbClient/_types";
import { CrudDbClient } from "../utility/DbClient/CrudDbClient";
import { ConnectEvent, AsyncEventHandler } from "../_types";
import { ValidationError } from "../shared/Errors";

export interface Input {
  endPoint: string,
  connectionId: string,
  action: string,
  campaign: string
}
export interface Connection {
  pk: string,
  sk: string,
  type: string,
  typeSk: string,
  connectionId: string
}

const TABLE_NAME = process.env.TABLE_NAME!;
const db = new CrudDbClient();

export const handler: AsyncEventHandler<ConnectEvent> = async event => {
  console.log("connecting...", { event });

  try {
    const input = mapToInput(event);
    await writeToDatabase(input);
  } catch (err) {
    if (err instanceof ValidationError) {
      return { statusCode: 400, body: "Failed to connect: " + JSON.stringify(err) };
    }
    console.log("Fatal error", { error: err });
    return { statusCode: 500, body: "Failed to connect: " + JSON.stringify(err) };
  }

  console.log("...connected");
  return { statusCode: 200, body: "Connected." };
};
export const mapToInput = (event: ConnectEvent) => {
  const { connectionId, domainName, stage } = event.requestContext;
  const endPoint = `${domainName}/${stage}`;

  const campaign = event.queryStringParameters?.[`campaign`];
  if(!campaign) {
    throw new ValidationError("missing required querystring parameter: 'campaign'");
  }

  const input: Input = { action: "connect", campaign, connectionId, endPoint };
  return input;
};
const writeToDatabase: (input: Input) => Promise<void> = async input => {
  const connection = mapToConnection(input);
  const putParams: PutItemInput = {
    TableName: TABLE_NAME,
    Item: connection
  };
  console.log("writing to db...", { putParams });
  await db.put(putParams);
};
export const mapToConnection = (input: Input) => {
  const { campaign, connectionId } = input;
  const connection: Connection = {
    pk: `Campaign#${campaign}`,
    sk: `Connection#${connectionId}`,
    type: "Connection",
    typeSk: connectionId,
    connectionId
  };

  return connection;
};
