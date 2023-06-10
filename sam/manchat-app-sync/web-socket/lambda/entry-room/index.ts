import { DynamoDBClient } from '@aws-sdk/client-dynamodb'
import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb'
export const ddbDocClient = DynamoDBDocumentClient.from(new DynamoDBClient({}))

import { GetCommand, UpdateCommand } from '@aws-sdk/lib-dynamodb'

const connectionTableName = process.env.CONNECTION_TABLE_NAME
const roomTableName = process.env.ROOM_TABLE_NAME

export const handler = async (event) => {
  console.log(`event >`, JSON.stringify(event, null, 2))
  const {
    connectionId,
    input: { roomId, password },
  } = event

  let item = null

  try {
    const data = await ddbDocClient.send(new GetCommand({
      TableName : roomTableName,
      Key: { id: roomId },
    }))
    item = data?.Item
  } catch (err) {
    console.log("Error", err)
  }

  let response = null

  if (item && item.password === password) {
    response = item
    await ddbDocClient.send(new UpdateCommand({
      TableName : connectionTableName,
      Key: { id: connectionId },
      UpdateExpression: 'SET #roomId = :roomId',
      ExpressionAttributeNames: {
        '#roomId': 'roomId',
      },
      ExpressionAttributeValues: {
        ':roomId': roomId,
      }
    }))
  }
  console.log(`response >`, JSON.stringify(response, null, 2))
  return response
}
