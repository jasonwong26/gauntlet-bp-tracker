import * as AWS from "aws-sdk";

import { MessageEvent, Response, CampaignSettings, DbCampaignSettings } from "../_types";

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
  settings?: CampaignSettings
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
  console.log("getting campaign settings...", { event });

  try {
    const input = mapToInput(event);
    const dbSettings = await getFromDatabase(input);
    const output: Output = {...input, settings: dbSettings?.settings };
    await sendToConnection(output);
  } catch (err) {
    if (err instanceof ValidationError) {
      return { statusCode: 400, body: "Failed to send: " + JSON.stringify(err) };
    }
    console.log("Fatal error", { error: err });
    return { statusCode: 500, body: err.stack };
  }

  console.log("...campaign settings retrieved");
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
const getFromDatabase: (input: Input) => Promise<DbCampaignSettings | undefined> = async input => {
  const { campaignId: campaign } = input;
  const keys = {
    pk: `Campaign#${campaign}`,
    sk: "Settings"
  };
  const getParams: GetItemInput = { 
    TableName: TABLE_NAME, 
    Key: keys
  };  
  
  const dbLog = await ddb.get(getParams).promise();
  if(!dbLog.Item) {
    return undefined;
  }

  return dbLog.Item as DbCampaignSettings;
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
  const { action, connectionId, settings } = output;
  const model = { action, connectionId, settings };
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
