import * as cdk from '@aws-cdk/core'

import { Pipeline, PipelineProps } from './stacks/pipeline'

const config: PipelineProps = {
  github: {
    owner: "jasonwong26",
    repository: "gauntlet-bp-tracker",
    branch: "Staging"
  },
  env: { region: "us-west-2" },
  tags: {
    project: "Guantlet BP Tracker",
    stage: "Staging"
  },
  description: "Deployment stack"
}

const app = new cdk.App()

new Pipeline(app, "gauntlet-bp-tracker", config)

app.synth()
