import * as cdk from "@aws-cdk/core";

import * as Hosting from "./stacks/hosting";
import * as Buckets from "./stacks/buckets";
import * as Pipeline from "./stacks/pipeline";

/* tslint:disable:no-unused-expression */

const app = new cdk.App();

const hostingProps: Hosting.Props = {
  api: { 
    name: "gauntlet-bp-tracker",
    protocolType: "WEBSOCKET",
    routeSelectionExpression: "$request.body.action"
  },
  tags: {
    project: "Gauntlet BP Tracker"
  },
  description: "API Gateway resource shared between environments"  
};
new Hosting.Stack(app, "gauntlet-bp-tracker-hosting", hostingProps);

const bucketProps: Buckets.Props = {
  artifacts: { s3BucketName: "gauntlet-bp-tracker-pipeline-artifacts" },
  ui: { s3BucketName: "gauntlet-bp-tracker-ui-staging" },
  api: { 
    s3BucketName: "developer-mouse-sam-gauntlet-bp-tracker-api" 
  },
  env: { region: "us-west-2" },
  tags: {
    project: "Gauntlet BP Tracker",
    stage: "Staging"
  },
  description: "S3 Buckets"
};
new Buckets.Stack(app, "gauntlet-bp-tracker-buckets", bucketProps);

const pipelineProps: Pipeline.Props = {
  github: {
    owner: "jasonwong26",
    repository: "gauntlet-bp-tracker",
    branch: "Staging"
  },
  artifacts: { s3BucketName: "gauntlet-bp-tracker-pipeline-artifacts" },
  ui: { s3BucketName: "gauntlet-bp-tracker-ui-staging" },
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
new Pipeline.Stack(app, "gauntlet-bp-tracker-pipeline", pipelineProps);

app.synth();
