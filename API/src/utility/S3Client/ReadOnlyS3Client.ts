import { S3 } from "aws-sdk";
import { ListItemsInput, ListItemsOutput, GetItemInput, GetItemOutput, S3Error } from "./_types";

export interface ReadOnly {
  list: (prefix?: string) => Promise<ListItemsOutput>
  get: (key: string) => Promise<GetItemOutput>
}

export class ReadOnlyS3Client implements ReadOnly {
  protected readonly client: S3;
  protected readonly bucket: string;

  constructor(bucket: string) {
    if(!bucket) throw new Error("'bucket' must be defined.");

    this.client = new S3();;
    this.bucket = bucket;
  }

  private listFiles = async (prefix?: string) : Promise<ListItemsOutput> => {
    let request: ListItemsInput = {
        Bucket: this.bucket,
        Prefix: prefix
    };

    let response = await this.client.listObjectsV2(request).promise();
    return response;
  }
  private getFile = async (key: string) : Promise<GetItemOutput> => {
    let request: GetItemInput = {
        Bucket: this.bucket,
        Key: key
    };

    let response = await this.client.getObject(request).promise();
    return response;
  }

  public list: ReadOnly["list"] = async prefix => {
    try {
      return await this.listFiles(prefix);
    } catch (e) {
      throw new S3Error(e);
    }
  }
  public get: ReadOnly["get"] = async filePath => {
    try {
      return await this.getFile(filePath);
    } catch (e) {
      throw new S3Error(e);
    }
  }
}
