import { PutItemInput } from "../utility/DbClient/_types";
import { CrudDbClient } from "../utility/DbClient/CrudDbClient";
import { buildSendService } from "../utility/SendService";
import { MessageEvent, AsyncEventHandler, DbConnection } from "../_types";
import { ValidationError } from "../shared/Errors";

interface Request {
  action: string,
  campaign: string
}
interface Input {
  endPoint: string,
  connectionId: string,
  action: string,
  campaignId: string
}
interface Output extends Input {
  message?: string
}

const TABLE_NAME = process.env.TABLE_NAME || "";
const db = new CrudDbClient();
const service = buildSendService(db, TABLE_NAME);

export const handler: AsyncEventHandler<MessageEvent> = async event => {
  try {
    const input = mapToInput(event);
    await subscribe(input);
    const output = mapToOutput(input);
    await service.send(output);
  } catch (err) {
    if (err instanceof ValidationError) {
      return { statusCode: 400, body: "Failed to send: " + JSON.stringify(err) };
    }
    console.log("Fatal error", { error: err });
    return { statusCode: 500, body: err.stack };
  }

  return { statusCode: 200, body: "Data sent." };
};
const mapToInput = (event: MessageEvent) => {
  if(!event.body) {
    throw new ValidationError("missing required request body");
  }
  const request: Request = JSON.parse(event.body);
  const { action, campaign } = request;
  const { connectionId, domainName, stage } = event.requestContext;
  const endPoint = `${domainName}/${stage}`;
  const input: Input = { 
    endPoint, 
    connectionId, 
    action, 
    campaignId: campaign
  };
  return input;
};
const subscribe: (input: Input) => Promise<void> = async input => {
  await saveToDatabase(input);
};
const saveToDatabase: (input: Input) => Promise<void> = async input => {
  const connection = mapToConnection(input);
  const putParams: PutItemInput = {
    TableName: TABLE_NAME,
    Item: connection
  };
  console.log("writing to db...", { putParams });
  await db.put(putParams);
};
const mapToConnection = (input: Input) => {
  const { campaignId, connectionId } = input;
  const connection: DbConnection = {
    pk: `Campaign#${campaignId}`,
    sk: `Connection#${connectionId}`,
    type: "Connection",
    typeSk: connectionId,
    connectionId,
    created: new Date().getTime()
  };

  return connection;
};
const mapToOutput = (input: Input) => {
  const output: Output = { ...input, message: "subscribed." };

  return output;
};
