import * as AWS from "aws-sdk";

import { MessageEvent, Response } from "../_types";

interface Character {
  id: string,
  name: string,
  [key: string]: any
}
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
interface DbCharacter {
  pk: string,
  sk: string,
  type: string,
  typeSk: string,
  character: Character
}
type AsyncEventHandler = (event: MessageEvent) => Promise<Response>;
type QueryInput = AWS.DynamoDB.DocumentClient.QueryInput;
type QueryOutput = AWS.DynamoDB.DocumentClient.QueryOutput;

type GetItemInput = AWS.DynamoDB.DocumentClient.GetItemInput;
type PutItemInput = AWS.DynamoDB.DocumentClient.PutItemInput;

type DeleteItemInput = AWS.DynamoDB.DocumentClient.DeleteItemInput;
type PostToConnectionRequest = AWS.ApiGatewayManagementApi.PostToConnectionRequest;

const TABLE_NAME = process.env.TABLE_NAME!;
const AWS_REGION = process.env.AWS_REGION!;

const ddb = new AWS.DynamoDB.DocumentClient({
  apiVersion: "2012-08-10", 
  region: AWS_REGION
});

export const handler: AsyncEventHandler = async event => {
  console.log("saving character...", { event });

  try {
    const input = mapToInput(event);
    await writeToDatabase(input);
    await pushToAllListeners(input);
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
  
  const dbLog = await ddb.get(getParams).promise();
  if(!dbLog.Item) {
    const props: DbCharacter = {
      pk: "mock",
      sk: "mock",
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
  await ddb.put(putParams).promise();
};

const pushToAllListeners: (input: Input) => Promise<void> = async input => {
  const connections = await fetchAllConnections(input);
  const pushCalls = pushToAllConnections(connections, input);
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
      ":pk": `Campaign#${input.campaign}`,
      ":sk1": "Connection#",
      ":sk2": "Connection$"
    }
  };

  return await ddb.query(queryParams).promise();
};
const pushToAllConnections = (connections: QueryOutput, input: Input) => {
  if(!connections?.Items) return [];

  const api = new AWS.ApiGatewayManagementApi({
    apiVersion: "2018-11-29",
    endpoint: input.endPoint
  });
  return connections.Items.map(async ({ connectionId }) => {
    try {
      await pushToConnection(api, input);
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

const pushToConnection = async (api: AWS.ApiGatewayManagementApi, input: Input) => {
  const { action, connectionId, campaign, character } = input;
  const output = { action, connectionId, campaign, character };
  const data = JSON.stringify(output);
  const postRequest: PostToConnectionRequest = {
    ConnectionId: input.connectionId, 
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

export const getContentSk = (date: Date = new Date()) => {
  const timezoneOffset = date.getMinutes() + date.getTimezoneOffset();
  const timestamp = date.getTime() + timezoneOffset * 1000;
  const correctDate = new Date(timestamp);  
  correctDate.setUTCHours(0, 0, 0, 0);

  return `ChatLog#${correctDate.toISOString()}`;
};

class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ValidationError";
  }
}
