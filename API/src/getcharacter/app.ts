import { GetItemInput } from "../utility/DbClient/_types";
import { CrudDbClient } from "../utility/DbClient/CrudDbClient";
import { buildSendService } from "../utility/SendService";
import { MessageEvent, AsyncEventHandler, Character, DbCharacter } from "../_types";
import { ValidationError } from "../shared/Errors";

interface Request {
  action: string,
  campaign: string,
  character: string
}
interface Input {
  endPoint: string,
  connectionId: string,
  action: string,
  campaignId: string
  characterId: string
}
interface Output extends Input {
  character?: Character
}

const TABLE_NAME = process.env.TABLE_NAME!;
const db = new CrudDbClient();
const service = buildSendService(db, TABLE_NAME);

export const handler: AsyncEventHandler<MessageEvent> = async event => {
  console.log("getting character...", { event });

  try {
    const input = mapToInput(event);
    const dbCharacter = await getFromDatabase(input);
    const output: Output = {...input, character: dbCharacter?.character };
    await service.send(output);
  } catch (err) {
    if (err instanceof ValidationError) {
      return { statusCode: 400, body: "Failed to send: " + JSON.stringify(err) };
    }
    console.log("Fatal error", { error: err });
    return { statusCode: 500, body: err.stack };
  }

  console.log("...character retrieved");
  return { statusCode: 200, body: "Data sent." };
};
const mapToInput = (event: MessageEvent) => {
  if(!event.body) {
    throw new ValidationError("missing required request body");
  }
  const request: Request = JSON.parse(event.body);
  const { action, campaign, character } = request;
  const { connectionId, domainName, stage } = event.requestContext;
  const endPoint = `${domainName}/${stage}`;
  const input: Input = { 
    endPoint, 
    connectionId, 
    action, 
    campaignId: campaign,
    characterId: character
  };
  return input;
};
const getFromDatabase: (input: Input) => Promise<DbCharacter | undefined> = async input => {
  const { campaignId, characterId } = input;
  const keys = {
    pk: `Campaign#${campaignId}`,
    sk: `Character#${characterId}`
  };
  const getParams: GetItemInput = { 
    TableName: TABLE_NAME, 
    Key: keys
  };  
  
  const dbLog = await db.get(getParams);
  if(!dbLog.Item) {
    return undefined;
  }

  return dbLog.Item as DbCharacter;
};
