"""
Модуль для построения HTTP-ответов Cloud Functions
Унифицирует формат ответов API
"""

import json
from typing import Dict, Any


def json_response(status: int, data: Dict[str, Any]) -> Dict[str, Any]:
    """
    Создать JSON HTTP-ответ
    
    Args:
        status: HTTP статус код (200, 400, 404 и т.д.)
        data: данные для возврата в JSON
        
    Returns:
        Полный HTTP-ответ с заголовками и телом
    """
    return {
        'statusCode': status,
        'headers': {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
        },
        'body': json.dumps(data, ensure_ascii=False),
        'isBase64Encoded': False
    }


def cors_response() -> Dict[str, Any]:
    """
    Создать CORS preflight ответ для OPTIONS запроса
    
    Returns:
        HTTP-ответ с разрешениями CORS
    """
    return {
        'statusCode': 200,
        'headers': {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, X-User-Id, X-Auth-Token',
            'Access-Control-Max-Age': '86400'
        },
        'body': '',
        'isBase64Encoded': False
    }


def error_response(status: int, message: str) -> Dict[str, Any]:
    """
    Создать ответ с ошибкой
    
    Args:
        status: HTTP статус код ошибки
        message: текст ошибки
        
    Returns:
        HTTP-ответ с ошибкой
    """
    return json_response(status, {'error': message})


def success_response(data: Dict[str, Any], status: int = 200) -> Dict[str, Any]:
    """
    Создать успешный ответ
    
    Args:
        data: данные для возврата
        status: HTTP статус код (по умолчанию 200)
        
    Returns:
        HTTP-ответ с данными
    """
    return json_response(status, data)
