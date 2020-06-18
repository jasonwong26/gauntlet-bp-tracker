import AWS from "aws-sdk";

import { MessageEvent, Response, CharacterSummary, Character, PurchasedItem, DbCharacter, PurchaseAlert } from "../_types";

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

type AsyncEventHandler = (event: MessageEvent) => Promise<Response>;

type GetItemInput = AWS.DynamoDB.DocumentClient.GetItemInput;
type PutItemInput = AWS.DynamoDB.DocumentClient.PutItemInput;

type QueryInput = AWS.DynamoDB.DocumentClient.QueryInput;
type QueryOutput = AWS.DynamoDB.DocumentClient.QueryOutput;

type DeleteItemInput = AWS.DynamoDB.DocumentClient.DeleteItemInput;
type PostToConnectionRequest = AWS.ApiGatewayManagementApi.PostToConnectionRequest;

const TABLE_NAME = process.env.TABLE_NAME!;
const AWS_REGION = process.env.AWS_REGION!;

const ddb = new AWS.DynamoDB.DocumentClient({
  apiVersion: "2012-08-10", 
  region: AWS_REGION
});

export const handler: AsyncEventHandler = async event => {
  console.log("removing item from character...", { event });

  try {
    const input = mapToInput(event);
    const character = await removeItemFromCharacter(input);
    const output: Output = {...input, character };
    await sendToConnection(output);

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
  
  const dbLog = await ddb.get(getParams).promise();
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
  await ddb.put(putParams).promise();
};

const sendToConnection: (output: Output) => Promise<void> = async output => {
  const api = new AWS.ApiGatewayManagementApi({
    apiVersion: "2018-11-29",
    endpoint: output.endPoint
  });
  try {
    await pushToConnection(api, output);
  } catch (e) {
    if (e.statusCode === 410) {
      console.log(`Found stale connection, deleting connection: ${output.connectionId}`);
      await deleteConnectionFromDb(output.connectionId);
    } else {
      throw e;
    }
  }

};
const pushToConnection = async (api: AWS.ApiGatewayManagementApi, output: Output) => {
  const { action, connectionId, character } = output;
  const model = { action, connectionId, character };
  const data = JSON.stringify(model);
  const postRequest: PostToConnectionRequest = {
    ConnectionId: output.connectionId, 
    Data: data
  };
  
  await api.postToConnection(postRequest).promise();
};
const deleteConnectionFromDb = async (connectionId: string) => {
  const deleteParams: DeleteItemInput = {
    TableName: TABLE_NAME, 
    Key: { connectionId }
  };

  console.log("deleting stale connection...", { deleteParams });
  await ddb.delete(deleteParams).promise();
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

  return await ddb.query(queryParams).promise();
};
const pushAlertToAllConnections = (connections: QueryOutput, input: Input, alert: PurchaseAlert) => {
  if(!connections?.Items) return [];

  const api = new AWS.ApiGatewayManagementApi({
    apiVersion: "2018-11-29",
    endpoint: input.endPoint
  });
  return connections.Items.map(async ({ connectionId }) => {
    try {
      await pushAlertToConnection(api, connectionId, alert);
    } catch (e) {
      if (e.statusCode === 410) {
        console.log(`Found stale connection, deleting connection: ${connectionId}`);
        await deleteConnectionFromDb(connectionId);
      } else {
        throw e;
      }
    }
  });  
};
const pushAlertToConnection = async (api: AWS.ApiGatewayManagementApi, connectionId: string,  model: PurchaseAlert) => {
  const data = JSON.stringify(model);
  const postRequest: PostToConnectionRequest = {
    ConnectionId: connectionId, 
    Data: data
  };
  
  await api.postToConnection(postRequest).promise();
};

class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ValidationError";
  }
}
