import { DynamoDBClient } from '@aws-sdk/client-dynamodb'
import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb'
export const ddbDocClient = DynamoDBDocumentClient.from(new DynamoDBClient({}))

import { GetCommand } from '@aws-sdk/lib-dynamodb'

const tableName = process.env.TABLE_NAME

export const handler = async (event) => {
  console.log(`event >`, JSON.stringify(event, null, 2));
  const {
    authorizationToken,
    requestContext: { apiId, accountId },
  } = event

  let item = null

  try {
    const data = await ddbDocClient.send(new GetCommand({
      TableName : tableName,
      Key: { id: authorizationToken },
    }))
    item = data?.Item
  } catch (err) {
    console.log("Error", err)
  }

  const typesBase = `arn:aws:appsync:${process.env.AWS_REGION}:${accountId}:apis/${apiId}/types`
  const definedTypeFieldsBase = [
    `${typesBase}/Room/fields/password`,
    `${typesBase}/User/fields/password`,
  ]

  const response = {
    // ここがfalseの場合は認証失敗になる
    isAuthorized: true,
    // 後続処理に渡せる情報。vtlやリゾルバーに渡す値として利用できる
    // ここで権限チェック系の共通処理の結果を渡してあげるとよさそう
    resolverContext: {
      connectionId: authorizationToken,
    },
    // 拒否するfieldを選択できる
    deniedFields: [
      ...definedTypeFieldsBase,
      // 禁止mutation
      `Mutation.addConnection`,
    ],
    ttlOverride: 0,
  };
  console.log(`response >`, JSON.stringify(response, null, 2));
  return response;
}
