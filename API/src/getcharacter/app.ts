import AWS from "aws-sdk";

import { MessageEvent, Response, Character, DbCharacter } from "../_types";

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

type AsyncEventHandler = (event: MessageEvent) => Promise<Response>;
type GetItemInput = AWS.DynamoDB.DocumentClient.GetItemInput;

type DeleteItemInput = AWS.DynamoDB.DocumentClient.DeleteItemInput;
type PostToConnectionRequest = AWS.ApiGatewayManagementApi.PostToConnectionRequest;

const TABLE_NAME = process.env.TABLE_NAME!;
const AWS_REGION = process.env.AWS_REGION!;

const ddb = new AWS.DynamoDB.DocumentClient({
  apiVersion: "2012-08-10", 
  region: AWS_REGION
});

export const handler: AsyncEventHandler = async event => {
  console.log("gettign character...", { event });

  try {
    const input = mapToInput(event);
    const dbCharacter = await getFromDatabase(input);
    const output: Output = {...input, character: dbCharacter?.character };
    await sendToConnection(output);
  } catch (err) {
    if (err instanceof ValidationError) {
      return { statusCode: 400, body: "Failed to send: " + JSON.stringify(err) };
    }
    console.log("Fatal error", { error: err });
    return { statusCode: 500, body: err.stack };
  }

  console.log("...campaign retrieved");
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
  
  const dbLog = await ddb.get(getParams).promise();
  if(!dbLog.Item) {
    return undefined;
  }

  return dbLog.Item as DbCharacter;
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

class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ValidationError";
  }
}
