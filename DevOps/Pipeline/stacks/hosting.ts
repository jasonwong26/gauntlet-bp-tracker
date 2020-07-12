import * as CDK from "@aws-cdk/core";
import * as ApiGateway from "@aws-cdk/aws-apigatewayv2";
import * as Route53 from "@aws-cdk/aws-route53";
import * as CloudFront from "@aws-cdk/aws-cloudfront";

export interface Props extends CDK.StackProps {
  api: {
    name: string,
    protocolType?: string,
    routeSelectionExpression?: string
  }
}

/* tslint:disable:no-unused-expression */
export class Stack extends CDK.Stack {
  constructor(scope: CDK.App, id: string, props: Props) {
    super(scope, id, props);
    
    const gateway = new ApiGateway.CfnApi(this, props.api.name, {
      name: props.api.name,
      protocolType: props.api.protocolType,
      routeSelectionExpression: props.api.routeSelectionExpression
    });

    new CDK.CfnOutput(this, "GatewayName", {
      value: gateway.name,
      description: "API Gateway Name"
    });
  }
}
