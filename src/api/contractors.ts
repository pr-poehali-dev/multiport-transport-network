// Contractors API - вся логика работы с контрагентами
// При миграции на другой хостинг меняешь только URL в config.ts

import { API_CONFIG, apiRequest } from './config';

export interface Contractor {
  id?: number;
  name: string;
  inn: string;
  kpp?: string;
  ogrn?: string;
  director?: string;
  legalAddress?: string;
  actualAddress?: string;
  postalAddress?: string;
  isSeller?: boolean;
  isBuyer?: boolean;
  isCarrier?: boolean;
  bankAccounts?: Array<{
    accountNumber: string;
    bik: string;
    bankName: string;
    corrAccount: string;
  }>;
  deliveryAddresses?: Array<{
    address: string;
    phone: string;
    contact: string;
  }>;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateContractorResponse {
  id: number;
  message: string;
  createdAt?: string;
}

export interface GetContractorsResponse {
  contractors: Contractor[];
  total: number;
}

// Создать контрагента
export async function createContractor(contractor: Contractor): Promise<CreateContractorResponse> {
  return apiRequest(API_CONFIG.ENDPOINTS.contractors, {
    method: 'POST',
    body: JSON.stringify(contractor),
  });
}

// Получить всех контрагентов
export async function getContractors(): Promise<GetContractorsResponse> {
  return apiRequest(API_CONFIG.ENDPOINTS.contractors, {
    method: 'GET',
  });
}

// Получить одного контрагента по ID
export async function getContractorById(id: number): Promise<Contractor> {
  return apiRequest(`${API_CONFIG.ENDPOINTS.contractors}&id=${id}`, {
    method: 'GET',
  });
}

// Обновить контрагента
export async function updateContractor(id: number, contractor: Contractor): Promise<CreateContractorResponse> {
  return apiRequest(`${API_CONFIG.ENDPOINTS.contractors}&id=${id}`, {
    method: 'PUT',
    body: JSON.stringify(contractor),
  });
}

// Удалить контрагента
export async function deleteContractor(id: number): Promise<{ message: string }> {
  return apiRequest(`${API_CONFIG.ENDPOINTS.contractors}&id=${id}`, {
    method: 'DELETE',
  });
}
