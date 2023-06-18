import { DynamoDBClient } from '@aws-sdk/client-dynamodb'
import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb'
export const ddbDocClient = DynamoDBDocumentClient.from(new DynamoDBClient({}))

import { GetCommand, GetCommandOutput } from '@aws-sdk/lib-dynamodb'

type ConnectionData = {
  id: string,
  roomId?: string,
  userId?: string
}

type RoomData = {
  id: string,
  token: string
}

type UserData = {
  id: string,
  token: string
}

async function getData<T>(tableName: string, id: string): Promise<T | undefined> {
  let result: T | undefined = undefined
  try {
    const data: GetCommandOutput = await ddbDocClient.send<T>(new GetCommand({
      TableName : tableName,
      Key: { id }
    }))
    result = data?.Item as T || undefined
  } catch (err) {
    // do nothing
  }
  return result
}

async function checkToken<T extends { token: string }>(tableName: string, id: string, token: string | null): Promise<boolean> {
  if (!token) {
    return false
  }
  let result = await getData<T>(tableName, id)
  return result?.token === token
}

async function fetchConnectionInfo(authorizationToken: string) {
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

  const connectionData = await getData<ConnectionData>(process.env.CONNECTION_TABLE_NAME, connectionId)

  if (!connectionData) {
    connectionId = null
  }
  let roomId = connectionData?.roomId || null
  let userId = connectionData?.userId || null

  if (roomId === 'Empty') {
    roomId = null
  }
  if (userId === 'Empty') {
    userId = null
  }

  const result = {
    connectionId,
    roomId,
    userId,
    isAuthorized: true
  }

  if (!connectionId || !roomId) {
    return result
  }
  result.isAuthorized = await checkToken<RoomData>(process.env.ROOM_TABLE_NAME, roomId, roomToken)
  if (!result.isAuthorized || !userId) {
    return result
  }
  result.isAuthorized = await checkToken<UserData>(process.env.USER_TABLE_NAME, userId, userToken)
  return result
}

export const handler = async (event) => {
  console.log(`event >`, JSON.stringify(event, null, 2))

  const {
    connectionId,
    roomId,
    userId
  } = await fetchConnectionInfo(event.authorizationToken)

  // const typesBase = `arn:aws:appsync:${process.env.AWS_REGION}:${event.accountId}:apis/${event.apiId}/types`
  const definedTypeFieldsBase = [
    // `${typesBase}/Room/fields/password`,
  ]
  const admitFields: string[] = []

  const ALL_OPERATIONS = [
    'Mutation.init',
    'Query.getRooms',
    'Query.getRoom',
    'Query.getUsers',
    'Query.getUser',
    'Query.getChats',
    'Mutation.addRoom',
    'Mutation.entryRoom',
    'Mutation.signUp',
    'Mutation.signIn',
    'Mutation.addChat',
  ]

  if (!connectionId) {
    // 初回接続
    admitFields.push('Mutation.init')
  } else if (!roomId) {
    // 未入室状態
    admitFields.push('Query.getRooms')
    admitFields.push('Mutation.addRoom')
    admitFields.push('Mutation.entryRoom')
  } else if (!userId) {
    // 未ログイン状態
    admitFields.push('Query.getRoom')
    admitFields.push('Query.getUsers')
    admitFields.push('Mutation.signUp')
    admitFields.push('Mutation.signIn')
    // 部屋検索はしてもいいよ
    admitFields.push('Query.getRooms')
  } else {
    // ログイン済
    admitFields.push('Query.getRoom')
    admitFields.push('Query.getUser')
    admitFields.push('Query.getChats')
    admitFields.push('Mutation.addChat')
    // 部屋検索はしてもいいよ
    admitFields.push('Query.getRooms')
  }

  const response = {
    isAuthorized: true,
    resolverContext: {
      connectionId,
      roomId,
      userId
    },
    deniedFields: [
      ...definedTypeFieldsBase,
      ...ALL_OPERATIONS.filter(d => admitFields.every(a => a !== d)),
    ],
    ttlOverride: 0,
  }

  console.log(`response >`, JSON.stringify(response, null, 2))
  return response;
}
