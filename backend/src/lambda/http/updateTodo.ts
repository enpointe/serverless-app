import 'source-map-support/register'
import * as AWS  from 'aws-sdk'
import {getUserId} from '../utils';
import { createLogger } from '../../utils/logger'
import { APIGatewayProxyEvent, APIGatewayProxyHandler, APIGatewayProxyResult } from 'aws-lambda'
import { UpdateTodoRequest } from '../../requests/UpdateTodoRequest'

const AWSXRay = require('aws-xray-sdk')
const XAWS = AWSXRay.captureAWS(AWS)

const docClient = new XAWS.DynamoDB.DocumentClient()
const todoTable = process.env.TODO_TABLE
const logger = createLogger('updateToDoHandler')

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const todoId = event.pathParameters.todoId
  const userId = getUserId(event)
  const updatedTodo: UpdateTodoRequest = JSON.parse(event.body)

  logger.debug(`Processing ${todoId} Data: ${updatedTodo}`)
  await docClient.get({
    TableName: todoTable,
    Key: {
      todoId: todoId,
      userId: userId
    }
  }).promise()
  .catch(function(error) {
    return {
      statusCode: 404,
      headers: {
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify({
        "error": error
      })
    }
  })

  var params = {
    TableName: todoTable,
    Key: {
      todoId: todoId,
      userId: userId,
    },
    UpdateExpression: "set #n=:n, dueDate=:u, done=:d",
    ExpressionAttributeValues:{
        ":n": updatedTodo.name,
        ":u": updatedTodo.dueDate,
        ":d": updatedTodo.done
    },
    ExpressionAttributeNames:{
      "#n": "name"
    },
    ReturnValues:"UPDATED_NEW"
  }

  // We should be able to do an update but that doesn't seem to be working
  await docClient.update(params).promise()
  .catch(function(error) {
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
  return {
    statusCode: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
    },
    body: JSON.stringify({
    })
  }
}
