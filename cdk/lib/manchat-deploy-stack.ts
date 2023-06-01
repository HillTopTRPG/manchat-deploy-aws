import * as cdk from 'aws-cdk-lib/core'
import { Construct } from 'constructs'
import { uuid } from 'uuidv4'

import * as ec2 from 'aws-cdk-lib/aws-ec2'
import * as ecs from 'aws-cdk-lib/aws-ecs'
import * as rds from 'aws-cdk-lib/aws-rds'
import * as logs from 'aws-cdk-lib/aws-logs'
import * as elasticcache from 'aws-cdk-lib/aws-elasticache'
import * as ecr from 'aws-cdk-lib/aws-ecr'
import * as ecs_patterns from 'aws-cdk-lib/aws-ecs-patterns'
import {
  aws_s3 as s3,
  aws_cloudfront,
  aws_cloudfront_origins,
  aws_s3_deployment as s3Deploy,
  aws_iam as iam,
  aws_lambda_nodejs,
  Duration,
  aws_apigateway
} from 'aws-cdk-lib'
import { Runtime } from 'aws-cdk-lib/aws-rest-api'

import * as dotenv from 'dotenv'

dotenv.config()

function createVpc(this: cdk.Stack, tagName: string) {
  const vpc = new ec2.Vpc(this, 'vpc', {
    ipAddresses: ec2.IpAddresses.cidr('10.0.0.0/16'),
    enableDnsHostnames: true,
    enableDnsSupport: true,
    subnetConfiguration: [
      {
        cidrMask: 24,
        name: 'public',
        subnetType: ec2.SubnetType.PUBLIC
      }
    ]
  })
  cdk.Tags.of(vpc).add('Name', tagName)
  return vpc
}

function createRedis(this: cdk.Stack, vpc: ec2.Vpc) {
  // ElasticCache
  // ElasticCache用のセキュリティグループ
  const sampleCacheRedisSecurityGroup = new ec2.SecurityGroup(this, 'SampleCacheRedisSecurityGroup', {
    vpc,
    allowAllOutbound: true,
    description: 'security-group-for-sample-cache-redis',
    securityGroupName: 'sample-cache-redis-security-group'
  })
  sampleCacheRedisSecurityGroup.addIngressRule(ec2.Peer.ipv4('0.0.0.0/0'), ec2.Port.tcp(6379))

  // ElasticCache用のサブネットグループ
  const cacheSubnetGroup = new elasticcache.CfnSubnetGroup(this, 'CacheSubnetGroup', {
    cacheSubnetGroupName: 'sample-cache-subnet-group',
    description: 'subnet-group-for-cache',
    subnetIds: vpc.publicSubnets.map(s => s.subnetId)
  })

  const redis = new elasticcache.CfnCacheCluster(this, 'RedisCacheCluster', {
    clusterName: 'manchat-redis',
    engine: 'redis',
    port: 6379,
    cacheNodeType: 'cache.t2.micro',
    numCacheNodes: 1,
    vpcSecurityGroupIds: [sampleCacheRedisSecurityGroup.securityGroupId],
    cacheSubnetGroupName: cacheSubnetGroup.cacheSubnetGroupName
  })
  redis.node.addDependency(sampleCacheRedisSecurityGroup)
  redis.node.addDependency(cacheSubnetGroup)

  return redis
}

function createSecurityGroup(this: cdk.Stack, vpc: ec2.Vpc, name: string, port: number, tagName: string) {
  const sg = new ec2.SecurityGroup(this, name, { vpc, allowAllOutbound: true })
  sg.addIngressRule(ec2.Peer.anyIpv4(), ec2.Port.tcp(port))
  sg.addEgressRule(ec2.Peer.anyIpv4(), ec2.Port.allTraffic())
  cdk.Tags.of(sg).add('Name', tagName)
  return sg
}

