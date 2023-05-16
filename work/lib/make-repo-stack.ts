import * as cdk from 'aws-cdk-lib'
import { Construct } from 'constructs'

import * as ecr from "aws-cdk-lib/aws-ecr"

import * as dotenv from "dotenv"

dotenv.config()

function createRepo(this: cdk.Stack, name: string) {
    const resourcePrefix = this.node.tryGetContext("ResourcePrefix")
    const repositoryName = `${resourcePrefix}-${name}`
    const repo = new ecr.Repository(this, `${name}ImageRepo`, {
      repositoryName,
      autoDeleteImages: true,
      imageScanOnPush: true,
      imageTagMutability: ecr.TagMutability.MUTABLE,
      removalPolicy: cdk.RemovalPolicy.DESTROY
    })
    cdk.Tags.of(repo).add("Name", `${repositoryName}-image-repo`)
}

export class MakeRepoStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props)

    // ECR(Nginx)
    createRepo.call(this, "nginx")

    // ECR(Rails)
    createRepo.call(this, "rails")

    // ECR(Vue)
    createRepo.call(this, "vue")
  }
}
