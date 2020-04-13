import 'source-map-support/register'
import * as AWS  from 'aws-sdk'

import { APIGatewayProxyEvent, APIGatewayProxyHandler, APIGatewayProxyResult } from 'aws-lambda'

import { UpdateTodoRequest } from '../../requests/UpdateTodoRequest'

const docClient = new AWS.DynamoDB.DocumentClient()
const todoTable = process.env.TODO_TABLE

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const todoId = event.pathParameters.todoId
  const updatedTodo: UpdateTodoRequest = JSON.parse(event.body)

  console.log("Procesing event for id", todoId, updatedTodo)
  await docClient.get({
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

  var params = {
    TableName: todoTable,
    Key: {
      id: todoId
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
  const data = await docClient.update(params).promise()
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