function createRds(this: cdk.Stack, vpc: ec2.Vpc, dbSg: any, tagName: string, port: number) {
  const databaseName = 'manchat_mysql'
  const db = new rds.DatabaseInstance(this, databaseName, {
    vpc,
    vpcSubnets: {
      subnets: vpc.publicSubnets
    },
    engine: rds.DatabaseInstanceEngine.mysql({ version: rds.MysqlEngineVersion.VER_8_0 }),
    instanceIdentifier: tagName,
    instanceType:  ec2.InstanceType.of(ec2.InstanceClass.T2, ec2.InstanceSize.MICRO),
    allocatedStorage: 20,
    storageType: rds.StorageType.GP2,
    databaseName,
    credentials: {
      username: process.env.MYSQL_USER || 'root',
      password: cdk.SecretValue.plainText(process.env.MYSQL_PASSWORD || '')
    },
    port,
    multiAz: true,
    securityGroups: [dbSg],
    removalPolicy: cdk.RemovalPolicy.DESTROY
  })
  cdk.Tags.of(db).add('Name', tagName)
  return db
}

function createCluster(this: cdk.Stack, vpc: ec2.Vpc, tagName: string) {
  const cluster = new ecs.Cluster(this, 'cluster', {
    vpc,
    clusterName: tagName
  })
  cdk.Tags.of(cluster).add('Name', tagName)
  return cluster
}

function createLogGroup(this: cdk.Stack, name: string, tagName: string) {
  const logGroup = new logs.LogGroup(this, 'logGroup', {
    logGroupName: name,
    removalPolicy: cdk.RemovalPolicy.DESTROY,
    retention: logs.RetentionDays.ONE_WEEK
  })
  cdk.Tags.of(logGroup).add('Name', tagName)
  return logGroup
}

function createApiGateway(this: cdk.Stack) {
  const restApi = new aws_apigateway.RestApi(this, 'Rest API with Lambda auth', {
    restApiName: `Rest_API_with_Lambda_auth`,
    deployOptions: {
      stageName: 'v1',
    },
  })

  // /api/v1/rooms.json
  const roomsFuncName: string = 'rooms_func'
  restApi.root.addResource('api').addResource('v1').addResource('rooms.json').addMethod(
    'GET',
    new aws_apigateway.LambdaIntegration(
      new aws_lambda_nodejs.NodejsFunction(
        this,
        roomsFuncName,
        {
          runtime: Runtime.NODEJS_18_X,
          functionName: roomsFuncName,
          entry: 'rest-api/handlers/rooms-func.ts',
          timeout: Duration.seconds(25),
          logRetention: 30,
          bundling: {
            forceDockerBundling: false,
            define: {},
            minify: true,
            externalModules: ['aws-sdk'],
          }
        },
      )
    )
  )
  return restApi
}

function createS3Bucket(this: cdk.Stack) {
//function createS3Bucket(this: cdk.Stack, restApi: aws_apigateway.RestApi) {
  const bucket = new s3.Bucket(this, 'ManchatBucket', {
    bucketName: `manchat-${uuid()}`,
//    encryption: s3.BucketEncryption.S3_MANAGED,
    enforceSSL: true,
    versioned: false,
    blockPublicAccess: s3.BlockPublicAccess.BLOCK_ACLS,
    accessControl: s3.BucketAccessControl.BUCKET_OWNER_FULL_CONTROL,
    removalPolicy: cdk.RemovalPolicy.DESTROY,
//    websiteIndexDocument: 'index.html',
    autoDeleteObjects: true
  })
//  bucket.addToResourcePolicy(new iam.PolicyStatement({
//                                                       effect: iam.Effect.ALLOW,
//                                                       principals: [new iam.ArnPrincipal('*')],
//                                                       actions: [
//                                                         's3:GetBucketLocation',
//                                                         's3:ListBucket'
//                                                       ],
//                                                       resources: [bucket.bucketArn]
//                                                     }))

//  const originAccessIdentity = new aws_cloudfront.OriginAccessIdentity(
//    this,
//    'OriginAccessIdentity',
//    {
//      comment: 'website-distribution-originAccessIdentity',
//    }
//  )
//
//  bucket.addToResourcePolicy(new iam.PolicyStatement({
//                                                       effect: iam.Effect.ALLOW,
//                                                       principals: [
//                                                         new iam.CanonicalUserPrincipal(
//                                                           originAccessIdentity.cloudFrontOriginAccessIdentityS3CanonicalUserId
//                                                         )
//                                                       ],
//                                                       actions: ['s3:GetObject'],
//                                                       resources: [bucket.bucketArn + '/*']
//                                                     }))

//  const distribution = new aws_cloudfront.Distribution(this, 'distribution', {
//    comment: 'website-distribution',
//    defaultRootObject: 'index.html',
//    errorResponses: [
//      {
//        ttl: cdk.Duration.seconds(5),
//        httpStatus: 403,
//        responseHttpStatus: 200,
//        responsePagePath: '/index.html',
//      },
//      {
//        ttl: cdk.Duration.seconds(5),
//        httpStatus: 404,
//        responseHttpStatus: 200,
//        responsePagePath: '/index.html',
//      },
//    ],
//    additionalBehaviors: { '/api/*' :{ origin: new aws_cloudfront_origins.RestApiOrigin(restApi) } },
//    defaultBehavior: {
//      viewerProtocolPolicy: aws_cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
//      origin: new aws_cloudfront_origins.S3Origin(bucket),
//    },
//    priceClass: aws_cloudfront.PriceClass.PRICE_CLASS_ALL,
//  })

  // アクセス例
  // https://manchat-13039330-ba08-4100-b4a4-ee21568e8cdc.s3.ap-northeast-1.amazonaws.com/index.html
  new s3Deploy.BucketDeployment(this, 'DeployLocal', {
    sources: [s3Deploy.Source.asset('s3/manchat')],
    destinationBucket: bucket,
//    distribution: distribution,
//    distributionPaths: ['/*'],
  })
  return bucket
}

