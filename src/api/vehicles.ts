import func2url from '../../backend/func2url.json';

const API_URL = func2url.zalupa;

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
  const response = await fetch(`${API_URL}?resource=vehicles`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Не удалось загрузить список автомобилей');
  }

  return response.json();
}

export async function getVehicle(id: number): Promise<Vehicle> {
  const response = await fetch(`${API_URL}?resource=vehicles&id=${id}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Не удалось загрузить автомобиль');
  }

  return response.json();
}

export async function createVehicle(data: CreateVehicleRequest): Promise<{ id: number; message: string; createdAt: string }> {
  console.log('Creating vehicle with data:', data);
  const response = await fetch(`${API_URL}?resource=vehicles`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    console.error('Backend error:', error);
    alert(`Backend error: ${JSON.stringify(error)}`);
    throw new Error(error.error || 'Не удалось создать автомобиль');
  }

  return response.json();
}

export async function updateVehicle(id: number, data: UpdateVehicleRequest): Promise<{ id: number; message: string; updatedAt: string }> {
  const response = await fetch(`${API_URL}?resource=vehicles&id=${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Не удалось обновить автомобиль');
  }

  return response.json();
}

export async function deleteVehicle(id: number): Promise<{ message: string }> {
  const response = await fetch(`${API_URL}?resource=vehicles&id=${id}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Не удалось удалить автомобиль');
  }

  return response.json();
}