import 'source-map-support/register'
import * as BL from '../../buisnessLogic/bl'
import {getUserId} from '../utils';
import { createLogger } from '../../utils/logger'

import { APIGatewayProxyEvent, APIGatewayProxyResult, APIGatewayProxyHandler } from 'aws-lambda'

const logger = createLogger('updateURLHandler')

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  logger.debug('Processing Update URL TODO event', event)
  const todoId = event.pathParameters.todoId
  const userId = getUserId(event)
  logger.info(`Processing request to update URL for todo ${todoId} for user ${userId}`)

  await BL.getTodo(userId, todoId)
  .catch(function(error) {
    logger.error(`Failed to fetch todo ${todoId} for ${userId}: ${error}`)
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

  // We should be able to do an update but that doesn't seem to be working
  let uploadUrl
  try {
    uploadUrl = await BL.addAttachmentUrl(userId, todoId)
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
    body: uploadUrl
  }
}
