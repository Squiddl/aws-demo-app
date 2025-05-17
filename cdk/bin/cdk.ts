import "source-map-support/register";
import * as cdk from "aws-cdk-lib";
import { ConfigStack } from "../lib/config-stack";
import { DatabaseStack } from "../lib/db-stack";
import * as dotenv from "dotenv";
import { AppStack } from "../lib/app-stack";
import { HostedZoneStack } from "../lib/hostedzone-stack";
import { WafStack } from "../lib/waf-stack";
import { CloudTrailStack } from "../lib/cloud-trail-stack";

dotenv.config();

const app = new cdk.App();
const configStack = new ConfigStack(app, "DemoappConfigStack", {
    hostedZoneId: process.env.HOSTED_ZONE_ID!,
    zoneName: process.env.HOSTED_ZONE_DOMAIN!,
    subDomain: process.env.SUBDOMAIN!,
    vpcCidr: process.env.VPC_CIDR!,
    env: {
        region: "eu-central-1",
    },
});

const dbStack = new DatabaseStack(app, "DemoappDbStack", {
    vpc: configStack.vpc,
    env: {
        region: "eu-central-1",
    },
});

const demoappStack = new AppStack(app, "DemoappStack", {
    vpc: configStack.vpc,
    domainName: configStack.domainName,
    appSecrets: configStack.secrets,
    certificate: configStack.certificate,
    dbSecrets: dbStack.dbSecret,
    dbSecurityGroupId: dbStack.dbSecurityGroupId,
    env: {
        region: "eu-central-1",
    },
});

const wafStack = new WafStack(app, "DemoappWafStack", {
    env: {
        region: "us-east-1",
    },
});

const hostedZoneStack = new HostedZoneStack(app, "DemoappHostedZoneStack", {
    zoneName: process.env.HOSTED_ZONE_DOMAIN!,
    hostedZoneId: process.env.HOSTED_ZONE_ID!,
    subDomain: process.env.SUBDOMAIN!,
    s3BucketOrigin: demoappStack.s3Origin!,
    elbOrigin: demoappStack.elbOrigin!,
    webAclId: wafStack.webAcl.attrArn!,
    env: {
        region: "us-east-1",
    },
    crossRegionReferences: true,
});

const cloudTrailStack = new CloudTrailStack(app, "DemoappCloudTrailStack", {
    applicationName: "demoapp",
    env: {
        region: "eu-central-1",
    },
});

hostedZoneStack.addDependency(wafStack);
cloudTrailStack.addDependency(dbStack);
cloudTrailStack.addDependency(demoappStack);
