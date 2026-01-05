// DaData API - подсказки адресов и компаний
import { API_CONFIG, apiRequest } from './config';

export interface AddressSuggestion {
  value: string;
  unrestricted_value: string;
  city: string;
  region: string;
  country: string;
}

export interface AddressSuggestionsResponse {
  suggestions: AddressSuggestion[];
}

// Получить подсказки адресов
export async function suggestAddresses(query: string): Promise<AddressSuggestionsResponse> {
  return apiRequest(`${API_CONFIG.ENDPOINTS.zalupa}?resource=dadata&action=address&query=${encodeURIComponent(query)}`, {
    method: 'GET',
  });
}

// Получить данные компании по ИНН (уже существует)
export async function getCompanyByInn(inn: string) {
  return apiRequest(`${API_CONFIG.ENDPOINTS.zalupa}?resource=dadata&action=company&inn=${inn}`, {
    method: 'GET',
  });
}
