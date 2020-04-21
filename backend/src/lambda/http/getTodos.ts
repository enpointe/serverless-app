import 'source-map-support/register'
import * as AWS  from 'aws-sdk'
import {getUserId} from '../utils';
import { createLogger } from '../../utils/logger'
import { TodoItem } from '../../models/TodoItem'

const docClient = new AWS.DynamoDB.DocumentClient()

const todoTable = process.env.TODO_TABLE
const todoIndex = process.env.TODO_INDEX
const logger = createLogger('getTodoHandler')

import { APIGatewayProxyEvent, APIGatewayProxyResult, APIGatewayProxyHandler } from 'aws-lambda'

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  logger.debug('Processing get TODO event: ', event)
  const userId = getUserId(event)

  logger.debug(`Fetching todos for userId ${userId}`)
  const items = await getTodosForUser(userId)
  logger.debug(`Fetched ${items}`)
  return {
    statusCode: 200,
    headers: {
      'Access-Control-Allow-Origin': '*'
    },
    body: JSON.stringify({
      items: items
    })
  }
}

async function getTodosForUser(userId: string): Promise<TodoItem[]> {
  var params = {
    TableName: todoTable,
    IndexName: todoIndex,
    KeyConditionExpression: 'userId = :userId',
    ExpressionAttributeValues: {
      ':userId': userId
    },
    ScanIndexForward: false
  }
  const result = await docClient.query(params).promise()

  const items = result.Items
  return items as TodoItem[]
}