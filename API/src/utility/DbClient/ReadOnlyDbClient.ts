import { DynamoDB } from "aws-sdk";
import { GetItemInput, GetItemOutput, BatchGetItemInput, BatchGetItemOutput, QueryInput, QueryOutput, ScanInput, ScanOutput, DbOptions, DbError } from "./_types";

export interface ReadOnly {
  get: (params: GetItemInput) => Promise<GetItemOutput>,
  getBatch: (params: BatchGetItemInput) => Promise<BatchGetItemOutput>
  query: (params: QueryInput) => Promise<QueryOutput>
  scan: (params: ScanInput) => Promise<ScanOutput>
}

export class ReadOnlyDbClient implements ReadOnly {
  private static getDefaultOptions: () => DbOptions = () => {
    return {
      convertEmptyValues: true
    };
  }

  protected readonly DynamoDb: DynamoDB.DocumentClient;

  constructor(options?: DbOptions) {
    const defaults = ReadOnlyDbClient.getDefaultOptions();
    const dbOptions = {...defaults, ...options};

    this.DynamoDb = new DynamoDB.DocumentClient(dbOptions);
  }

  public get: ReadOnly["get"] = async params => {
    try {
      return await this.DynamoDb.get(params).promise();
    } catch (e) {
      throw new DbError(e);
    }
  }

  public getBatch: ReadOnly["getBatch"] = async params => {
    try {
      return await this.DynamoDb.batchGet(params).promise();
    } catch (e) {
      throw new DbError(e);
    }
  }

  public query: ReadOnly["query"] = async params => {
    try {
      return await this.DynamoDb.query(params).promise();
    } catch (e) {
        throw new DbError(e);
    }    
  }

  public scan: ReadOnly["scan"] = async params => {
    try {
      return await this.DynamoDb.scan(params).promise();
    } catch (e) {
      throw new DbError(e);
    }    
  }
}
