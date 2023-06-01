## manchat-deploy-aws
[manchat](https://github.com/HillTopTRPG/manchat)をAWSにデプロイするための環境です。

<details style='border: 1px solid; padding: 15px;'>
<summary><h5 style='display: inline;'>事前準備</h5></summary>

1. manchat-deploy-awsフォルダの直下に `.env.cdk` ファイルを作成する
2. `.env.cdk`ファイルに以下の内容を書き込む
   ```.env
   AWS_ACCESS_KEY_ID=[AWSのアクセスキーID]
   AWS_SECRET_ACCESS_KEY=[AWSのシークレットアクセスキー]
   AWS_ACCOUNT_ID=[AWSアカウントのID]
   
   RAILS_MASTER_KEY=[manchatリポジトリのmaster_key]

   DATABASE_NAME=[利用したいデータベースの名前]
   DATABASE_USERNAME=[利用したいデータベースのユーザー名]
   DATABASE_PASSWORD=[利用したいデータベースのパスワード]
   ```
   ※ 記入例
   ```.env
   AWS_ACCESS_KEY_ID=AKIA1ABCDE23F4GH56IJK
   AWS_SECRET_ACCESS_KEY=AbCDeFG1HIjkKMnO2QrstUvW3XYzaBcD45ef6g7H
   AWS_ACCOUNT_ID=987654321012
   
   RAILS_MASTER_KEY=11aa22bb33cc44dd55ee66ff77gg88hh
   
   DATABASE_NAME=app_production
   DATABASE_USERNAME=root
   DATABASE_PASSWORD=password
   ```
3. AWS CLIをインストールする
   https://aws.amazon.com/jp/cli/
</details>

## 起動の手順
### １．AWS CDK実行環境の立ち上げ
```shell
docker compose run --rm cdk
```
※ `manchat-deploy-aws` フォルダをカレントディレクトリとしたコンソールに入力する

### ２．環境初期化（初回のみ）
```
npm i
```
※ 手順１で立ち上げたdockerコンテナのコンソールにて実行すること

### ３．AWS CDK初期化（初回のみ）
```
cdk bootstrap
```
※ 手順２の実行が済み次第、同じコンソールに続けて入力する  
※ 進捗・状況は[AWS CloudFormation](https://console.aws.amazon.com/cloudformation)にて確認

### ４．リポジトリの作成
```
cdk deploy MakeRepoStack --require-approval never
```
※ 手順３の実行が済み次第、同じコンソールに続けて入力する

### ５．リポジトリのアップロード
AWS CLIの認証
```shell
aws ecr get-login-password --region [リージョン] | docker login --username AWS --password-stdin [アカウントID].dkr.ecr.[リージョン].amazonaws.com
```
nginxイメージのタグ付け & プッシュ
```shell
docker tag manchat_nginx:latest [アカウントID].dkr.ecr.[リージョン].amazonaws.com/manchat-aws-nginx:latest
docker push [アカウントID].dkr.ecr.[リージョン].amazonaws.com/manchat-aws-nginx:latest
```
railsイメージのタグ付け & プッシュ
```shell
docker tag manchat_rails:latest [アカウントID].dkr.ecr.[リージョン].amazonaws.com/manchat-aws-rails:latest
docker push [アカウントID].dkr.ecr.[リージョン].amazonaws.com/manchat-aws-rails:latest
```
vueイメージのタグ付け & プッシュ
```shell
docker tag manchat_vue:latest [アカウントID].dkr.ecr.[リージョン].amazonaws.com/manchat-aws-vue:latest
docker push [アカウントID].dkr.ecr.[リージョン].amazonaws.com/manchat-aws-vue:latest
```

### ６．構成要素の作成
```
cdk deploy ManchatDeployStack --require-approval never
```
※ 手順４で使ったコンソールにて実行すること
※ 進捗・状況は[AWS CloudFormation](https://console.aws.amazon.com/cloudformation)にて確認

## 停止の手順
### １．構成要素の削除
```
cdk destroy ManchatDeployStack --force
```
※ 起動手順の１で立ち上げたdockerコンテナのコンソールにて実行する  
　 もしコンソールを閉じていたら、同じコマンド `docker compose run --rm cdk` で起動する

### ２．リポジトリの削除（必要に応じて）
```
cdk destroy MakeRepoStack --force
```
※ 手順１の実行が済み次第、同じコンソールに続けて入力する
