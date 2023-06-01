import * as cdk from 'aws-cdk-lib'
import { Construct } from 'constructs'

import * as ec2 from 'aws-cdk-lib/aws-ec2'
import * as ecs from "aws-cdk-lib/aws-ecs"
import * as ecs_patterns from "aws-cdk-lib/aws-ecs-patterns"
import * as iam from "aws-cdk-lib/aws-iam"
import * as ecr from "aws-cdk-lib/aws-ecr"
import * as s3 from "aws-cdk-lib/aws-s3"
import * as rds from "aws-cdk-lib/aws-rds"
import * as logs from "aws-cdk-lib/aws-logs"
import { uuid } from 'uuidv4'

import * as dotenv from "dotenv"

dotenv.config()

function createRepo(this: cdk.Stack, name: string, resourcePrefix: string) {
    const repositoryName = `${resourcePrefix}-${name}`
    const repo = new ecr.Repository(this, `${name}ImageRepo`, {
      repositoryName,
      imageScanOnPush: true,
      imageTagMutability: ecr.TagMutability.MUTABLE
    })
    cdk.Tags.of(repo).add("Name", `${repositoryName}-image-repo`)
    return repo
}

function createVpc(this: cdk.Stack, tagName: string) {
   const vpc = new ec2.Vpc(this, "vpc", {
      ipAddresses: ec2.IpAddresses.cidr('10.0.0.0/16'),
      enableDnsHostnames: true,
      enableDnsSupport: true,
      subnetConfiguration: [
        {
          cidrMask: 24,
          name: "public",
          subnetType: ec2.SubnetType.PUBLIC
        }
      ]
    })
    cdk.Tags.of(vpc).add("Name", tagName)
    return vpc
}

function createSequrityGroup(this: cdk.Stack, vpc: any, name: string, port: number, tagName: string) {
    const sg = new ec2.SecurityGroup(this, name, { vpc, allowAllOutbound: true })
    sg.addIngressRule(ec2.Peer.anyIpv4(), ec2.Port.tcp(port))
    sg.addEgressRule(ec2.Peer.anyIpv4(), ec2.Port.allTraffic())
    cdk.Tags.of(sg).add("Name", tagName)
    return sg
}

function createRds(this: cdk.Stack, vpc: any, dbSg: any, tagName: string, port: number) {
    const db = new rds.DatabaseInstance(this, "db", {
      vpc,
      vpcSubnets: {
        subnets: vpc.publicSubnets
      },
      engine: rds.DatabaseInstanceEngine.mysql({ version: rds.MysqlEngineVersion.VER_8_0 }),
      instanceIdentifier: tagName,
      instanceType:  ec2.InstanceType.of(ec2.InstanceClass.T2, ec2.InstanceSize.MICRO),
      allocatedStorage: 20,
      storageType: rds.StorageType.GP2,
      databaseName: process.env.DATABASE_NAME || "",
      credentials: {
        username: process.env.DATABASE_USERNAME || "",
        password: cdk.SecretValue.plainText(process.env.DATABASE_PASSWORD || "")
      },
      port,
      multiAz: true,
      securityGroups: [dbSg]
    })
    cdk.Tags.of(db).add("Name", tagName)
    return db
}

function createCluster(this: cdk.Stack, vpc: any, tagName: string) {
    const cluster = new ecs.Cluster(this, "cluster", {
      vpc,
      clusterName: tagName
    })
    cdk.Tags.of(cluster).add("Name", tagName)
    return cluster
}

function createLogGroup(this: cdk.Stack, name: string, tagName: string) {
    const logGroup = new logs.LogGroup(this, "logGroup", {
      logGroupName: name
    })
    cdk.Tags.of(logGroup).add("Name", tagName)
    return logGroup
}

function createFargateTaskDefinition(this: cdk.Stack, resourcePrefix: string) {
    // IAMロール
    const ecsTaskExecutionRole = new iam.Role(this, "ecsTaskExecutionRole", {
      roleName: "ecs-task-execution-role",
      assumedBy: new iam.ServicePrincipal("ecs-tasks.amazonaws.com"),
      managedPolicies: [
        iam.ManagedPolicy.fromAwsManagedPolicyName("service-role/AmazonECSTaskExecutionRolePolicy"),
        iam.ManagedPolicy.fromAwsManagedPolicyName("AmazonSSMReadOnlyAccess")
      ]
    })
    cdk.Tags.of(ecsTaskExecutionRole).add("Name", `${resourcePrefix}-ecs-task-execution-role`)

    // タスク定義
    const taskDefinition = new ecs.FargateTaskDefinition(this, "taskDefinition", {
      family: `${resourcePrefix}-app-nginx`,
      cpu: 512,
      memoryLimitMiB: 1024,
      executionRole: ecsTaskExecutionRole,
      taskRole: ecsTaskExecutionRole
    })
    cdk.Tags.of(taskDefinition).add("Name", `${resourcePrefix}-task-definition`)
    return taskDefinition
}

