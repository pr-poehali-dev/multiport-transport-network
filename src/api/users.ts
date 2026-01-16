// Users API
import { API_CONFIG, apiRequest } from './config';

export interface User {
  id?: number;
  username: string;
  email: string;
  full_name: string;
  phone?: string;
  password?: string;
  is_active?: boolean;
  is_admin?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface CreateUserResponse {
  id: number;
  message: string;
}

export interface GetUsersResponse {
  users: User[];
}

// Создать пользователя
export async function createUser(user: User): Promise<CreateUserResponse> {
  return apiRequest(API_CONFIG.ENDPOINTS.users, {
    method: 'POST',
    body: JSON.stringify(user),
  });
}

// Получить всех пользователей
export async function getUsers(): Promise<GetUsersResponse> {
  return apiRequest(API_CONFIG.ENDPOINTS.users, {
    method: 'GET',
  });
}

// Получить одного пользователя по ID
export async function getUserById(id: number): Promise<User> {
  return apiRequest(`${API_CONFIG.ENDPOINTS.users}&id=${id}`, {
    method: 'GET',
  });
}

// Обновить пользователя
export async function updateUser(id: number, user: User): Promise<CreateUserResponse> {
  return apiRequest(`${API_CONFIG.ENDPOINTS.users}&id=${id}`, {
    method: 'PUT',
    body: JSON.stringify(user),
  });
}

// Удалить пользователя
export async function deleteUser(id: number): Promise<{ message: string }> {
  return apiRequest(`${API_CONFIG.ENDPOINTS.users}&id=${id}`, {
    method: 'DELETE',
  });
}