// Contracts API
import { API_CONFIG, apiRequest } from './config';

export interface Contract {
  id?: number;
  contractNumber: string;
  contractDate: string;
  customerId?: number;
  carrierId?: number;
  vehicleType?: string;
  vehicleCapacityTons?: number;
  vehicleCapacityM3?: number;
  temperatureMode?: string;
  additionalConditions?: string;
  cargo: string;
  loadingSellerId?: number;
  loadingAddresses?: string[];
  loadingDate?: string;
  unloadingBuyerId?: number;
  unloadingAddresses?: string[];
  unloadingDate?: string;
  paymentAmount?: number;
  taxationType?: string;
  paymentTerms?: string;
  driverId?: number;
  driverFullName?: string;
  driverPhone?: string;
  driverPhoneExtra?: string;
  driverPassport?: string;
  driverLicense?: string;
  vehicleId?: number;
  vehicleRegistrationNumber?: string;
  vehicleTrailerNumber?: string;
  vehicleBrand?: string;
  createdAt?: string;
  updatedAt?: string;
  
  // Расширенные данные (join с другими таблицами)
  customerName?: string;
  carrierName?: string;
  loadingSellerName?: string;
  unloadingBuyerName?: string;
}

export interface CreateContractResponse {
  id: number;
  message: string;
  createdAt?: string;
}

export interface GetContractsResponse {
  contracts: Contract[];
  total: number;
}

// Создать договор-заявку
export async function createContract(contract: Contract): Promise<CreateContractResponse> {
  return apiRequest(API_CONFIG.ENDPOINTS.contracts, {
    method: 'POST',
    body: JSON.stringify(contract),
  });
}

// Получить все договоры-заявки
export async function getContracts(): Promise<GetContractsResponse> {
  return apiRequest(API_CONFIG.ENDPOINTS.contracts, {
    method: 'GET',
  });
}

// Получить один договор-заявку по ID
export async function getContractById(id: number): Promise<Contract> {
  return apiRequest(`${API_CONFIG.ENDPOINTS.contracts}&id=${id}`, {
    method: 'GET',
  });
}

// Обновить договор-заявку
export async function updateContract(id: number, contract: Contract): Promise<CreateContractResponse> {
  return apiRequest(`${API_CONFIG.ENDPOINTS.contracts}&id=${id}`, {
    method: 'PUT',
    body: JSON.stringify(contract),
  });
}

// Удалить договор-заявку
export async function deleteContract(id: number): Promise<{ message: string }> {
  return apiRequest(`${API_CONFIG.ENDPOINTS.contracts}&id=${id}`, {
    method: 'DELETE',
  });
}
