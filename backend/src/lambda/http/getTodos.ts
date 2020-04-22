import 'source-map-support/register'
import * as BL from '../../buisnessLogic/bl'
import {getUserId} from '../utils';
import { createLogger } from '../../utils/logger'

const logger = createLogger('getTodoHandler')

import { APIGatewayProxyEvent, APIGatewayProxyResult, APIGatewayProxyHandler } from 'aws-lambda'

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  logger.debug('Processing get TODO event: ', event)
  const userId = getUserId(event)

  logger.debug(`Fetching todos for userId ${userId}`)
  const items = await BL.getTodosForUser(userId)
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
