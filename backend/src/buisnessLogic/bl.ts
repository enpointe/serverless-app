import * as DB from '../dataLayer/db'
import * as uuid from 'uuid'

import { TodoItem } from '../models/TodoItem';
import { CreateTodoRequest } from '../requests/CreateTodoRequest';
import { UpdateTodoRequest } from '../requests/UpdateTodoRequest';

/**
 * Create a TODO item and associated it with the specified user.
 * @param userId the userId to associated with the TODO item
 * @param todoData the TODO data to add to the TODO being created
 * @returns TodoItem the TODO item created
 */
export async function createTodo(userId: string, todoData: CreateTodoRequest) : Promise<TodoItem> {
  const todoId = uuid.v4()
  const newTodo: TodoItem = {
    todoId: todoId,
    userId: userId,
    createdAt: new Date().toISOString(),
    done: false,
    ...todoData
  }
  await DB.createTodo(newTodo);
  return newTodo
}

/**
 * Updates a TODO
 * @param userId the user ID associated with the TODO
 * @param todoId the ID of the TODO to update
 * @param updateTodo The todo data to update
 */
export async function updateTodo(userId: string, todoId: string, updateTodo: UpdateTodoRequest) : Promise<void> {
  return DB.updateTodo(userId, todoId, updateTodo);
}

/**
 * Delete a TODO item
 * @param userId the user ID associated with the TODO
 * @param todoId the ID of the TODO to delete
 */
export async function deleteTodo(userId: string, todoId: string) : Promise<void>  {
  return DB.deleteTodo(userId, todoId);
}

/**
 * Get the specified todo
 * @param userId the user ID associated with the TODO
 * @param todoId the todo ID
 * @returns the newly created TODO item
 */
export async function getTodo(userId: string, todoId: string) : Promise<TodoItem>  {
  return DB.getTodo(userId, todoId);
}

/**
 * Fetch all TODOs for the specified user
 * @param userId the user ID to fetch TODOs for
 * @returns array of TODO items associated with the user specified.
 */
export async function getTodosForUser(userId: string): Promise<TodoItem[]> {
    return DB.getTodosForUser(userId);
  }

/**
 * Adds an attachment URL image to a TODO
 * @param userId the user ID associated with the TODO
 * @param todoId the todo ID
 * @returns string JSON object as astring of the URL that can be used for an attachment
 */
export async function addAttachmentUrl(userId: string, todoId: string): Promise<string> {
  return DB.addAttachmentsUrl(userId, todoId);
}