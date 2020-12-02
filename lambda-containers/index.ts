import * as aws from "@pulumi/aws";
import * as awsx from "@pulumi/awsx";
import * as pulumi from "@pulumi/pulumi";

const image = awsx.ecr.buildAndPushImage("sampleapp", {
    context: "./app",
});
const role = new aws.iam.Role("lambdaRole", {
    assumeRolePolicy: aws.iam.assumeRolePolicyForPrincipal({ Service: "lambda.amazonaws.com" }),
});
new aws.iam.RolePolicyAttachment("lambdaFullAccess", {
    role: role.name,
    policyArn: aws.iam.ManagedPolicies.AWSLambdaFullAccess,
});

const func = new aws.lambda.Function("helloworld", {
    packageType: "Image",
    imageUri: image.imageValue,
    role: role.arn,
    timeout: 60,
});

// Create an API endpoint
const endpoint = new awsx.apigateway.API("hello-world", {
    routes: [{
        path: "/{route+}",
        method: "GET",
        eventHandler: func,
    }],
});

export const invokeUrl = pulumi.interpolate`${endpoint.url}World`;
