import {DynamoDBClient} from '@aws-sdk/client-dynamodb'
import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb'
import { uuid } from 'uuidv4'
export const ddbDocClient = DynamoDBDocumentClient.from(new DynamoDBClient({}))

import { GetCommand, PutCommand, GetCommandOutput } from '@aws-sdk/lib-dynamodb'

const ALL_OPERATIONS = [
  'Query.getConnectionId',
  'Query.getRooms',
  'Query.getUsers',
  'Query.getChats',
  'Mutation.addRoom',
  'Mutation.entryRoom',
  'Mutation.signUp',
  'Mutation.signIn',
  'Mutation.addChat',
]

const connectionTableName = process.env.CONNECTION_TABLE_NAME
const roomTableName = process.env.ROOM_TABLE_NAME
const userTableName = process.env.USER_TABLE_NAME

export const handler = async (event) => {
  console.log(`event >`, JSON.stringify(event, null, 2))

  const {
    authorizationToken,
    requestContext: { apiId, accountId },
  } = event

  const typesBase = `arn:aws:appsync:${process.env.AWS_REGION}:${accountId}:apis/${apiId}/types`
  const definedTypeFieldsBase = []
  const admitFields: string[] = []

  const authSplit = authorizationToken.split('/')

  let connectionId = authSplit[0]
  let roomToken: string | null = null
  let userToken: string | null = null
  if (authSplit.length > 1) {
    roomToken = authSplit[1]
  }
  if (authSplit.length > 2) {
    userToken = authSplit[2]
  }

  type ConnectionData = {
    id: string,
    roomId?: string,
    userId?: string
  }
  let connectionData: ConnectionData | null = null

  type RoomData = {
    id: string,
    token: string
  }
  let roomData: RoomData | null = null

  type UserData = {
    id: string,
    token: string
  }
  let userData: UserData | null = null

  try {
    const data: GetCommandOutput = await ddbDocClient.send<ConnectionData>(new GetCommand({
      TableName : connectionTableName,
      Key: { id: connectionId },
    }))
    connectionData = data?.Item as ConnectionData || null
  } catch (err) {
    // do nothing
  }

  if (!connectionData) {
    // 初回接続の際はconnectionIdの取得が最優先
    admitFields.push('Query.getConnectionId')
    connectionId = uuid()
    await ddbDocClient.send(new PutCommand({
      TableName : connectionTableName,
      Item: {
        id: connectionId,
      },
    }))
  } else if (!connectionData.roomId) {
    // 未入室状態なら入室が最優先
    admitFields.push('Query.getRooms')
    admitFields.push('Mutation.addRoom')
    admitFields.push('Mutation.entryRoom')
  } else {
    // 入室状態
    try {
      const data: GetCommandOutput = await ddbDocClient.send<RoomData>(new GetCommand({
        TableName : roomTableName,
        Key: { id: connectionData.roomId },
      }))
      roomData = data?.Item as RoomData || null
    } catch (err) {
      // do nothing
    }
    if (!roomData || roomData.token !== roomToken) {
      // 認証失敗
      return {
        isAuthorized: false,
        ttlOverride: 0
      }
    }

    if (!connectionData.userId) {
      // 未ログイン状態ならログインが最優先
      admitFields.push('Query.getUsers')
      admitFields.push('Mutation.signUp')
      admitFields.push('Mutation.signIn')
    } else {
      // ログイン状態
      try {
        const data: GetCommandOutput = await ddbDocClient.send<UserData>(new GetCommand({
          TableName : userTableName,
          Key: { id: connectionData.userId },
        }))
        userData = data?.Item as UserData || null
      } catch (err) {
        // do nothing
      }
      if (!userData || userData.token !== userToken) {
        // 認証失敗
        return {
          isAuthorized: false,
          ttlOverride: 0
        }
      }
      admitFields.push('Query.getChats')
      admitFields.push('Mutation.addChat')
    }
  }

  const response = {
    // ここがfalseの場合は認証失敗になる
    isAuthorized: true,
    // 後続処理に渡せる情報。vtlやリゾルバーに渡す値として利用できる
    // ここで権限チェック系の共通処理の結果を渡してあげるとよさそう
    resolverContext: {
      connectionId: connectionId,
    },
    // 拒否するfieldを選択できる
    deniedFields: [
      ...definedTypeFieldsBase,
      ...ALL_OPERATIONS.filter(d => admitFields.every(a => a !== d)),
    ],
    ttlOverride: 0,
  }
  console.log(`response >`, JSON.stringify(response, null, 2))
  return response;
}
