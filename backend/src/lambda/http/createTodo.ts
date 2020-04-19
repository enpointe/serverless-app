import 'source-map-support/register'
import * as AWS  from 'aws-sdk'
import * as uuid from 'uuid'
import {getUserId} from '../utils';
import { createLogger } from '../../utils/logger'

import { APIGatewayProxyEvent, APIGatewayProxyHandler, APIGatewayProxyResult } from 'aws-lambda'

import { CreateTodoRequest } from '../../requests/CreateTodoRequest'

const docClient = new AWS.DynamoDB.DocumentClient()
const todoTable = process.env.TODO_TABLE

const logger = createLogger('createToDo')

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  logger.debug('Processing Create TODO event', event)
  const userId = getUserId(event)
  const todoId = uuid.v4()
  const timestamp = new Date().toISOString()
  const newTodo: CreateTodoRequest = JSON.parse(event.body)

  logger.info(`Processing request to create todo ${todoId} with data ${newTodo} for user ${userId}`)
  const newItem = {
    todoId: todoId,
    userId: userId,
    createdAt: timestamp,
    done: false,
    ...newTodo
  }

  await docClient.put({
    TableName: todoTable,
    Item: newItem
  }).promise()
  .catch(function(error) {
    logger.error(`Failed to create todo ${todoId} for user ${userId}: ${error}`);
    return {
      statusCode: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify({
        "error": error
      })
    }
  })

  logger.error(`Successfully created todo ${todoId} for user ${userId}`);
  return {
    statusCode: 201,
    headers: {
      'Access-Control-Allow-Origin': '*',
    },
    body: JSON.stringify({
      newItem
    })
  }
}
