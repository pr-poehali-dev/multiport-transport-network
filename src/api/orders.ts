// Orders API - работа с заказами
import { API_CONFIG, apiRequest } from './config';

export interface AdditionalStop {
  id?: number;
  type: 'loading' | 'unloading' | 'customs';
  address: string;
  note: string;
  position?: number;
}

export interface OrderRoute {
  id?: number;
  from: string;
  to: string;
  vehicleId?: number;
  driverName?: string;
  loadingDate?: string;
  position?: number;
  additionalStops: AdditionalStop[];
}

export interface OrderConsignee {
  id?: number;
  contractorId?: number;
  name: string;
  note: string;
  position?: number;
}

export interface Order {
  id?: number;
  prefix: string;
  orderDate: string;
  routeNumber?: string;
  invoice?: string;
  trak?: string;
  weight?: number;
  fullRoute?: string;
  consignees: OrderConsignee[];
  routes: OrderRoute[];
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateOrderResponse {
  id: number;
  message: string;
  createdAt: string;
}

export interface GetOrdersResponse {
  orders: Order[];
  total: number;
}

// Создать заказ
export async function createOrder(order: Order): Promise<CreateOrderResponse> {
  return apiRequest(`${API_CONFIG.ENDPOINTS.zalupa}?resource=orders`, {
    method: 'POST',
    body: JSON.stringify(order),
  });
}

// Получить все заказы
export async function getOrders(): Promise<GetOrdersResponse> {
  return apiRequest(`${API_CONFIG.ENDPOINTS.zalupa}?resource=orders`, {
    method: 'GET',
  });
}

// Получить заказ по ID
export async function getOrderById(id: number): Promise<Order> {
  return apiRequest(`${API_CONFIG.ENDPOINTS.zalupa}?resource=orders&id=${id}`, {
    method: 'GET',
  });
}

// Обновить заказ
export async function updateOrder(id: number, order: Order): Promise<{ message: string }> {
  return apiRequest(`${API_CONFIG.ENDPOINTS.zalupa}?resource=orders&id=${id}`, {
    method: 'PUT',
    body: JSON.stringify(order),
  });
}