import { commonResult } from '../commons'

// Get the DynamoDB table name from environment variables
const tableName = process.env.TABLE_NAME

export const handler = async (event) => {
    return {
        statusCode: 200,
        body: JSON.stringify({ message: 'Hello World.', ...await commonResult(tableName) })
    }
}
