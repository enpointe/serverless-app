import 'source-map-support/register'
import * as AWS  from 'aws-sdk'
import {getUserId} from '../utils';
import { createLogger } from '../../utils/logger'

import { APIGatewayProxyEvent, APIGatewayProxyResult, APIGatewayProxyHandler } from 'aws-lambda'

const docClient = new AWS.DynamoDB.DocumentClient()
const todoTable = process.env.TODO_TABLE
const logger = createLogger('deleteToDoHandler')

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  logger.debug('Processing Delete TODO event', event)
  const todoId = event.pathParameters.todoId
  const userId = getUserId(event)
  logger.info(`Processing request to delete todo ${todoId} for user ${userId}`)

  
  try {
    var params = {
      TableName: todoTable,
      Key: { userId, todoId }
    }
    await docClient.delete(params).promise()
    logger.info(`Successfully deleted todo ${todoId} for user ${userId}`)

    // TODO: Although not called for in assignment we should delete the
    // associated image if it exists
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
      },
      body: ''
    }
  }
  catch(error) {
    logger.error(`Delete failed ${error}`)
    return {
      statusCode: 404,
      headers: {
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify({
        "error": error
      })
    }
  }
}

