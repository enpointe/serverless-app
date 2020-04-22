import * as AWS  from 'aws-sdk'
import { TodoItem } from '../models/TodoItem';
import { TodoUpdate } from '../models/TodoUpdate';

const AWSXRay = require('aws-xray-sdk')
const XAWS = AWSXRay.captureAWS(AWS)
const s3 = new XAWS.S3({
  signatureVersion: 'v4'
})

const docClient = new XAWS.DynamoDB.DocumentClient()
const todoTable = process.env.TODO_TABLE
const todoIndex = process.env.TODO_INDEX

const bucketName = process.env.TODO_S3_BUCKET
const urlExpiration = parseInt(process.env.SIGNED_URL_EXPIRATION)

/**
 * Create a new TODO item 
 * @param todoItem The information to store in the TODO
 */
export async function createTodo(
    todoItem: TodoItem
  ): Promise<void> {
    await docClient.put({
        TableName: todoTable,
        Item: todoItem
      }).promise()
  }

/**
 * Delete the specified TODO
 * @param userId the user ID associated with the TODO
 * @param todoId the ID of the TODO to delete
 */
export async function deleteTodo(
    userId: string,
    todoId: string
  ): Promise<void> {
    var params = {
        TableName: todoTable,
        Key: { userId, todoId }
    }
    await docClient.delete(params).promise()
  }

/**
 * Update the URL of a TODO. Returning the S3 URL link that can
 * be used to upload image associated with the TODO
 * @param userId the user ID associated with the TODO
 * @param todoId the ID of the TODO to update
 * @returns string the upload URL to the S3 bucket
 */
export async function setAttachmentsUrl(
    userId: string,
    todoId: string
    ): Promise<string> {
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
    await docClient.update(params).promise()
    const uploadUrl = s3.getSignedUrl('putObject', {
        Bucket: bucketName,
        Key: todoId,
        Expires: urlExpiration
      })
    return JSON.stringify({uploadUrl: uploadUrl})
  }

/**
 * Get the TODOs associated with the specified user
 * @param userId the user ID to retrieve TODOs for
 * @returns the TODO items fetched
 */
export async function getTodosForUser(userId: string): Promise<TodoItem[]> {
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

/**
 * Get a specified TODO associated with a user
 * @param userId the user ID to retrieve TODO information from
 * @param todoId the todo ID to retrieve TODO data for
 * @returns the todo item
 */
export async function getTodo(userId: string, todoId: string): Promise<TodoItem> {
    const result = await docClient.get({
        TableName: todoTable,
        Key: {
          todoId: todoId,
          userId: userId
        }
      }).promise()
    return result.Item as TodoItem
}

/**
 * Update data associated with a given TODO
 * @param userId the user ID associated with the TODO
 * @param todoId the TODO ID to update
 * @param updates the updates to make
 */
export async function updateTodo(userId: string, todoId: string, updates: TodoUpdate): Promise<void> {
    var params = {
        TableName: todoTable,
        Key: {
          todoId: todoId,
          userId: userId,
        },
        UpdateExpression: "set #n=:n, dueDate=:u, done=:d",
        ExpressionAttributeValues:{
            ":n": updates.name,
            ":u": updates.dueDate,
            ":d": updates.done
        },
        ExpressionAttributeNames:{
          "#n": "name"
        },
        ReturnValues:"UPDATED_NEW"
      }
      await docClient.update(params).promise()
}