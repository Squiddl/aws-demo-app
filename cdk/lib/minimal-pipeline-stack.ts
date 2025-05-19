import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as codepipeline from 'aws-cdk-lib/aws-codepipeline';
import * as codepipeline_actions from 'aws-cdk-lib/aws-codepipeline-actions';

export class MinimalPipelineStack extends cdk.Stack {
    constructor(scope: Construct, id: string, props?: cdk.StackProps) {
        super(scope, id, props);

        const artifactBucket = new cdk.aws_s3.Bucket(this, 'ArtifactBucket', {
            removalPolicy: cdk.RemovalPolicy.DESTROY,
            autoDeleteObjects: true,
            encryption: cdk.aws_s3.BucketEncryption.S3_MANAGED,
            enforceSSL: true,
            blockPublicAccess: cdk.aws_s3.BlockPublicAccess.BLOCK_ALL,
        });

        const pipeline = new codepipeline.Pipeline(this, 'DemoappMinimalPipeline', {
            pipelineName: 'DemoAppSecurityPipeline',
            artifactBucket: artifactBucket,
        });

        const sourceOutput = new codepipeline.Artifact();
        const sourceAction = new codepipeline_actions.GitHubSourceAction({
            actionName: 'GitHub',
            owner: 'Squiddl',
            repo: 'aws-demo-app',
            branch: 'main',
            oauthToken: cdk.SecretValue.secretsManager('github-token'),
            output: sourceOutput,
        });

        pipeline.addStage({
            stageName: 'Source',
            actions: [sourceAction],
        });
    }
}


