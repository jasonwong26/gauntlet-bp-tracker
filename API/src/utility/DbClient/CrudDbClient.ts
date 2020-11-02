import { PutItemInput, PutItemOutput, BatchWriteItemInput, BatchWriteItemOutput, PatchItemInput, PatchItemOutput, DeleteItemInput, DeleteItemOutput, DbError } from "./_types";
import { ReadOnly, ReadOnlyDbClient } from "./ReadOnlyDbClient";

export interface Crud extends ReadOnly {
  put: (params: PutItemInput) => Promise<PutItemOutput>,
  patch: (params: PatchItemInput) => Promise<PatchItemOutput>,
  delete: (params: DeleteItemInput) => Promise<DeleteItemOutput>,
  batchWrite: (params: BatchWriteItemInput) => Promise<BatchWriteItemOutput>
}

export class CrudDbClient extends ReadOnlyDbClient implements Crud {
  put: Crud["put"] = async params => {
    try {
      return await this.DynamoDb.put(params).promise();
    } catch (e) {
      throw new DbError(e);
    }
  }

  patch: Crud["patch"] = async params => {
    try {
      return await this.DynamoDb.update(params).promise();
    } catch (e) {
      throw new DbError(e);
    }
  }

  delete: Crud["delete"] = async params => {
    try {
      return await this.DynamoDb.delete(params).promise();
    } catch (e) {
      throw new DbError(e);
    }
  }

  batchWrite: Crud["batchWrite"] = async params => {
    try {
      return await this.DynamoDb.batchWrite(params).promise();
    } catch (e) {
      throw new DbError(e);
    }
  }
}