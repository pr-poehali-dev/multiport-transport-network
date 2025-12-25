// Drivers API - вся логика работы с водителями
// При миграции на другой хостинг меняешь только URL в config.ts

import { API_CONFIG, apiRequest } from './config';

export interface Driver {
  id?: number;
  lastName: string;
  firstName: string;
  middleName?: string;
  phone: string;
  phoneExtra?: string;
  passportSeries?: string;
  passportNumber?: string;
  passportDate?: string;
  passportIssued?: string;
  licenseSeries?: string;
  licenseNumber?: string;
  licenseDate?: string;
  licenseIssued?: string;
  companyId?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateDriverResponse {
  id: number;
  message: string;
  createdAt?: string;
}

export interface GetDriversResponse {
  drivers: Driver[];
  total: number;
}

// Создать водителя
export async function createDriver(driver: Driver): Promise<CreateDriverResponse> {
  return apiRequest(API_CONFIG.ENDPOINTS.drivers, {
    method: 'POST',
    body: JSON.stringify(driver),
  });
}

// Получить всех водителей
export async function getDrivers(): Promise<GetDriversResponse> {
  return apiRequest(API_CONFIG.ENDPOINTS.drivers, {
    method: 'GET',
  });
}

// Получить одного водителя по ID
export async function getDriverById(id: number): Promise<Driver> {
  return apiRequest(`${API_CONFIG.ENDPOINTS.drivers}&id=${id}`, {
    method: 'GET',
  });
}

// Обновить водителя
export async function updateDriver(id: number, driver: Driver): Promise<CreateDriverResponse> {
  return apiRequest(`${API_CONFIG.ENDPOINTS.drivers}&id=${id}`, {
    method: 'PUT',
    body: JSON.stringify(driver),
  });
}

// Удалить водителя
export async function deleteDriver(id: number): Promise<{ message: string }> {
  return apiRequest(`${API_CONFIG.ENDPOINTS.drivers}&id=${id}`, {
    method: 'DELETE',
  });
}