function createContainerDefinition(
    this: cdk.Stack,
    logGroup: any,
    resourcePrefix: string,
    taskDefinition: any,
    containerName: string,
    additionalOptions: any
) {
    const appContainer = new ecs.ContainerDefinition(this, `${containerName}Container`, {
      containerName,
      taskDefinition,
      image: ecs.ContainerImage.fromEcrRepository(
        ecr.Repository.fromRepositoryName(this, `${containerName}Image`, `${resourcePrefix}-${containerName}`)
      ),
      logging: ecs.LogDriver.awsLogs({
        streamPrefix: "production",
        logGroup
      }),
      workingDirectory: "/myapp",
      essential: true,
      ...additionalOptions
    })
    return appContainer
}

export class ManchatDeployStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // The code that defines your stack goes here

    // example resource
    // const queue = new sqs.Queue(this, 'ManchatDeployQueue', {
    //   visibilityTimeout: cdk.Duration.seconds(300)
    // });
    


    // 各リソースの接頭語
    const resourcePrefix: string = "manchat-aws"
    const serviceSecurityGroups: any[] = []
    

    // ECR(App)
    const appImageRepo = createRepo.call(this, "app", resourcePrefix)

    // ECR(Nginx)
    const nginxImageRepo = createRepo.call(this, "nginx", resourcePrefix)

    // VPC（次の記述だけでそれに紐づいたサブネット、インターネットゲートウェイ、ルートテーブルも同時に作成される）
    const vpc = createVpc.call(this, `${resourcePrefix}-vpc`)

    // セキュリティグループ(ALB用)
    const albSg = createSequrityGroup.call(this, vpc, "albSg", 80, `${resourcePrefix}-alb-Sg`)
    serviceSecurityGroups.push(albSg)

    // セキュリティグループ(DB用)
    const dbSg = createSequrityGroup.call(this, vpc, "dbSg", 3306, `${resourcePrefix}-db-Sg`)
    serviceSecurityGroups.push(dbSg)

    // データベース(RDS)
    const db = createRds.call(this, vpc, dbSg, `${resourcePrefix}-db`, 3306)

    // ロググループ
    const logGroup = createLogGroup.call(this, "/aws/cdk/ecs/sample", `${resourcePrefix}-log-group`)

    // タスク定義
    const taskDefinition = createFargateTaskDefinition.call(this, resourcePrefix)

    const wrapCreateContainerDefinition = createContainerDefinition.bind(
        this,
        logGroup,
        resourcePrefix,
        taskDefinition
    )

    // コンテナ定義（App）
    const appContainer = wrapCreateContainerDefinition("app", {
      // 環境変数
      environment: {
        DATABASE_HOST: db.dbInstanceEndpointAddress,
        DATABASE_NAME: process.env.DATABASE_NAME || "",
        DATABASE_PASSWORD: process.env.DATABASE_PASSWORD || "",
        DATABASE_USERNAME: process.env.DATABASE_USERNAME || "",
        RAILS_ENV: "production",
        RAILS_MASTER_KEY: process.env.RAILS_MASTER_KEY || "",
        TZ: "Japan"
      },
      command: [
        "bash",
        "-c",
        "bundle exec rails db:migrate && bundle exec rails assets:precompile && bundle exec puma -C config/puma.rb"
//        "bundle exec bundle exec rails assets:precompile && bundle exec puma -C config/puma.rb"
      ]
    })

    // コンテナ定義（Nginx）
    const nginxContainer = wrapCreateContainerDefinition("nginx", {
      portMappings: [
        {
          protocol: ecs.Protocol.TCP,
          containerPort: 80
        }
      ]
    })

    // Appコンテナをボリュームとして指定
    nginxContainer.addVolumesFrom({
      sourceContainer: "app",
      readOnly: false
    })

    // デフォルトのコンテナをNginxコンテナに指定
    taskDefinition.defaultContainer = nginxContainer

    // クラスター
    const cluster = createCluster.call(this, vpc, `${resourcePrefix}-cluster`)

    // サービス（次の記述だけでそれに紐づいたロードバランサーやターゲットグループが同時に作成される）
    const service = new ecs_patterns.ApplicationLoadBalancedFargateService(this, "service", {
      serviceName: `${resourcePrefix}-service`,
      cluster,
      memoryLimitMiB: 1024, // default: 512
      cpu: 512, // default: 256
      loadBalancerName: `${resourcePrefix}-lb`,
      assignPublicIp: true,
      publicLoadBalancer: true,
      securityGroups: serviceSecurityGroups,
      taskDefinition,
      desiredCount: 1,
    })
    cdk.Tags.of(service).add("Name", `${resourcePrefix}-service`)

/*
    // S3（ログ保管場所）
    const albLogsBucket = new s3.Bucket(this, `alb-logs-bucket-${uuid()}`) // バケット名は全世界においてユニークである必要があるのでuuidを使用
    cdk.Tags.of(albLogsBucket).add("Name", `${resourcePrefix}-alb-logs-bucket`)
    service.loadBalancer.logAccessLogs(albLogsBucket)
*/
  }
}
