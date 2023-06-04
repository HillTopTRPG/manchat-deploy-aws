import { DynamoDBClient } from '@aws-sdk/client-dynamodb'
import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb'
export const ddbDocClient = DynamoDBDocumentClient.from(new DynamoDBClient({}))

import { GetCommand } from '@aws-sdk/lib-dynamodb'

export const commonResult = async (tableName) => {
    const params = {
        TableName : tableName,
        Key: { id: "1" },
    }

    let item = null

    try {
        const data = await ddbDocClient.send(new GetCommand(params))
        item = data.Item
    } catch (err) {
        console.log("Error", err)
    }

    return {
        common: 'manchat',
        item: item || 'No data.'
    }
}
