import 'source-map-support/register'
import * as AWS  from 'aws-sdk'
import {getUserId} from '../utils';
import { createLogger } from '../../utils/logger'

import { APIGatewayProxyEvent, APIGatewayProxyResult, APIGatewayProxyHandler } from 'aws-lambda'

const docClient = new AWS.DynamoDB.DocumentClient()
const s3 = new AWS.S3({
  signatureVersion: 'v4'
})
const logger = createLogger('updateURLHandler')

const todoTable = process.env.TODO_TABLE

const bucketName = process.env.TODO_S3_BUCKET
const urlExpiration = parseInt(process.env.SIGNED_URL_EXPIRATION)

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  logger.debug('Processing Update URL TODO event', event)
  const todoId = event.pathParameters.todoId
  const userId = getUserId(event)
  logger.info(`Processing request to update URL for todo ${todoId} for user ${userId}`)

  await docClient.get({
    TableName: todoTable,
    Key: {
      todoId: todoId,
      userId: userId
    }
  }).promise()
  .catch(function(error) {
    logger.error(`File to fetch todo ${todoId} for ${userId}: ${error}`)
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
  // As the program design only allows a single URL entry 
  // we want the url value to be the same in case a new image document is added
  // In other words we always want to get the same URL all the time
  const uploadUrl = getUploadUrl(todoId)
  var params = {
    TableName: todoTable,
    Key: {
      todoId: todoId,
      userId: userId,
    },
    UpdateExpression: "set attachmentUrl = :attachmentUrl",
    ExpressionAttributeValues:{
      ":attachmentUrl": `https://${bucketName}.s3.amazonaws.com/${todoId}`
    },
    ReturnValues:"UPDATED_NEW"
  }

  // We should be able to do an update but that doesn't seem to be working
  try {
    await docClient.update(params).promise()
  }
  catch(error) {
    logger.error(`File to update todo ${todoId} for ${userId}: ${error}`)
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

  logger.info(`Successfully set url ${uploadUrl} for todo ${todoId}`)
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
