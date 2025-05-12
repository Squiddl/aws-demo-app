import {
    aws_iam,
    aws_lambda,
    custom_resources,
    Duration,
} from "aws-cdk-lib";

import { Construct, IDependable } from "constructs";

export interface LambdaCallProps {
    lambdaFunction: aws_lambda.IFunction;
    payload: any;
    physicalResourceId: string;
    dependencies?: IDependable[];
}

export class LambdaInvocation extends Construct {
    public readonly lambdaCall: custom_resources.AwsCustomResource;

    constructor(scope: Construct, id: string, props: LambdaCallProps) {
        super(scope, id);

        const lambdaCall = new custom_resources.AwsCustomResource(this, id, {
            timeout: Duration.minutes(15),

            onCreate: {
                service: "Lambda",
                action: "invoke",
                parameters: {
                    FunctionName: props.lambdaFunction.functionArn,
                    InvocationType: "RequestResponse",
                    Payload: JSON.stringify(props.payload),
                },
                outputPaths: ["StatusCode", "Payload"],
                physicalResourceId: custom_resources.PhysicalResourceId.of(props.physicalResourceId)
            },
            onUpdate: {
                service: "Lambda",
                action: "invoke",
                parameters: {
                    FunctionName: props.lambdaFunction.functionArn,
                    InvocationType: "RequestResponse",
                    Payload: JSON.stringify(props.payload),
                },
                outputPaths: ["StatusCode", "Payload"],
                physicalResourceId: custom_resources.PhysicalResourceId.of(props.physicalResourceId)
            },

            policy: custom_resources.AwsCustomResourcePolicy.fromStatements([
                new aws_iam.PolicyStatement({
                    resources: [props.lambdaFunction.functionArn],
                    actions: ["lambda:*"],
                    effect: aws_iam.Effect.ALLOW,
                }),
            ]),
        });

        if (props.dependencies)
            props.dependencies.forEach((element) => lambdaCall.node.addDependency(element));
    }
}
