import { aws_wafv2 } from "aws-cdk-lib"

export const awsCommonRuleSet: aws_wafv2.CfnWebACL.RuleProperty = {
    name: 'AWS-AWSManagedRulesCommonRuleSet',
    priority: 0,
    statement: {
        managedRuleGroupStatement: {
            vendorName: 'AWS',
            name: 'AWSManagedRulesCommonRuleSet',
            excludedRules: [],
        },
    },
    overrideAction: {
        none: {},
    },
    visibilityConfig: {
        sampledRequestsEnabled: true,
        cloudWatchMetricsEnabled: true,
        metricName: 'AWS-AWSManagedRulesCommonRuleSet',
    },
};
