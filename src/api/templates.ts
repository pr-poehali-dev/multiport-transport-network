// Templates API - вся логика работы с PDF шаблонами
import { API_CONFIG, apiRequest } from './config';

export interface FieldMapping {
  id: string;
  fieldName: string;
  fieldLabel?: string;
  x: number;
  y: number;
  width: number;
  height: number;
  page: number;
  fontSize?: number;
  fontFamily?: string;
  text?: string;
}

export interface Template {
  id?: number;
  name: string;
  fileName: string;
  fileUrl?: string;
  fileData?: string;
  fieldMappings: FieldMapping[];
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateTemplateResponse {
  id: number;
  message: string;
  createdAt?: string;
}

export interface GetTemplatesResponse {
  templates: Template[];
  total: number;
}

// Создать шаблон
export async function createTemplate(template: Template): Promise<CreateTemplateResponse> {
  return apiRequest(API_CONFIG.ENDPOINTS.templates, {
    method: 'POST',
    body: JSON.stringify({
      name: template.name,
      fileName: template.fileName,
      fileUrl: template.fileUrl,
      fileData: template.fileData,
      fieldMappings: template.fieldMappings,
    }),
  });
}

// Получить все шаблоны
export async function getTemplates(): Promise<GetTemplatesResponse> {
  return apiRequest(API_CONFIG.ENDPOINTS.templates, {
    method: 'GET',
  });
}

// Получить один шаблон по ID
export async function getTemplateById(id: number): Promise<Template> {
  return apiRequest(`${API_CONFIG.ENDPOINTS.templates}&id=${id}`, {
    method: 'GET',
  });
}

// Обновить шаблон
export async function updateTemplate(id: number, template: Template): Promise<CreateTemplateResponse> {
  return apiRequest(`${API_CONFIG.ENDPOINTS.templates}&id=${id}`, {
    method: 'PUT',
    body: JSON.stringify(template),
  });
}

// Удалить шаблон
export async function deleteTemplate(id: number): Promise<{ message: string }> {
  return apiRequest(`${API_CONFIG.ENDPOINTS.templates}&id=${id}`, {
    method: 'DELETE',
  });
}