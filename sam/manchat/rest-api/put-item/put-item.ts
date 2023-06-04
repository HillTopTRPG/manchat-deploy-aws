import { ddbDocClient } from '../commons'
import { PutCommand } from '@aws-sdk/lib-dynamodb'

const tableName = process.env.TABLE_NAME

export const handler = async (event) => {
    if (event.httpMethod !== 'POST') {
        throw new Error(`postMethod only accepts POST method, you tried: ${event.httpMethod} method.`)
    }
    // All log statements are written to CloudWatch
    console.info('received:', event)

    // Get id and name from the body of the request
    const body = JSON.parse(event.body)
    const id = body.id
    const name = body.name

    // Creates a new item, or replaces an old item with a new item
    // https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/DynamoDB/DocumentClient.html#put-property
    var params = {
        TableName : tableName,
        Item: { id : id, name: name }
    }

    try {
        const data = await ddbDocClient.send(new PutCommand(params))
        console.log("Success - item added or updated", data)
    } catch (err) {
        console.log("Error", err.stack)
        throw new Error(`Invalid params: ${JSON.stringify(params)}`)
    }

    const response = {
        statusCode: 200,
        body: JSON.stringify(body)
    }

    // All log statements are written to CloudWatch
    console.info(`response from: ${event.path} statusCode: ${response.statusCode} body: ${response.body}`)
    return response
}
