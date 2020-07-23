import { GetItemInput, PutItemInput } from "../utility/DbClient/_types";
import { CrudDbClient } from "../utility/DbClient/CrudDbClient";
import { buildSendService } from "../utility/SendService";
import { MessageEvent, AsyncEventHandler, Character, DbCharacter } from "../_types";
import { ValidationError } from "../shared/Errors";

interface Request {
  action: string,
  campaign: string,
  character: Character
}
interface Input {
  endPoint: string,
  connectionId: string,
  action: string,
  campaign: string,
  character: Character
}

const TABLE_NAME = process.env.TABLE_NAME!;
const db = new CrudDbClient();
const service = buildSendService(db, TABLE_NAME);

export const handler: AsyncEventHandler<MessageEvent> = async event => {
  console.log("saving character...", { event });

  try {
    const input = mapToInput(event);
    await writeToDatabase(input);
    await service.send(input);
  } catch (err) {
    if (err instanceof ValidationError) {
      return { statusCode: 400, body: "Failed to send: " + JSON.stringify(err) };
    }
    console.log("Fatal error", { error: err });
    return { statusCode: 500, body: err.stack };
  }

  console.log("...character saved");
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
    campaign,
    character
  };
  return input;
};
const writeToDatabase = async (input: Input) => {
  const entry = await getOrCreateEntry(input);
  entry.character = input.character;
  await saveToDb(entry);
};
const getOrCreateEntry: (input: Input) => Promise<DbCharacter> = async input => {
  const { campaign, character } = input;
  const keys = {
    pk: `Campaign#${campaign}`,
    sk: `Character#${character.id}`
  };
  const getParams: GetItemInput = { 
    TableName: TABLE_NAME, 
    Key: keys
  };  
  
  const dbLog = await db.get(getParams);
  if(!dbLog.Item) {
    const props: DbCharacter = {
      pk: "",
      sk: "",
      type: "Character",
      typeSk: character.id,
      character
    };
    return { ...props, ...keys };
  }

  return dbLog.Item as DbCharacter;
};
const saveToDb = async (log: DbCharacter) => {
  const putParams: PutItemInput = { 
    TableName: TABLE_NAME, 
    Item: log
  }; 
  
  console.log("writing to table...", { putParams });
  await db.put(putParams);
};
