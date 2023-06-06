import { DynamoDBClient } from '@aws-sdk/client-dynamodb'
import { DynamoDBDocumentClient, DeleteCommand } from '@aws-sdk/lib-dynamodb'
export const ddbDocClient = DynamoDBDocumentClient.from(new DynamoDBClient({}))

const tableName = process.env.TABLE_NAME

export const handler = async event => {
    const params = {
        TableName: tableName,
        Key: {
            connectionId: event.requestContext.connectionId
        }
    }

    try {
        await ddbDocClient.send(new DeleteCommand(params))
    } catch (err) {
        return { statusCode: 500, body: 'Failed to disconnect: ' + JSON.stringify(err) }
    }

    return { statusCode: 200, body: 'Disconnected.' }
};