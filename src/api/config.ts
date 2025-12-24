// API Configuration - легко меняется при миграции на другой хостинг
// При переезде на jino.ru или другой хостинг - просто меняешь BASE_URL

// Текущий хостинг: poehali.dev Cloud Functions
import FUNC_URLS from '../../backend/func2url.json';

export const API_CONFIG = {
  // При миграции на jino.ru замени на: 'https://your-domain.jino.ru/api'
  BASE_URL: '',
  
  ENDPOINTS: {
    drivers: FUNC_URLS.zalupa,
    templates: FUNC_URLS.zalupa + '?resource=templates',
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
      throw new Error(data.error || 'Ошибка запроса');
    }

    return data;
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Неизвестная ошибка');
  }
}