export class ManchatDeployStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props)

//    const resourcePrefix = this.node.tryGetContext('ResourcePrefix')
//
//    // VPC（次の記述だけでそれに紐づいたサブネット、インターネットゲートウェイ、ルートテーブルも同時に作成される）
//    const vpc = createVpc.call(this, `${resourcePrefix}-vpc`)
//
//    // Redis
//    const redis = createRedis.call(this, vpc)

    const restApi = createApiGateway.call(this)

    // S3
    createS3Bucket.call(this)
//    createS3Bucket.call(this, restApi)

//    const rdbPort = Number(process.env.MYSQL_PORT || "3306")
//
//    // セキュリティグループ(DB用)
//    const dbSg = createSecurityGroup.call(this, vpc, 'dbSg', rdbPort, `${resourcePrefix}-db-Sg`)
//
//    // データベース(RDS)
//    const db = createRds.call(this, vpc, dbSg, `${resourcePrefix}-db`, rdbPort)
//
//    // ロググループ
//    const logGroup = createLogGroup.call(this, '/aws/cdk/ecs/sample', `${resourcePrefix}-log-group`)
//
//    // クラスター
//    const cluster = createCluster.call(this, vpc, `${resourcePrefix}-cluster`)
//    const namespace = cluster.addDefaultCloudMapNamespace({
//                                                            name: 'local',
//                                                          })
//
//    // Rails
//    const railsTask = new ecs.FargateTaskDefinition(this, `taskDefinition-${resourcePrefix}-rails`)
//    const railsContainer = railsTask.addContainer(`rails`, {
//      image: ecs.ContainerImage.fromEcrRepository(
//        ecr.Repository.fromRepositoryName(this, `railsImageRepo`, `${resourcePrefix}-rails`)
//      ),
//      portMappings: [{ name: 'rails', containerPort: 3000 }],
//      logging: ecs.LogDriver.awsLogs({
//                                       streamPrefix: 'rails',
//                                       logGroup
//                                     }),
//      workingDirectory: '/app',
//      environment: {
//        MYSQL_HOST: db.dbInstanceEndpointAddress,
//        MYSQL_PORT: process.env.MYSQL_PORT || '',
//        MYSQL_USER: process.env.MYSQL_USER || '',
//        MYSQL_PASSWORD: process.env.MYSQL_PASSWORD || '',
//        REDIS_URL: redis.attrRedisEndpointAddress,
//        RAILS_ENV: 'production',
//        RAILS_MASTER_KEY: process.env.RAILS_MASTER_KEY || '',
//        TZ: 'Japan'
//      },
//      command: ['bash', '-c', 'bundle exec rails assets:precompile && bundle exec puma -C config/puma.rb']
//    })
//    railsContainer.node.addDependency(logGroup)
//    railsContainer.node.addDependency(db)
//    railsContainer.node.addDependency(redis)
//    const railsServiceName = `${resourcePrefix}-rails-service`
//    const railsServer = new ecs.FargateService(this, railsServiceName, {
//      cluster,
//      taskDefinition: railsTask,
//      serviceName: railsServiceName,
//      serviceConnectConfiguration: {
//        services: [
//          {
//            portMappingName: 'rails',
//            port: 3000,
//            discoveryName: 'rails-server'
//          },
//        ],
//        logDriver: ecs.LogDrivers.awsLogs({
//                                            streamPrefix: 'rails',
//                                            logGroup
//                                          }),
//      },
//    })
//    railsServer.node.addDependency(namespace)
//
//    const vueTask = new ecs.FargateTaskDefinition(this, `taskDefinition-${resourcePrefix}-vue`)
//    const vueContainer = vueTask.addContainer('vue', {
//      image: ecs.ContainerImage.fromEcrRepository(
//        ecr.Repository.fromRepositoryName(this, `vueImageRepo`, `${resourcePrefix}-vue`)
//      ),
//      portMappings: [{ name: 'vue', containerPort: 3120 }],
//      logging: ecs.LogDriver.awsLogs({
//                                       streamPrefix: 'vue',
//                                       logGroup
//                                     }),
//      workingDirectory: '/app',
//      environment: { NODE_ENV: 'product' },
//      command: ['yarn', 'dev']
//    })
//    vueContainer.node.addDependency(logGroup)
//    const vueServiceName = `${resourcePrefix}-vue-service`
//    const vueServer = new ecs.FargateService(this, vueServiceName, {
//      cluster,
//      taskDefinition: vueTask,
//      serviceName: vueServiceName,
//      serviceConnectConfiguration: {
//        services: [
//          {
//            portMappingName: 'vue',
//            port: 3120,
//            discoveryName: 'vue-server'
//          },
//        ],
//        logDriver: ecs.LogDrivers.awsLogs({
//                                            streamPrefix: 'vue',
//                                            logGroup
//                                          }),
//      },
//    })
//    vueServer.node.addDependency(namespace)
//
////    // セキュリティグループ(ALB用)
////    const albSg = createSecurityGroup.call(this, vpc, 'albSg', 80, `${resourcePrefix}-alb-Sg`)
//
//    // Nginx
//    const nginxTask = new ecs.FargateTaskDefinition(this, `taskDefinition-${resourcePrefix}-nginx`)
//    const nginxContainer = nginxTask.addContainer('nginx', {
//      image: ecs.ContainerImage.fromEcrRepository(
//        ecr.Repository.fromRepositoryName(this, `nginxImageRepo`, `${resourcePrefix}-nginx`)
//      ),
//      portMappings: [{ name: 'nginx', containerPort: 80 }],
//      logging: ecs.LogDriver.awsLogs({
//                                       streamPrefix: 'nginx',
//                                       logGroup
//                                     }),
//      environment: {
//        NGINX_PORT: '80',
//        RAILS_HOST: 'rails-server',
//        RAILS_PORT: '3000',
//        VUE_HOST: 'vue-server',
//        VUE_PORT: '3120'
//      }
//    })
//    nginxContainer.node.addDependency(logGroup)
//    const nginxServiceName = `${resourcePrefix}-nginx-service`
////    const nginxServer = new ecs_patterns.ApplicationLoadBalancedFargateService(this, nginxServiceName, {
////      cluster,
////      taskDefinition: nginxTask,
////      serviceName: nginxServiceName,
////      loadBalancerName: `${resourcePrefix}-nginx-lb`,
////      assignPublicIp: true,
////      publicLoadBalancer: true,
////      memoryLimitMiB: 512, // default: 512
////      cpu: 256, // default: 256
//////      securityGroups: [albSg, dbSg]
////    })
//    const nginxServer = new ecs.FargateService(this, nginxServiceName, {
//      cluster,
//      taskDefinition: nginxTask,
//      serviceName: nginxServiceName,
//      serviceConnectConfiguration: {
//        services: [
//          {
//            portMappingName: 'nginx',
//            port: 80,
//            discoveryName: 'nginx-server'
//          },
//        ],
//        logDriver: ecs.LogDrivers.awsLogs({
//                                            streamPrefix: 'nginx',
//                                            logGroup
//                                          }),
//      },
//    })
//    nginxServer.node.addDependency(namespace)
  }
}
