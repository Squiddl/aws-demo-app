    import { aws_wafv2 } from "aws-cdk-lib"

    export const rateLimitRule: aws_wafv2.CfnWebACL.RuleProperty = {
        name: 'RateLimitRule',
        priority: 1,
        statement: {
            rateBasedStatement: {
                limit: 10,
                aggregateKeyType: 'IP',
            }
        },
        action: {
            block: {}
        },
        visibilityConfig: {
            sampledRequestsEnabled: true,
            cloudWatchMetricsEnabled: true,
            metricName: 'RateLimitRule-Metric',
        },
    };
