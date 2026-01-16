// API Configuration - легко меняется при миграции на другой хостинг
// При переезде на jino.ru или другой хостинг - просто меняешь BASE_URL

// Текущий хостинг: poehali.dev Cloud Functions
import FUNC_URLS from '../../backend/func2url.json';
import { logError } from '@/utils/errorLogger';

export const API_CONFIG = {
  // При миграции на jino.ru замени на: 'https://your-domain.jino.ru/api'
  BASE_URL: '',
  
  ENDPOINTS: {
    drivers: FUNC_URLS.zalupa + '?resource=drivers',
    vehicles: FUNC_URLS.zalupa + '?resource=vehicles',
    templates: FUNC_URLS.zalupa + '?resource=templates',
    contractors: FUNC_URLS.zalupa + '?resource=contractors',
    users: FUNC_URLS.zalupa + '?resource=users',
    invites: FUNC_URLS.zalupa + '?resource=invites',
    zalupa: FUNC_URLS.zalupa,
    // В будущем: drivers: `${BASE_URL}/drivers.php`
  }
};

// Хелпер для fetch с обработкой ошибок
export async function apiRequest(url: string, options?: RequestInit) {
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      const errorMsg = data.error || 'Ошибка запроса';
      logError(`API Error: ${errorMsg}`, undefined, {
        url,
        status: response.status,
        method: options?.method || 'GET',
        responseData: data,
      });
      throw new Error(errorMsg);
    }

    return data;
  } catch (error) {
    if (error instanceof Error) {
      logError(`API Request Failed: ${error.message}`, error, {
        url,
        method: options?.method || 'GET',
      });
      throw error;
    }
    logError('Неизвестная ошибка API', undefined, { url });
    throw new Error('Неизвестная ошибка');
  }
}