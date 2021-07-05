import { S3 } from "aws-sdk";
import { ReadOnly, ReadOnlyS3Client } from "./ReadOnlyS3Client";
import { PutItemInput, PutItemOutput, DeleteItemInput, DeleteItemOutput, S3Error } from "./_types";

export interface Crud extends ReadOnly {
  put: (key: string, contents: Body) => Promise<PutItemOutput>,
  delete: (key: string) => Promise<DeleteItemOutput>
}

export class CrudS3Client extends ReadOnlyS3Client implements Crud {
  private putFile = async (key: string, contents: Body) : Promise<S3.Types.PutObjectOutput> => {
    let request: PutItemInput = {
        Bucket: this.bucket,
        Key: key,
        Body: contents
    };

    let response = await this.client.putObject(request).promise();
    return response;
  }

  private deleteFile = async (key: string) : Promise<S3.Types.DeleteObjectOutput> => {
    let request: S3.Types.DeleteObjectRequest = {
        Bucket: this.bucket,
        Key: key
    };

    let response = await this.client.deleteObject(request).promise();
    return response;
  }

  public put: Crud["put"] = async (key, contents) => {
    try {
      return await this.putFile(key, contents);
    } catch (e) {
      throw new S3Error(e);
    }
  }

  public delete: Crud["delete"] = async key => {
    try {
      return await this.deleteFile(key);
    } catch (e) {
      throw new S3Error(e);
    }
  }
}
 