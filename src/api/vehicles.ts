import { API_CONFIG, apiRequest } from './config';

export interface Vehicle {
  id?: number;
  brand: string;
  registrationNumber: string;
  capacity?: number;
  trailerNumber?: string;
  trailerType?: string;
  companyId?: number;
  driverId?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateVehicleRequest {
  brand: string;
  registrationNumber: string;
  capacity?: number;
  trailerNumber?: string;
  trailerType?: string;
  companyId?: number;
  driverId?: number;
}

export interface UpdateVehicleRequest extends CreateVehicleRequest {}

export async function getVehicles(): Promise<{ vehicles: Vehicle[]; total: number }> {
  return apiRequest(API_CONFIG.ENDPOINTS.vehicles, { method: 'GET' });
}

export async function getVehicle(id: number): Promise<Vehicle> {
  return apiRequest(`${API_CONFIG.ENDPOINTS.vehicles}&id=${id}`, { method: 'GET' });
}

export async function createVehicle(data: CreateVehicleRequest): Promise<{ id: number; message: string; createdAt: string }> {
  return apiRequest(API_CONFIG.ENDPOINTS.vehicles, {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function updateVehicle(id: number, data: UpdateVehicleRequest): Promise<{ id: number; message: string; updatedAt: string }> {
  return apiRequest(`${API_CONFIG.ENDPOINTS.vehicles}&id=${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export async function deleteVehicle(id: number): Promise<{ message: string }> {
  return apiRequest(`${API_CONFIG.ENDPOINTS.vehicles}&id=${id}`, { method: 'DELETE' });
}