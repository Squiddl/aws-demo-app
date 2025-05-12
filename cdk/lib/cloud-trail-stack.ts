import {
    Stack,
    StackProps,
    aws_cloudtrail,
    aws_s3,
    RemovalPolicy
} from "aws-cdk-lib";
import { Construct } from "constructs";

export interface CloudTrailStackProps extends StackProps {
    applicationName: string;
}

export class CloudTrailStack extends Stack {
    constructor(scope: Construct, id: string, props: CloudTrailStackProps) {
        super(scope, id, props);

        const cloudTrailBucket = new aws_s3.Bucket(this, 'CloudTrailBucket', {
            encryption: aws_s3.BucketEncryption.S3_MANAGED,
            enforceSSL: true,
            removalPolicy: RemovalPolicy.DESTROY,
            autoDeleteObjects: true,
            blockPublicAccess: aws_s3.BlockPublicAccess.BLOCK_ALL,
        });

        new aws_cloudtrail.Trail(this, 'ApplicationCloudTrail', {
            bucket: cloudTrailBucket,
            trailName: `${props.applicationName}-trail`,
            managementEvents: aws_cloudtrail.ReadWriteType.ALL,
            sendToCloudWatchLogs: true,
        });
    }
}
