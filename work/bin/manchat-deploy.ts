#!/usr/bin/env node
import 'source-map-support/register'
import * as cdk from 'aws-cdk-lib'
import { ManchatDeployStack } from '../lib/manchat-deploy-stack'
import { MakeRepoStack } from '../lib/make-repo-stack'

const app = new cdk.App()
// For more information, see https://docs.aws.amazon.com/cdk/latest/guide/environments.html

const resourcePrefix = 'manchat-aws'
const props = {
  env: {
    account: process.env.AWS_ACCOUNT_ID,
    region: process.env.AWS_DEFAULT_REGION
  }
}

new ManchatDeployStack(app, 'ManchatDeployStack', resourcePrefix, props)
new MakeRepoStack(app, 'MakeRepoStack', resourcePrefix, props)