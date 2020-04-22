import 'source-map-support/register'
import * as BL from '../../buisnessLogic/bl'
import {getUserId} from '../utils';
import { createLogger } from '../../utils/logger'

import { APIGatewayProxyEvent, APIGatewayProxyHandler, APIGatewayProxyResult } from 'aws-lambda'

import { CreateTodoRequest } from '../../requests/CreateTodoRequest'

const logger = createLogger('createToDo')

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  logger.debug('Processing Create TODO event', event)
  const userId = getUserId(event)
  const newTodo: CreateTodoRequest = JSON.parse(event.body)

  if (!newTodo.name || !newTodo.name.trim() || 0 === newTodo.name.length) {
    logger.error(`Failed to create todo for user ${userId}: no task description specified`);
    return {
      statusCode: 400,
      headers: {
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify({
        "error": `No description specified for todo task for user ${userId}`
      })
    }
  }

  try {
    logger.info(`Processing request to create todo for userId ${userId}: ${newTodo}`)
    const todoItem = await BL.createTodo(userId, newTodo)
    logger.info(`Successfully created todo for user ${userId}: ${todoItem}`);
    return {
      statusCode: 201,
      headers: {
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify({
        item: todoItem
      })
    }
  }
  catch(error) {
    logger.error(`Failed to create todo for user ${userId}: ${error}`);
    return {
      statusCode: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify({
        "error": error
      })
    }
  }
}
