import * as CDK from '@aws-cdk/core'
import * as CodeBuild from '@aws-cdk/aws-codebuild'
import * as S3 from '@aws-cdk/aws-s3'
import * as CodePipeline from '@aws-cdk/aws-codepipeline'
import * as CodePipelineAction from '@aws-cdk/aws-codepipeline-actions'

export interface Props extends CDK.StackProps {
  github: {
    owner: string
    repository: string,
    branch?: string
  },
  artifacts: {
    s3BucketName: string
  },
  ui: {
    s3BucketName: string
  },
  api: {
    stackName: string,
    s3BucketName: string
  }
}

export class Stack extends CDK.Stack {
  constructor(scope: CDK.App, id: string, props: Props) {
    super(scope, id, props)

    // Amazon S3 bucket to store CRA website
    const bucketArtifacts = S3.Bucket.fromBucketName(this, "bucketArtifacts", props.artifacts.s3BucketName);
    const bucketWebsite = S3.Bucket.fromBucketName(this, "bucketWebsite", props.ui.s3BucketName);
    const bucketApi = S3.Bucket.fromBucketName(this, "bucketApi", props.api.s3BucketName);

    // AWS CodeBuild artifacts
    const outputSources = new CodePipeline.Artifact()
    const outputWebsite = new CodePipeline.Artifact()
    const outputApi = new CodePipeline.Artifact()

    // AWS CodePipeline pipeline
    const pipeline = new CodePipeline.Pipeline(this, "Pipeline", {
      restartExecutionOnUpdate: true,
      artifactBucket: bucketArtifacts
    });

    // Grant pipeline access to specified S3 buckets
    bucketArtifacts.grantReadWrite(pipeline.role);
    bucketArtifacts.grantPut(pipeline.role);
    bucketWebsite.grantReadWrite(pipeline.role);
    bucketWebsite.grantPut(pipeline.role);
    bucketApi.grantReadWrite(pipeline.role);
    bucketApi.grantPut(pipeline.role);

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
        // Build UI
        new CodePipelineAction.CodeBuildAction({
          actionName: 'Website',
          project: new CodeBuild.PipelineProject(this, "BuildWebsite", {
            projectName: `${id}-BuildWebsite`,
            buildSpec: CodeBuild.BuildSpec.fromSourceFilename('./DevOps/Pipeline/buildspec-ui.yml'),
          }),
          input: outputSources,
          outputs: [outputWebsite],
        }),

        // Build API and generate SAM deployment artifacts
        new CodePipelineAction.CodeBuildAction({
          actionName: 'API',
          project: new CodeBuild.PipelineProject(this, "BuildAPI", {
            projectName: `${id}-BuildAPI`,
            buildSpec: CodeBuild.BuildSpec.fromSourceFilename('./DevOps/Pipeline/buildspec-api.yml'),
            environmentVariables: {
              "S3_BUCKETNAME": { value: bucketArtifacts.bucketName },
              "S3_FOLDER": { value: "api-stack"}
            },

          }),
          input: outputSources,
          outputs: [outputApi],
        }),
      ],
    });

    // AWS CodePipeline stage to deployt CRA website and CDK resources
    pipeline.addStage({
      stageName: 'Deploy',
      actions: [
        // Deploy UI to S3
        new CodePipelineAction.S3DeployAction({
          runOrder: 1,
          actionName: 'Website',
          input: outputWebsite,
          bucket: bucketWebsite,
        }),

        // Generate changeset for API
        new CodePipelineAction.CloudFormationCreateReplaceChangeSetAction({
          runOrder: 1,
          actionName: 'API_CreateChangeSet',
          stackName: props.api.stackName,
          changeSetName: `${props.api.stackName}-changeset`,
          templatePath: outputApi.atPath("packaged.yaml"),
          adminPermissions: true,
        }),
        // Deploy API changeset
        new CodePipelineAction.CloudFormationExecuteChangeSetAction({
          runOrder: 2,
          actionName: 'API_ExecuteChangeSet',
          stackName: props.api.stackName,
          changeSetName: `${props.api.stackName}-changeset`
        }),
      ],
    })

    new CDK.CfnOutput(this, 'PipelineName', {
      value: pipeline.pipelineName,
      description: 'Pipeline Name',
    })
  }
}
