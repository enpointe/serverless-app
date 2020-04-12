import 'source-map-support/register'
import * as AWS  from 'aws-sdk'

import { APIGatewayProxyEvent, APIGatewayProxyHandler, APIGatewayProxyResult } from 'aws-lambda'

import { UpdateTodoRequest } from '../../requests/UpdateTodoRequest'

const docClient = new AWS.DynamoDB.DocumentClient()
const todoTable = process.env.TODO_TABLE

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const todoId = event.pathParameters.todoId
  const updatedTodo: UpdateTodoRequest = JSON.parse(event.body)

  console.log("Fetching record")
  let entry = await docClient.get({
    TableName: todoTable,
    Key: {'id': todoId}
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

  console.log("Procesing event for id", todoId, updatedTodo)
  await docClient.put({
    TableName: todoTable,
    Item: {
      id: todoId,
      ...updatedTodo
    }
  }).promise()
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

  console.log("Fetching updated record")
  entry = await docClient.get({
    TableName: todoTable,
    Key: {'id': todoId}
  }).promise()

  return {
    statusCode: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
    },
    body: JSON.stringify({
      entry
    })
  }
  return undefined
}
