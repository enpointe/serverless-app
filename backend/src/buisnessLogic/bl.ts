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
 * @param updateTodo 
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
 */
export async function getTodo(userId: string, todoId: string) : Promise<TodoItem>  {
  return DB.getTodo(userId, todoId);
}

/**
 * Fetch all TODOs for the specified user
 * @param currentUserId the user ID to fetch TODOs for
 */
export async function getTodosForUser(currentUserId: string): Promise<TodoItem[]> {
    return DB.getTodosForUser(currentUserId);
  }

export async function getAttachmentUrl(userId: string, todoId: string): Promise<string> {
  return DB.setAttachmentsUrl(userId, todoId);
}