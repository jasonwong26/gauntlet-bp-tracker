import { GetItemInput, PutItemInput, QueryInput, QueryOutput } from "../utility/DbClient/_types";
import { CrudDbClient } from "../utility/DbClient/CrudDbClient";
import { buildSendService } from "../utility/SendService";
import { MessageEvent, AsyncEventHandler, CharacterSummary, Character, PurchasedItem, DbCharacter, PurchaseAlert } from "../_types";
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
  console.log("removing item from character...", { event });

  try {
    const input = mapToInput(event);
    const character = await removeItemFromCharacter(input);
    const output: Output = {...input, character };
    await service.send(output);

    const alert = mapToAlert(output);
    await pushAlertToAllListeners(input, alert);
  } catch (err) {
    if (err instanceof ValidationError) {
      return { statusCode: 400, body: "Failed to send: " + JSON.stringify(err) };
    }
    console.log("Fatal error", { error: err });
    return { statusCode: 500, body: err.stack };
  }

  console.log("...item removed");
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
const removeItemFromCharacter: (input: Input) => Promise<Character> = async input => {
  const dbCharacter = await getFromDatabase(input);
  if(!dbCharacter) throw new Error("Character not found!");

  removeFromHistory(input, dbCharacter.character);
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
const removeFromHistory = (input: Input, character: Character) => {
  const { item } = input;
  const index = character.history.findIndex(value => {
    return item.id === value.id;
  });
  character.history.splice(index, 1);
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
    action: "removeitemalert",
    character: summary,
    item: output.item
  };
  
  return alert;
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
