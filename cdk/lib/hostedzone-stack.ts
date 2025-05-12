import {
  aws_cloudfront,
  Stack,
  StackProps,
  aws_route53,
  aws_certificatemanager,
  aws_route53_targets,
} from "aws-cdk-lib";
import { Distribution, IOrigin } from "aws-cdk-lib/aws-cloudfront";
import { Construct } from "constructs";

export interface HostedZoneStackProps extends StackProps {
  elbOrigin: IOrigin;
  s3Origin: IOrigin;
  hostedZoneId: string;
  zoneName: string;
  subDomain: string;
  webAclId?: string;
}

export class HostedZoneStack extends Stack {
  public readonly cloudfrontDistribution: Distribution;
  public readonly certificate: aws_certificatemanager.Certificate;
  public readonly hostedZone: aws_route53.IHostedZone;
  public readonly domainName: string;

  constructor(scope: Construct, id: string, props: HostedZoneStackProps) {
    super(scope, id, props);

    this.domainName = `${props.subDomain}.${props.zoneName}`;

    this.hostedZone = aws_route53.HostedZone.fromHostedZoneAttributes(
      this,
      "hosted-zone",
      {
        hostedZoneId: props.hostedZoneId,
        zoneName: props.zoneName,
      }
    );

    this.certificate = new aws_certificatemanager.Certificate(
      this,
      "certificate",
      {
        domainName: this.domainName,
        validation: aws_certificatemanager.CertificateValidation.fromDns(
          this.hostedZone
        ),
      }
    );

    this.cloudfrontDistribution = new aws_cloudfront.Distribution(
      this,
      "cloudfront-distribution",
      {
        defaultBehavior: {
          origin: props.elbOrigin,
          cachePolicy: aws_cloudfront.CachePolicy.CACHING_DISABLED,
          viewerProtocolPolicy:
            aws_cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
          allowedMethods: aws_cloudfront.AllowedMethods.ALLOW_ALL,
          originRequestPolicy: aws_cloudfront.OriginRequestPolicy.ALL_VIEWER,
        },
        additionalBehaviors: {
          "/static/*": {
            origin: props.s3Origin,
            cachePolicy: aws_cloudfront.CachePolicy.CACHING_DISABLED,
            viewerProtocolPolicy:
              aws_cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
            allowedMethods: aws_cloudfront.AllowedMethods.ALLOW_GET_HEAD,
          },
        },

        domainNames: [this.domainName],
        certificate: this.certificate,
      }
    );

    new aws_route53.ARecord(this, "record", {
      zone: this.hostedZone,
      target: aws_route53.RecordTarget.fromAlias(
        new aws_route53_targets.CloudFrontTarget(this.cloudfrontDistribution)
      ),
      recordName: props.subDomain,
    });
  }
}
