import {
  aws_ec2,
  aws_rds,
  aws_secretsmanager,
  RemovalPolicy,
  Stack,
  StackProps,
} from "aws-cdk-lib";
import { Construct } from "constructs";
import { SecurityGroup } from "aws-cdk-lib/aws-ec2";

export interface DatabaseStackProps extends StackProps {
  vpc: aws_ec2.IVpc;
}

export class DatabaseStack extends Stack {
  public readonly dbSecret: aws_secretsmanager.ISecret;
  public readonly dbSecurityGroupId: string;

  constructor(scope: Construct, id: string, props: DatabaseStackProps) {
    super(scope, id, props);

    const dbSecurityGroup: aws_ec2.ISecurityGroup = new SecurityGroup(
      this,
      "demoapp-database-sg",
      {
        vpc: props.vpc,
        description: "Security Group for the RDS",
        allowAllOutbound: true,
      }
    );

    this.dbSecurityGroupId = dbSecurityGroup.securityGroupId;

    const database = new aws_rds.DatabaseInstance(
      this,
      "demoapp-database-rds",
      {
        databaseName: "demoapp",
        vpc: props.vpc,
        vpcSubnets: {
          subnetType: aws_ec2.SubnetType.PRIVATE_ISOLATED,
        },
        storageEncrypted: true,

        // Don't touch RDS config below
        securityGroups: [dbSecurityGroup],
        allowMajorVersionUpgrade: true,
        engine: aws_rds.DatabaseInstanceEngine.postgres({
          version: aws_rds.PostgresEngineVersion.VER_16,
        }),
        removalPolicy: RemovalPolicy.DESTROY,
        instanceType: aws_ec2.InstanceType.of(
          aws_ec2.InstanceClass.T3,
          aws_ec2.InstanceSize.MICRO
        ),
      }
    );

    this.dbSecret = database.secret!;
  }
}