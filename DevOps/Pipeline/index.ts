import * as cdk from "@aws-cdk/core";

import * as Buckets from "./stacks/buckets";
import * as Pipeline from "./stacks/pipeline";

/* tslint:disable:no-unused-expression */

const app = new cdk.App();

const stageBucketProps: Buckets.Props = {
  artifacts: { s3BucketName: "gauntlet-bp-tracker-staging-pipeline-artifacts" },
  ui: { s3BucketName: "gauntlet-bp-tracker-ui-staging" },
  env: { region: "us-west-2" },
  tags: {
    project: "Gauntlet BP Tracker",
    stage: "Staging"
  },
  description: "S3 Buckets"
};
new Buckets.Stack(app, "gauntlet-bp-tracker-staging-buckets", stageBucketProps);

const stagePipeProps: Pipeline.Props = {
  github: {
    owner: "jasonwong26",
    repository: "gauntlet-bp-tracker",
    branch: "Staging"
  },
  artifacts: { s3BucketName: stageBucketProps.artifacts.s3BucketName },
  ui: { 
    s3BucketName: stageBucketProps.ui.s3BucketName,
    buildCommand: "build:staging"
   },
  api: { 
    stackName: "gauntlet-bp-tracker-api-staging",
    tableName: "gauntlet_bp_tracker_dev",
    stage: "Staging",
    domainName: "api.gauntlet.developermouse.com"
  },
  env: { region: "us-west-2" },
  tags: {
    project: "Gauntlet BP Tracker",
    stage: "Staging"
  },
  description: "Deployment stack"
};
new Pipeline.Stack(app, "gauntlet-bp-tracker-staging-pipeline", stagePipeProps);


const prodBucketProps: Buckets.Props = {
  artifacts: { s3BucketName: "gauntlet-bp-tracker-prod-pipeline-artifacts" },
  ui: { s3BucketName: "gauntlet-bp-tracker-ui" },
  env: { region: "us-west-2" },
  tags: {
    project: "Gauntlet BP Tracker",
    stage: "Prod"
  },
  description: "S3 Buckets"
};
new Buckets.Stack(app, "gauntlet-bp-tracker-prod-buckets", prodBucketProps);

const prodPipeProps: Pipeline.Props = {
  github: {
    owner: "jasonwong26",
    repository: "gauntlet-bp-tracker"
  },
  artifacts: { s3BucketName: prodBucketProps.artifacts.s3BucketName },
  ui: { 
    s3BucketName: prodBucketProps.ui.s3BucketName,
    buildCommand: "build:prod"
   },
  api: { 
    stackName: "gauntlet-bp-tracker-api",
    tableName: "gauntlet_bp_tracker",
    stage: "Prod",
    domainName: "api.gauntlet.developermouse.com"
  },
  env: { region: "us-west-2" },
  tags: {
    project: "Gauntlet BP Tracker",
    stage: "Prod"
  },
  description: "Deployment stack"
};
new Pipeline.Stack(app, "gauntlet-bp-tracker-prod-pipeline", prodPipeProps);

app.synth();
