import { DynamoDB, AWSError } from "aws-sdk";

// ReadOnly Input/Output
export type GetItemInput = DynamoDB.DocumentClient.GetItemInput;
export type GetItemOutput = DynamoDB.DocumentClient.GetItemOutput;
export type AttributeMap = DynamoDB.DocumentClient.AttributeMap;

export type BatchGetItemInput = DynamoDB.DocumentClient.BatchGetItemInput;
export type BatchGetItemOutput = DynamoDB.DocumentClient.BatchGetItemOutput;

export type QueryInput = DynamoDB.DocumentClient.QueryInput;
export type QueryOutput = DynamoDB.DocumentClient.QueryOutput;

export type ScanInput = DynamoDB.DocumentClient.ScanInput;
export type ScanOutput = DynamoDB.DocumentClient.ScanOutput;

// Crud Input/Output
export type PutItemInput = DynamoDB.DocumentClient.PutItemInput;
export type PutItemOutput = DynamoDB.DocumentClient.PutItemOutput;

export type PatchItemInput = DynamoDB.DocumentClient.UpdateItemInput;
export type PatchItemOutput = DynamoDB.DocumentClient.UpdateItemOutput;

export type DeleteItemInput = DynamoDB.DocumentClient.DeleteItemInput;
export type DeleteItemOutput = DynamoDB.DocumentClient.DeleteItemOutput;

export type BatchWriteItemInput = DynamoDB.DocumentClient.BatchWriteItemInput;
export type BatchWriteItemOutput = DynamoDB.DocumentClient.BatchWriteItemOutput;

export type DbOptions = (DynamoDB.DocumentClient.DocumentClientOptions & DynamoDB.ClientApiVersions) | undefined;

export class DbError extends Error {
  public innerError: Error;
  public code: string;

  constructor(innerError: AWSError, message?: string) {
      super(message || innerError.message);

      // Set the prototype explicitly.
      Object.setPrototypeOf(this, DbError.prototype);
      this.innerError = innerError;
      this.code = innerError.code;
  }
}