export const handler = async (event) => {
    if (event.httpMethod !== 'GET') {
        throw new Error(`getAllItems only accept GET method, you tried: ${event.httpMethod}`)
    }

    return {
        statusCode: 200,
        body: JSON.stringify({
            graphql: process.env.GRAPHQL_URL,
            region: process.env.REGION
        })
    }
}
