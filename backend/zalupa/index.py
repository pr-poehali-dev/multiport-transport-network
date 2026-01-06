import json
import psycopg2
import os
from typing import Dict, Any
from dadata_service import get_company_by_inn, suggest_addresses
from drivers import handle_drivers
from vehicles import handle_vehicles
from contractors import handle_contractors
from templates import handle_templates
from orders import handle_orders
from roles import handle_roles


def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    '''
    API для управления водителями, автомобилями, PDF шаблонами, контрагентами, заказами и DaData
    Args: event - dict с httpMethod, body, queryStringParameters
          context - объект с атрибутами request_id, function_name
    Returns: HTTP response dict
    '''
    method: str = event.get('httpMethod', 'GET')
    
    cors_headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, X-User-Id, X-Auth-Token',
        'Access-Control-Max-Age': '86400',
        'Content-Type': 'application/json'
    }
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': cors_headers,
            'body': '',
            'isBase64Encoded': False
        }
    
    params = event.get('queryStringParameters') or {}
    resource = params.get('resource', 'drivers')
    
    if resource == 'dadata':
        action = params.get('action', 'company')
        
        if action == 'company':
            inn = params.get('inn', '').strip()
            
            if not inn:
                return {
                    'statusCode': 400,
                    'headers': cors_headers,
                    'body': json.dumps({'error': 'Параметр inn обязателен'}),
                    'isBase64Encoded': False
                }
            
            try:
                company_data = get_company_by_inn(inn)
                
                if not company_data:
                    return {
                        'statusCode': 404,
                        'headers': cors_headers,
                        'body': json.dumps({'error': 'Компания не найдена'}),
                        'isBase64Encoded': False
                    }
                
                return {
                    'statusCode': 200,
                    'headers': cors_headers,
                    'body': json.dumps(company_data),
                    'isBase64Encoded': False
                }
                
            except Exception as e:
                return {
                    'statusCode': 500,
                    'headers': cors_headers,
                    'body': json.dumps({'error': str(e)}),
                    'isBase64Encoded': False
                }
        
        elif action == 'address':
            query = params.get('query', '').strip()
            
            if not query:
                return {
                    'statusCode': 400,
                    'headers': cors_headers,
                    'body': json.dumps({'error': 'Параметр query обязателен'}),
                    'isBase64Encoded': False
                }
            
            try:
                suggestions = suggest_addresses(query)
                
                return {
                    'statusCode': 200,
                    'headers': cors_headers,
                    'body': json.dumps({'suggestions': suggestions}),
                    'isBase64Encoded': False
                }
                
            except Exception as e:
                return {
                    'statusCode': 500,
                    'headers': cors_headers,
                    'body': json.dumps({'error': str(e)}),
                    'isBase64Encoded': False
                }
    
    db_url = os.environ.get('DATABASE_URL')
    if not db_url:
        return {
            'statusCode': 500,
            'headers': cors_headers,
            'body': json.dumps({'error': 'DATABASE_URL not configured'}),
            'isBase64Encoded': False
        }
    
    try:
        conn = psycopg2.connect(db_url)
        cursor = conn.cursor()
        
        if resource == 'drivers':
            result = handle_drivers(method, event, cursor, conn, cors_headers)
        elif resource == 'vehicles':
            result = handle_vehicles(method, event, cursor, conn, cors_headers)
        elif resource == 'contractors':
            result = handle_contractors(method, event, cursor, conn, cors_headers)
        elif resource == 'templates':
            result = handle_templates(method, event, cursor, conn, cors_headers)
        elif resource == 'orders':
            result = handle_orders(method, event, cursor, conn, cors_headers)
        elif resource == 'roles':
            result = handle_roles(method, event, cursor, conn, cors_headers)
        else:
            result = {
                'statusCode': 400,
                'headers': cors_headers,
                'body': json.dumps({'error': f'Неизвестный ресурс: {resource}'}),
                'isBase64Encoded': False
            }
        
        cursor.close()
        conn.close()
        
        return result
        
    except Exception as e:
        return {
            'statusCode': 500,
            'headers': cors_headers,
            'body': json.dumps({'error': str(e)}),
            'isBase64Encoded': False
        }