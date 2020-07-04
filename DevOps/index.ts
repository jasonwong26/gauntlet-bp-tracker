import * as cdk from '@aws-cdk/core'

import { Pipeline, PipelineProps } from './UI/stacks/pipeline'

const config: PipelineProps = {
  github: {
    owner: "jasonwong26",
    repository: "gauntlet-bp-tracker",
  },
  env: { region: "us-west-2" },
  tags: {
    project: "Gauntlet BP Tracker"
  },
  description: "Deployment stack"  
}

const app = new cdk.App()

new Pipeline(app, "Gauntlet-BP-Tracker", config)

app.synth()
