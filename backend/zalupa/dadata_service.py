import os
from typing import Optional, Dict, Any


def get_company_by_inn(inn: str) -> Optional[Dict[str, Any]]:
    """
    Получает данные компании по ИНН из DaData
    
    Args:
        inn: ИНН компании
        
    Returns:
        Словарь с данными компании или None при ошибке
    """
    import requests
    
    api_key = os.environ.get('DADATA_API_KEY')
    if not api_key:
        raise ValueError("DADATA_API_KEY не установлен")
    
    base_url = 'https://suggestions.dadata.ru/suggestions/api/4_1/rs'
    
    headers = {
        'Authorization': f'Token {api_key}',
        'Content-Type': 'application/json'
    }
    
    data = {
        'query': inn,
        'count': 1
    }
    
    try:
        response = requests.post(
            f'{base_url}/findById/party',
            json=data,
            headers=headers,
            timeout=10
        )
        response.raise_for_status()
        
        result = response.json()
        
        if not result.get('suggestions'):
            return None
        
        company = result['suggestions'][0]
        data = company.get('data', {})
        
        return {
            'name': data.get('name', {}).get('full_with_opf', ''),
            'inn': data.get('inn', ''),
            'kpp': data.get('kpp', ''),
            'ogrn': data.get('ogrn', ''),
            'director': data.get('management', {}).get('name', ''),
            'legalAddress': data.get('address', {}).get('unrestricted_value', '')
        }
        
    except Exception as e:
        print(f"Ошибка при запросе к DaData: {e}")
        return None
