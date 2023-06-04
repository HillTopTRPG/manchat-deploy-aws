import { ddbDocClient } from '../commons'
import { GetCommand } from '@aws-sdk/lib-dynamodb'
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'

const tableName = process.env.TABLE_NAME

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  if (event.httpMethod !== 'GET') {
    throw new Error(`getMethod only accept GET method, you tried: ${event.httpMethod}`)
  }
  // All log statements are written to CloudWatch
  console.info('received:', event)
 
  // Get id from pathParameters from APIGateway because of `/{id}` at template.yaml
  const id = event.pathParameters.id
 
  // Get the item from the table
  // https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/DynamoDB/DocumentClient.html#get-property
  var params = {
    TableName : tableName,
    Key: { id: id },
  }

  try {
    const data = await ddbDocClient.send(new GetCommand(params))
    var item = data.Item
  } catch (err) {
    console.log("Error", err)
  }
 
  const response = {
    statusCode: 200,
    body: JSON.stringify(item)
  }
 
  // All log statements are written to CloudWatch
  console.info(`response from: ${event.path} statusCode: ${response.statusCode} body: ${response.body}`)
  return response
}
