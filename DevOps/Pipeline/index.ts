import * as cdk from '@aws-cdk/core'

import { Pipeline, PipelineProps } from './stacks/pipeline'

const config: PipelineProps = {
  github: {
    owner: "jasonwong26",
    repository: "gauntlet-bp-tracker",
    branch: "Staging"
  },
  ui: { s3BucketName: "gauntlet-bp-tracker-ui-staging" },
  api: { 
    s3BucketName: "developer-mouse-sam-gauntlet-bp-tracker-api", 
    stackName: "gauntlet-bp-tracker-api-staging" 
  },
  env: { region: "us-west-2" },
  tags: {
    project: "Gauntlet BP Tracker",
    stage: "Staging"
  },
  description: "Deployment stack"
}

const app = new cdk.App()

new Pipeline(app, "gauntlet-bp-tracker-pipeline", config)

app.synth()
