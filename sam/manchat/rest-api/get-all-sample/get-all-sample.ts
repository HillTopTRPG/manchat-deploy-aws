import { ddbDocClient } from '../commons'
import { ScanCommand } from "@aws-sdk/lib-dynamodb"

const tableName = process.env.TABLE_NAME

export const handler = async (event) => {
    if (event.httpMethod !== 'GET') {
        throw new Error(`getAllItems only accept GET method, you tried: ${event.httpMethod}`)
    }
    // All log statements are written to CloudWatch
    console.info('received:', event)

    // get all items from the table (only first 1MB data, you can use `LastEvaluatedKey` to get the rest of data)
    // https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/DynamoDB/DocumentClient.html#scan-property
    // https://docs.aws.amazon.com/amazondynamodb/latest/APIReference/API_Scan.html
    const params = {
        TableName : tableName
    }

    let items = null

    try {
        const data = await ddbDocClient.send(new ScanCommand(params))
        items = data.Items
    } catch (err) {
        console.log("Error", err)
    }

    const response = {
        statusCode: 200,
        body: JSON.stringify(items)
    }

    // All log statements are written to CloudWatch
    console.info(`response from: ${event.path} statusCode: ${response.statusCode} body: ${response.body}`)
    return response
}
