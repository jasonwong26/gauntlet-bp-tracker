import * as CDK from '@aws-cdk/core'
import * as CodeBuild from '@aws-cdk/aws-codebuild'
import * as S3 from '@aws-cdk/aws-s3'
import * as CodePipeline from '@aws-cdk/aws-codepipeline'
import * as CodePipelineAction from '@aws-cdk/aws-codepipeline-actions'

export interface PipelineProps extends CDK.StackProps {
  github: {
    owner: string
    repository: string,
    branch?: string
  },
  ui: {
    s3BucketName: string
  },
  api: {
    stackName: string,
    s3BucketName: string
  }
}

export class Pipeline extends CDK.Stack {
  constructor(scope: CDK.App, id: string, props: PipelineProps) {
    super(scope, id, props)

    // Amazon S3 bucket to store CRA website
    const bucketWebsite = S3.Bucket.fromBucketName(this, "bucketWebsite", props.ui.s3BucketName);

    const bucketArtifacts = new S3.Bucket(this, "Artifacts", {
      websiteIndexDocument: 'index.html',
      websiteErrorDocument: 'error.html',
      publicReadAccess: true,
    })

    // AWS CodeBuild artifacts
    const outputSources = new CodePipeline.Artifact()
    const outputWebsite = new CodePipeline.Artifact()
    const outputApi = new CodePipeline.Artifact()

    // AWS CodePipeline pipeline
    const pipeline = new CodePipeline.Pipeline(this, "Pipeline", {
      restartExecutionOnUpdate: true,
      artifactBucket: bucketArtifacts
    })

    // AWS CodePipeline stage to clone sources from GitHub repository
    pipeline.addStage({
      stageName: 'Source',
      actions: [
        new CodePipelineAction.GitHubSourceAction({
          actionName: 'Checkout',
          owner: props.github.owner,
          repo: props.github.repository,
          branch: props.github.branch,
          oauthToken: CDK.SecretValue.secretsManager('GitHubToken'),
          output: outputSources,
          trigger: CodePipelineAction.GitHubTrigger.WEBHOOK,
        }),
      ],
    })

    // AWS CodePipeline stage to build CRA website and CDK resources
    pipeline.addStage({
      stageName: 'Build',
      actions: [
        // AWS CodePipeline action to run CodeBuild project
        new CodePipelineAction.CodeBuildAction({
          actionName: 'Website',
          project: new CodeBuild.PipelineProject(this, "BuildWebsite", {
            projectName: `${id}-BuildWebsite`,
            buildSpec: CodeBuild.BuildSpec.fromSourceFilename('./DevOps/Pipeline/buildspec-ui.yml'),
          }),
          input: outputSources,
          outputs: [outputWebsite],
        }),
        // AWS CodePipeline action to run CodeBuild project
        new CodePipelineAction.CodeBuildAction({
          actionName: 'API',
          project: new CodeBuild.PipelineProject(this, "BuildAPI", {
            projectName: `${id}-BuildAPI`,
            buildSpec: CodeBuild.BuildSpec.fromSourceFilename('./DevOps/Pipeline/buildspec-api.yml'),
            environmentVariables: {
              "S3_BUCKETNAME": { value: props.api.s3BucketName }
            }
          }),
          input: outputSources,
          outputs: [outputApi],
        }),
      ],
    })

    // AWS CodePipeline stage to deployt CRA website and CDK resources
    pipeline.addStage({
      stageName: 'Deploy',
      actions: [
        // AWS CodePipeline action to deploy CRA website to S3
        new CodePipelineAction.S3DeployAction({
          actionName: 'Website',
          input: outputWebsite,
          bucket: bucketWebsite,
        }),

        // AWS CodePipeline action to deploy API Code and Stack
        new CodePipelineAction.CloudFormationCreateReplaceChangeSetAction({
          actionName: 'API_CreateChangeSet',
          stackName: props.api.stackName,
          changeSetName: `${props.api.stackName}-changeset`,
          templatePath: outputApi.atPath("packaged.yaml"),
          adminPermissions: false,
        }),
        // AWS CodePipeline action to deploy API Code and Stack
        new CodePipelineAction.CloudFormationExecuteChangeSetAction({
          actionName: 'API_ExecuteChangeSet',
          stackName: "gauntlet-bp-tracker-api-dev",
          changeSetName: "gauntlet-bp-tracker-api-dev-changeset"
        }),
      ],
    })

    new CDK.CfnOutput(this, 'WebsiteURL', {
      value: bucketWebsite.bucketWebsiteUrl,
      description: 'Website URL',
    })
  }
}
