import * as AWS from "aws-sdk";

import { ConnectEvent, Response } from "../_types";

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
type AsyncEventHandler = (event: ConnectEvent) => Promise<Response>;
type PutItemInput = AWS.DynamoDB.DocumentClient.PutItemInput;

const TABLE_NAME = process.env.TABLE_NAME!;
const AWS_REGION = process.env.AWS_REGION!;

const ddb = new AWS.DynamoDB.DocumentClient({
  apiVersion: "2012-08-10", 
  region: AWS_REGION
});

export const handler: AsyncEventHandler = async event => {
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
  await ddb.put(putParams).promise();
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

export class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ValidationError";

    // Set the prototype explicitly.  Needed for Jest validations, etc.
    Object.setPrototypeOf(this, ValidationError.prototype);
  }
}
