import { GetItemInput, PutItemInput, QueryInput, QueryOutput } from "../utility/DbClient/_types";
import { CrudDbClient } from "../utility/DbClient/CrudDbClient";
import { buildSendService } from "../utility/SendService";
import { MessageEvent, AsyncEventHandler, CharacterSummary, Character, PurchasedItem, DbCharacter, PurchaseAlert, DbAlert } from "../_types";
import { ValidationError } from "../shared/Errors";

interface Request {
  action: string,
  campaign: string,
  character: string,
  item: PurchasedItem
}
interface Input {
  endPoint: string,
  connectionId: string,
  action: string,
  campaignId: string,
  characterId: string,
  item: PurchasedItem
}
interface Output extends Input {
  character?: Character
}
interface AlertMessage extends PurchaseAlert {
  endPoint: string,
  connectionId: string
}

const TABLE_NAME = process.env.TABLE_NAME!;
const db = new CrudDbClient();
const service = buildSendService(db, TABLE_NAME);

export const handler: AsyncEventHandler<MessageEvent> = async event => {
  console.log("appending item to character...", { event });

  try {
    const input = mapToInput(event);
    const character = await addItemToCharacter(input);
    const output: Output = {...input, character };
    await service.send(output);

    console.log("sending alert to all...", { event });
    const alert = mapToAlert(output);
    await saveAlertToDatabase(input, alert);
    await pushAlertToAllListeners(input, alert);
  } catch (err) {
    if (err instanceof ValidationError) {
      return { statusCode: 400, body: "Failed to send: " + JSON.stringify(err) };
    }
    console.log("Fatal error", { error: err });
    return { statusCode: 500, body: err.stack };
  }

  console.log("...item appended");
  return { statusCode: 200, body: "Data sent." };
};
const mapToInput = (event: MessageEvent) => {
  if(!event.body) {
    throw new ValidationError("missing required request body");
  }
  const request: Request = JSON.parse(event.body);
  const { action, campaign, character, item } = request;
  const { connectionId, domainName, stage } = event.requestContext;
  const endPoint = `${domainName}/${stage}`;
  const input: Input = { 
    endPoint, 
    connectionId, 
    action, 
    campaignId: campaign,
    characterId: character,
    item
  };
  return input;
};
const addItemToCharacter: (input: Input) => Promise<Character> = async input => {
  const dbCharacter = await getFromDatabase(input);
  if(!dbCharacter) throw new Error("Character not found!");

  addToHistory(input, dbCharacter.character);
  await saveToDatabase(dbCharacter);

  return dbCharacter.character;
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
const addToHistory = (input: Input, character: Character) => {
  const { item } = input;
  const index = character.history.findIndex(value => {
    return item.level < value.level;
  });
  if(index < 0) {
    character.history.push(item);
  } else {
    character.history.splice(index, 0, item);  
  }
};
const saveToDatabase = async (item: DbCharacter) => {
  const putParams: PutItemInput = { 
    TableName: TABLE_NAME, 
    Item: item
  }; 
  
  console.log("writing to table...", { putParams });
  await db.put(putParams);
};

const mapToAlert: (output: Output) => PurchaseAlert = output => {
  const character = output.character!;
  const summary: CharacterSummary = {
    id: character.id,
    name: character.name,
    avatarUrl: character.avatarUrl,
    race: character.race,
    class: character.class
  };
  const alert: PurchaseAlert = {
    action: "additemalert",
    alertDate: new Date().getTime(),
    character: summary,
    item: output.item
  };

  return alert;
};
const saveAlertToDatabase: (input: Input, alert: PurchaseAlert) => Promise<void> = async (input, alert) => {
  const { campaignId } = input;
  const keys = {
    pk: `Campaign#${campaignId}`,
    sk: `Alert#${alert.alertDate}#Additem#${alert.item.id}`,
    type: "Alert",
    typeSk: `${alert.alertDate}#Additem#${alert.item.id}`
  };
  const item: DbAlert = { ...keys, alert };
  const putParams: PutItemInput = { 
    TableName: TABLE_NAME, 
    Item: item
  }; 
  
  console.log("writing to table...", { putParams });
  await db.put(putParams);
};
const pushAlertToAllListeners: (input: Input, alert: PurchaseAlert) => Promise<void> = async (input, alert) => {
  const connections = await fetchAllConnections(input);
  const pushCalls = pushAlertToAllConnections(connections, input, alert);
  await Promise.all(pushCalls);
};
const fetchAllConnections: (input: Input) => Promise<QueryOutput> = async input => {
  const queryParams: QueryInput = {
    TableName: TABLE_NAME,
    KeyConditionExpression: "#pk = :pk AND #sk BETWEEN :sk1 AND :sk2",
    ExpressionAttributeNames: {
      "#pk": "pk",
      "#sk": "sk"
    },
    ExpressionAttributeValues: {
      ":pk": `Campaign#${input.campaignId}`,
      ":sk1": "Connection#",
      ":sk2": "Connection$"
    }
  };

  return await db.query(queryParams);
};
const pushAlertToAllConnections = (connections: QueryOutput, input: Input, alert: PurchaseAlert) => {
  if(!connections?.Items) return [];

  const { endPoint } = input;
  return connections.Items.map(async ({ connectionId }) => {
    const alertMessage: AlertMessage = {...alert, endPoint, connectionId };
    await service.send(alertMessage);
  });  
};
