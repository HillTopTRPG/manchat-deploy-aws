import * as cdk from 'aws-cdk-lib'
import { Construct } from 'constructs'

import * as ecr from "aws-cdk-lib/aws-ecr"

import * as dotenv from "dotenv"

dotenv.config()

function createRepo(this: cdk.Stack, name: string, resoucePrefix: string) {
    const repositoryName = `${resoucePrefix}-${name}`
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
  constructor(scope: Construct, id: string, resoucePrefix: string, props?: cdk.StackProps) {
    super(scope, id, props)

    // ECR(Nginx)
    createRepo.call(this, "nginx", resoucePrefix)

    // ECR(App)
    createRepo.call(this, "app", resoucePrefix)

    // ECR(Vue)
    createRepo.call(this, "vue", resoucePrefix)
  }
}
