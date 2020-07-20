
// ReadOnly Input/Output
export type GetItemInput = AWS.DynamoDB.DocumentClient.GetItemInput;
export type GetItemOutput = AWS.DynamoDB.DocumentClient.GetItemOutput;
export type AttributeMap = AWS.DynamoDB.DocumentClient.AttributeMap;


export type BatchGetItemInput = AWS.DynamoDB.DocumentClient.BatchGetItemInput;
export type BatchGetItemOutput = AWS.DynamoDB.DocumentClient.BatchGetItemOutput;

export type QueryInput = AWS.DynamoDB.DocumentClient.QueryInput;
export type QueryOutput = AWS.DynamoDB.DocumentClient.QueryOutput;

export type ScanInput = AWS.DynamoDB.DocumentClient.ScanInput;
export type ScanOutput = AWS.DynamoDB.DocumentClient.ScanOutput;

// Crud Input/Output
export type PutItemInput = AWS.DynamoDB.DocumentClient.PutItemInput;
export type PutItemOutput = AWS.DynamoDB.DocumentClient.PutItemOutput;

export type PatchItemInput = AWS.DynamoDB.DocumentClient.UpdateItemInput;
export type PatchItemOutput = AWS.DynamoDB.DocumentClient.UpdateItemOutput;

export type DeleteItemInput = AWS.DynamoDB.DocumentClient.DeleteItemInput;
export type DeleteItemOutput = AWS.DynamoDB.DocumentClient.DeleteItemOutput;

export type BatchWriteItemInput = AWS.DynamoDB.DocumentClient.BatchWriteItemInput;
export type BatchWriteItemOutput = AWS.DynamoDB.DocumentClient.BatchWriteItemOutput;

export type DbOptions = (AWS.DynamoDB.DocumentClient.DocumentClientOptions & AWS.DynamoDB.ClientApiVersions) | undefined;

export class DbError extends Error {
  public innerError: Error;
  public code: string;

  constructor(innerError: AWS.AWSError, message?: string) {
      super(message || innerError.message);

      // Set the prototype explicitly.
      Object.setPrototypeOf(this, DbError.prototype);
      this.innerError = innerError;
      this.code = innerError.code;
  }
}