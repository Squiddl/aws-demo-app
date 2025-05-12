import {
    Stack,
    StackProps,
    aws_ec2,
    aws_route53,
    aws_certificatemanager,
    aws_secretsmanager,
} from "aws-cdk-lib";
import { Construct } from "constructs";
import { config } from "dotenv";

config({});

export interface ConfigStackProps extends StackProps {
    hostedZoneId: string;
    zoneName: string;
    subDomain: string;
    vpcCidr: string;
}

export class ConfigStack extends Stack {
    public readonly domainName: string;
    public readonly certificate: aws_certificatemanager.ICertificate;
    public readonly secrets: aws_secretsmanager.ISecret;
    public readonly vpc: aws_ec2.IVpc;

    constructor(scope: Construct, id: string, props: ConfigStackProps) {
        super(scope, id, props);

        this.domainName = `${props.subDomain}.${props.zoneName}`;

        this.secrets = new aws_secretsmanager.Secret(
            this,
            "demoapp-app-secrets",
            {
                description: "Holds the secrets key of the demoapp",
                secretName: "demoapp-config-secrets",
                generateSecretString: {
                    secretStringTemplate: JSON.stringify({}),
                    generateStringKey: "secretKey",
                },
            },

        );

        const hostedZone = aws_route53.HostedZone.fromHostedZoneAttributes(
            this,
            "demoapp-hostedzone",
            {
                hostedZoneId: props.hostedZoneId,
                zoneName: props.zoneName,
            },
        );

        this.certificate = new aws_certificatemanager.Certificate(
            this,
            "demoapp-elb-certificate",
            {
                domainName: this.domainName,
                // TODO-Task4: Use the AWS DNS validation for the Certificate creation
                validation:
                    aws_certificatemanager.CertificateValidation.fromDns(hostedZone),
                keyAlgorithm: aws_certificatemanager.KeyAlgorithm.RSA_2048,
                subjectAlternativeNames: [`*.${this.domainName}`],
                certificateName: "demoapp-elb-certificate",
                transparencyLoggingEnabled: false,
            },
        );

        this.vpc = new aws_ec2.Vpc(this, "demoapp-vpc", {
            maxAzs: 2,
            natGateways: 1,
            ipAddresses: aws_ec2.IpAddresses.cidr(props.vpcCidr),

            subnetConfiguration: [
                {
                    cidrMask: 27,
                    name: "public",
                    subnetType: aws_ec2.SubnetType.PUBLIC,
                },
                {
                    cidrMask: 27,
                    name: "private",
                    subnetType: aws_ec2.SubnetType.PRIVATE_WITH_EGRESS,
                },
                {
                    cidrMask: 27,
                    name: "isolated",
                    subnetType: aws_ec2.SubnetType.PRIVATE_ISOLATED,
                },
            ],
        });

        this.vpc.addFlowLog("demoapp-vpc-flowlog", {
            trafficType: aws_ec2.FlowLogTrafficType.REJECT,
        });
    }
}
