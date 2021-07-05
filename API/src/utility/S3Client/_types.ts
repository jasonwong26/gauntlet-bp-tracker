import { S3, AWSError } from "aws-sdk";
import {Readable} from 'stream';

export type ListItemsInput = S3.Types.ListObjectsRequest;
export type ListItemsOutput = S3.Types.ListObjectsV2Output;

export type GetItemInput = S3.Types.GetObjectRequest;
export type GetItemOutput = S3.Types.GetObjectOutput;

export type Body = Buffer|Uint8Array|Blob|string|Readable;
export type PutItemInput = S3.Types.PutObjectRequest;
export type PutItemOutput = S3.Types.PutObjectOutput;

export type DeleteItemInput = S3.Types.DeleteObjectRequest;
export type DeleteItemOutput = S3.Types.DeleteObjectOutput;

export class S3Error extends Error {
   public innerError: Error;
   public code: string;
 
   constructor(innerError: AWSError, message?: string) {
       super(message || innerError.message);
 
       // Set the prototype explicitly.
       Object.setPrototypeOf(this, S3Error.prototype);
       this.innerError = innerError;
       this.code = innerError.code;
   }
 }