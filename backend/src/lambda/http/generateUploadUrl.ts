import 'source-map-support/register'
import * as AWS  from 'aws-sdk'
import * as uuid from 'uuid'

import { APIGatewayProxyEvent, APIGatewayProxyResult, APIGatewayProxyHandler } from 'aws-lambda'

const docClient = new AWS.DynamoDB.DocumentClient()
const s3 = new AWS.S3({
  signatureVersion: 'v4'
})

const todoTable = process.env.TODO_TABLE

const bucketName = process.env.TODO_S3_BUCKET
const urlExpiration = parseInt(process.env.SIGNED_URL_EXPIRATION)

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const todoId = event.pathParameters.todoId
  console.log("Procesing event ", todoId)

  let entry = await docClient.get({
    TableName: todoTable,
    Key: {
      todoId: todoId,
      userId: todoId
    }
  }).promise()
  .catch(function(error) {
    console.log(`File to fetch ${todoId}: ${error}`)
    return {
      statusCode: 404,
      headers: {
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify({
        "error": "todo does not exist"
      })
    }
  })

  // Update the attachment URL for the entry
  const fileId = uuid.v4()
  const uploadUrl = getUploadUrl(fileId)
  entry["attachmentUrl"]=`https://${bucketName}.s3.amazonaws.com/${fileId}`

  await docClient.put({
    TableName: todoTable,
    Item: {
      id: todoId,
      ...entry
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

  return {
    statusCode: 201,
    headers: {
      'Access-Control-Allow-Origin': '*'
    },
    body: JSON.stringify({
      uploadUrl: uploadUrl
    })
  }
}

function getUploadUrl(fileId: string) {
  return s3.getSignedUrl('putObject', {
    Bucket: bucketName,
    Key: fileId,
    Expires: urlExpiration
  })
}
