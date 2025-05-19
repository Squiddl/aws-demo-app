import {
    aws_certificatemanager,
    aws_cloudfront,
    aws_cloudfront_origins,
    aws_ec2,
    aws_ecr_assets,
    aws_ecs,
    aws_ecs_patterns,
    aws_elasticloadbalancingv2,
    aws_lambda,
    aws_logs,
    aws_s3,
    aws_s3_deployment,
    aws_secretsmanager,
    Duration,
    RemovalPolicy,
    Size,
    Stack,
    StackProps
} from "aws-cdk-lib";

import { Construct } from "constructs";
import { LambdaInvocation } from "./constructs/lambda-invocation";
import { ISecurityGroup } from "aws-cdk-lib/aws-ec2";
import { Platform } from "aws-cdk-lib/aws-ecr-assets";
import {AssetImage} from "aws-cdk-lib/aws-ecs";

export interface AppStackProps extends StackProps {
    vpc: aws_ec2.IVpc;
    domainName: string;
    certificate: aws_certificatemanager.ICertificate;
    dbSecurityGroupId: string;
    dbSecrets: aws_secretsmanager.ISecret;
    appSecrets: aws_secretsmanager.ISecret;
}

export class AppStack extends Stack {
    public readonly s3Origin: aws_cloudfront.IOrigin;
    public readonly elbOrigin: aws_cloudfront.IOrigin;

    constructor(scope: Construct, id: string, props: AppStackProps) {
        super(scope, id, props);

        const staticContentBucket = new aws_s3.Bucket(
            this,
            "static-content-bucket",
            {
                encryption: aws_s3.BucketEncryption.S3_MANAGED,
                enforceSSL: true,
                removalPolicy: RemovalPolicy.DESTROY,
                versioned: false,
                autoDeleteObjects: true,
                blockPublicAccess: aws_s3.BlockPublicAccess.BLOCK_ALL,
            }
        );

        new aws_s3_deployment.BucketDeployment(this, "static-content-deployment", {
            sources: [aws_s3_deployment.Source.asset("../app/dist/static")],
            destinationBucket: staticContentBucket,
            destinationKeyPrefix: "static/",
        });

        const cloudFrontOAI = new aws_cloudfront.OriginAccessIdentity(
            this,
            "cloudfront-oai",
            {
                comment: "Access identity for static content bucket.",
            }
        );

        staticContentBucket.grantRead(cloudFrontOAI);

        this.s3Origin = new aws_cloudfront_origins.S3Origin(staticContentBucket, {
            originAccessIdentity: cloudFrontOAI,
        });

        const dbSecurityGroup: ISecurityGroup =
            aws_ec2.SecurityGroup.fromSecurityGroupId(
                this,
                "demoapp-database-sg",
                props.dbSecurityGroupId
            );

        const demoappSecurityGroup = new aws_ec2.SecurityGroup(this, "demoapp-sg", {
            vpc: props.vpc,
            allowAllOutbound: true,
        });

        dbSecurityGroup.addIngressRule(
            demoappSecurityGroup,
            aws_ec2.Port.tcp(5432),
        );

        const managePyLambda = new aws_lambda.DockerImageFunction(
            this,
            "manage-py-lambda",
            {
                code: aws_lambda.DockerImageCode.fromImageAsset("../app", {
                    file: "docker/Dockerfile.lambda",
                    platform: Platform.LINUX_AMD64,
                }),
                vpc: props.vpc,
                vpcSubnets: {
                    subnetType: aws_ec2.SubnetType.PRIVATE_WITH_EGRESS,
                },
                securityGroups: [demoappSecurityGroup],
                timeout: Duration.minutes(10),
                memorySize: 1024,
                retryAttempts: 2,
                environment: {
                    DEBUG: "True",
                    ALLOWED_HOSTS: props.domainName,
                    APP_SECRET_NAME: props.appSecrets.secretName,
                    DB_SECRET_NAME: props.dbSecrets.secretName,
                },
                logRetention: aws_logs.RetentionDays.ONE_WEEK,
            });

        props.appSecrets.grantRead(managePyLambda);
        props.dbSecrets.grantRead(managePyLambda);



        const migrateCall = new LambdaInvocation(
            this,
            "demoapp-managepy-migrate-invocation",
            {
                lambdaFunction: managePyLambda,
                payload: {
                    cmd: ["migrate"],
                },
                physicalResourceId: Date.now().toString(),
            }
        );

        const loadDataCall = new LambdaInvocation(
            this,
            "demoapp-managepy-loaddata-invocation",
            {
                lambdaFunction: managePyLambda,
                payload: {
                    cmd: [
                        "loaddata",
                        "./djangodemoproject/fixtures/initial_data.json",
                    ],
                },
                physicalResourceId: Date.now().toString(),
                dependencies: [migrateCall],
            }
        );

        const demoappImage: AssetImage = aws_ecs.ContainerImage.fromAsset("../app/", {
            platform: aws_ecr_assets.Platform.LINUX_AMD64,
            exclude: ["cdk"],
        });

        const secrets = {
            SECRET_KEY: aws_ecs.Secret.fromSecretsManager(props.appSecrets, "secretKey"),
            DB_HOST: aws_ecs.Secret.fromSecretsManager(props.dbSecrets, "host"),
            DB_PORT: aws_ecs.Secret.fromSecretsManager(props.dbSecrets, "port"),
            DB_NAME: aws_ecs.Secret.fromSecretsManager(props.dbSecrets, "dbname"),
            DB_USERNAME: aws_ecs.Secret.fromSecretsManager(props.dbSecrets, "username"),
            DB_PASSWORD: aws_ecs.Secret.fromSecretsManager(props.dbSecrets, "password"),
        };

        const demoappService = new aws_ecs_patterns.ApplicationLoadBalancedFargateService(
            this,
            "demoapp-service",
            {
                vpc: props.vpc,
                securityGroups: [demoappSecurityGroup],
                certificate: props.certificate,
                protocol: aws_elasticloadbalancingv2.ApplicationProtocol.HTTPS,
                publicLoadBalancer: true,
                cpu: 512,
                memoryLimitMiB: 1024,
                taskImageOptions: {
                    image: demoappImage,
                    environment: {
                        DEBUG: "True",
                        ALLOWED_HOSTS: props.domainName,
                        APP_SECRET_NAME: props.appSecrets.secretName,
                        DB_SECRET_NAME: props.dbSecrets.secretName,
                    },
                    secrets: secrets,
                    containerPort: 8000,
                    logDriver: aws_ecs.LogDrivers.awsLogs({
                        streamPrefix: "demoapp",
                        mode: aws_ecs.AwsLogDriverMode.NON_BLOCKING,
                        maxBufferSize: Size.mebibytes(25),
                        logRetention: aws_logs.RetentionDays.ONE_WEEK,
                    }),
                },
                healthCheckGracePeriod: Duration.seconds(60),
            }
        );

        demoappService.targetGroup.configureHealthCheck(
            {
                path: "/health/",
            }
        );

        this.elbOrigin = new aws_cloudfront_origins.LoadBalancerV2Origin(demoappService.loadBalancer,
            {
                protocolPolicy: aws_cloudfront.OriginProtocolPolicy.HTTPS_ONLY,
            }
        );
    }
}
