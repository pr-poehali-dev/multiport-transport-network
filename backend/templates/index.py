"""
Backend функция для работы с PDF-шаблонами
Методы: GET (список), POST (создание), PUT (обновление), DELETE (удаление)
"""

import json
import os
from typing import Dict, Any
from TemplatesPDF import TemplatesPDF


def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    """
    Обработчик запросов к API шаблонов
    
    Args:
        event: HTTP запрос с методом, путем, телом
        context: контекст выполнения функции
        
    Returns:
        HTTP ответ с данными шаблонов
    """
    method: str = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
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
    
    templates_module = TemplatesPDF()
    
    if method == 'GET':
        params = event.get('queryStringParameters') or {}
        template_id = params.get('id')
        
        if template_id:
            template = templates_module.get_template_by_id(template_id)
            result = template if template else {'error': 'Template not found'}
            status = 200 if template else 404
        else:
            result = {
                'templates': templates_module.get_all_templates(),
                'total': len(templates_module.get_all_templates())
            }
            status = 200
        
        return {
            'statusCode': status,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps(result, ensure_ascii=False),
            'isBase64Encoded': False
        }
    
    if method == 'POST':
        body_data = json.loads(event.get('body', '{}'))
        
        if not body_data.get('name'):
            return {
                'statusCode': 400,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps({'error': 'Template name is required'}),
                'isBase64Encoded': False
            }
        
        result = templates_module.create_template(body_data)
        
        return {
            'statusCode': 201,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps(result, ensure_ascii=False),
            'isBase64Encoded': False
        }
    
    if method == 'PUT':
        body_data = json.loads(event.get('body', '{}'))
        template_id = body_data.get('id')
        
        if not template_id:
            return {
                'statusCode': 400,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps({'error': 'Template ID is required'}),
                'isBase64Encoded': False
            }
        
        result = templates_module.update_template(template_id, body_data)
        
        return {
            'statusCode': 200,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps(result, ensure_ascii=False),
            'isBase64Encoded': False
        }
    
    if method == 'DELETE':
        params = event.get('queryStringParameters') or {}
        template_id = params.get('id')
        
        if not template_id:
            return {
                'statusCode': 400,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps({'error': 'Template ID is required'}),
                'isBase64Encoded': False
            }
        
        success = templates_module.delete_template(template_id)
        
        return {
            'statusCode': 200 if success else 500,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({'success': success}),
            'isBase64Encoded': False
        }
    
    return {
        'statusCode': 405,
        'headers': {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
        },
        'body': json.dumps({'error': 'Method not allowed'}),
        'isBase64Encoded': False
    }
