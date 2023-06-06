import { ApiGatewayManagementApi } from "aws-sdk";
import { DynamoDBClient } from '@aws-sdk/client-dynamodb'
import { DynamoDBDocumentClient, GetCommand, DeleteCommand } from '@aws-sdk/lib-dynamodb'
export const ddbDocClient = DynamoDBDocumentClient.from(new DynamoDBClient({}))

const tableName = process.env.TABLE_NAME

export const handler = async event => {
    const params = {
        TableName: tableName,
        Key: {
            ProjectionExpression: 'connectionId'
        }
    }

    let connectionData

    try {
        connectionData = await ddbDocClient.send(new GetCommand(params))
    } catch (e) {
        return { statusCode: 500, body: e.stack }
    }

    const apigwManagementApi = new ApiGatewayManagementApi({
        apiVersion: '2018-11-29',
        endpoint: event.requestContext.domainName + '/' + event.requestContext.stage
    });

    const postData = JSON.parse(event.body).data

    const postCalls = connectionData.Items.map(async ({ connectionId }) => {
        try {
            await apigwManagementApi.postToConnection({ ConnectionId: connectionId, Data: postData }).promise()
        } catch (e) {
            if (e.statusCode === 410) {
                console.log(`Found stale connection, deleting ${connectionId}`)
                await ddbDocClient.send(new DeleteCommand({ TableName: tableName, Key: { connectionId } }))
            } else {
                throw e
            }
        }
    });

    try {
        await Promise.all(postCalls)
    } catch (e) {
        return { statusCode: 500, body: e.stack }
    }

    return { statusCode: 200, body: 'Data sent.' }
}