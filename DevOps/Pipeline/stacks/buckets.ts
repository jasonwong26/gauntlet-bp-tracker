import * as CDK from "@aws-cdk/core";
import * as S3 from "@aws-cdk/aws-s3";

export interface Props extends CDK.StackProps {
  artifacts: {
    s3BucketName: string
  }
  ui: {
    s3BucketName: string
  }
}

/* tslint:disable:no-unused-expression */
export class Stack extends CDK.Stack {
  constructor(scope: CDK.App, id: string, props: Props) {
    super(scope, id, props);

    // Amazon S3 bucket to store CRA website
    const bucketArtifacts = new S3.Bucket(this, props.artifacts.s3BucketName, {
      bucketName: props.artifacts.s3BucketName,
      encryption: S3.BucketEncryption.KMS,
      blockPublicAccess: S3.BlockPublicAccess.BLOCK_ALL
    });

    // Amazon S3 bucket to store CRA website
    const bucketWebsite = new S3.Bucket(this, props.ui.s3BucketName, {
      bucketName: props.ui.s3BucketName,
      websiteIndexDocument: "index.html",
      websiteErrorDocument: "index.html",
      publicReadAccess: true      
    });

    new CDK.CfnOutput(this, "ArtifactsARN", {
      value: bucketArtifacts.bucketArn,
      description: "ARN for Artifacts bucket"
    });
    new CDK.CfnOutput(this, "WebsiteARN", {
      value: bucketWebsite.bucketArn,
      description: "ARN for Website bucket"
    });
  }
}
