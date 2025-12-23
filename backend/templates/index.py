import json
import psycopg2
import os
import base64
from typing import Dict, Any

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    '''
    API для управления PDF шаблонами - создание, чтение, обновление, удаление
    Args: event - dict с httpMethod, body, queryStringParameters, pathParameters
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
        
        if method == 'POST':
            body_data = json.loads(event.get('body', '{}'))
            
            name = body_data.get('name', '').strip()
            file_name = body_data.get('fileName', '').strip()
            file_url = body_data.get('fileUrl', '').strip() or None
            field_mappings = body_data.get('fieldMappings', [])
            file_data_b64 = body_data.get('fileData', '').strip()
            
            if not name or not file_name:
                return {
                    'statusCode': 400,
                    'headers': cors_headers,
                    'body': json.dumps({'error': 'Заполните название и имя файла'}),
                    'isBase64Encoded': False
                }
            
            # Декодируем base64 в бинарные данные
            file_data_bytes = None
            if file_data_b64:
                try:
                    file_data_bytes = base64.b64decode(file_data_b64)
                except Exception as e:
                    return {
                        'statusCode': 400,
                        'headers': cors_headers,
                        'body': json.dumps({'error': f'Ошибка декодирования файла: {str(e)}'}),
                        'isBase64Encoded': False
                    }
            
            cursor.execute('''
                INSERT INTO templates (name, file_name, file_url, field_mappings, file_data)
                VALUES (%s, %s, %s, %s, %s)
                RETURNING id, created_at
            ''', (name, file_name, file_url, json.dumps(field_mappings), file_data_bytes))
            
            result = cursor.fetchone()
            conn.commit()
            
            return {
                'statusCode': 201,
                'headers': cors_headers,
                'body': json.dumps({
                    'id': result[0],
                    'message': f'Шаблон "{name}" успешно создан',
                    'createdAt': result[1].isoformat() if result[1] else None
                }),
                'isBase64Encoded': False
            }
        
        elif method == 'GET':
            params = event.get('queryStringParameters') or {}
            template_id = params.get('id')
            
            if template_id:
                cursor.execute('SELECT * FROM templates WHERE id = %s', (template_id,))
                row = cursor.fetchone()
                
                if not row:
                    return {
                        'statusCode': 404,
                        'headers': cors_headers,
                        'body': json.dumps({'error': 'Шаблон не найден'}),
                        'isBase64Encoded': False
                    }
                
                # Кодируем бинарные данные обратно в base64
                file_data_b64 = None
                if row[7]:  # file_data
                    file_data_b64 = base64.b64encode(row[7]).decode('utf-8')
                
                template = {
                    'id': row[0],
                    'name': row[1],
                    'fileName': row[2],
                    'fileUrl': row[3],
                    'fieldMappings': row[4],
                    'createdAt': row[5].isoformat() if row[5] else None,
                    'updatedAt': row[6].isoformat() if row[6] else None,
                    'fileData': file_data_b64
                }
                
                return {
                    'statusCode': 200,
                    'headers': cors_headers,
                    'body': json.dumps(template),
                    'isBase64Encoded': False
                }
            else:
                # Получаем список без file_data для экономии трафика
                cursor.execute('SELECT id, name, file_name, file_url, field_mappings, created_at, updated_at FROM templates ORDER BY created_at DESC')
                rows = cursor.fetchall()
                
                templates = []
                for row in rows:
                    templates.append({
                        'id': row[0],
                        'name': row[1],
                        'fileName': row[2],
                        'fileUrl': row[3],
                        'fieldMappings': row[4],
                        'createdAt': row[5].isoformat() if row[5] else None,
                        'updatedAt': row[6].isoformat() if row[6] else None
                    })
                
                return {
                    'statusCode': 200,
                    'headers': cors_headers,
                    'body': json.dumps({'templates': templates, 'total': len(templates)}),
                    'isBase64Encoded': False
                }
        
        elif method == 'PUT':
            params = event.get('queryStringParameters') or {}
            template_id = params.get('id')
            
            if not template_id:
                return {
                    'statusCode': 400,
                    'headers': cors_headers,
                    'body': json.dumps({'error': 'Не указан ID шаблона'}),
                    'isBase64Encoded': False
                }
            
            body_data = json.loads(event.get('body', '{}'))
            
            name = body_data.get('name', '').strip()
            file_name = body_data.get('fileName', '').strip()
            file_url = body_data.get('fileUrl', '').strip() or None
            field_mappings = body_data.get('fieldMappings', [])
            file_data_b64 = body_data.get('fileData', '').strip()
            
            if not name or not file_name:
                return {
                    'statusCode': 400,
                    'headers': cors_headers,
                    'body': json.dumps({'error': 'Заполните название и имя файла'}),
                    'isBase64Encoded': False
                }
            
            # Декодируем base64 в бинарные данные (если передан файл)
            file_data_bytes = None
            if file_data_b64:
                try:
                    file_data_bytes = base64.b64decode(file_data_b64)
                except Exception as e:
                    return {
                        'statusCode': 400,
                        'headers': cors_headers,
                        'body': json.dumps({'error': f'Ошибка декодирования файла: {str(e)}'}),
                        'isBase64Encoded': False
                    }
            
            # Обновляем с или без file_data
            if file_data_bytes:
                cursor.execute('''
                    UPDATE templates SET
                        name = %s,
                        file_name = %s,
                        file_url = %s,
                        field_mappings = %s,
                        file_data = %s,
                        updated_at = CURRENT_TIMESTAMP
                    WHERE id = %s
                    RETURNING id, updated_at
                ''', (name, file_name, file_url, json.dumps(field_mappings), file_data_bytes, template_id))
            else:
                cursor.execute('''
                    UPDATE templates SET
                        name = %s,
                        file_name = %s,
                        file_url = %s,
                        field_mappings = %s,
                        updated_at = CURRENT_TIMESTAMP
                    WHERE id = %s
                    RETURNING id, updated_at
                ''', (name, file_name, file_url, json.dumps(field_mappings), template_id))
            
            result = cursor.fetchone()
            
            if not result:
                return {
                    'statusCode': 404,
                    'headers': cors_headers,
                    'body': json.dumps({'error': 'Шаблон не найден'}),
                    'isBase64Encoded': False
                }
            
            conn.commit()
            
            return {
                'statusCode': 200,
                'headers': cors_headers,
                'body': json.dumps({
                    'id': result[0],
                    'message': f'Шаблон "{name}" успешно обновлён',
                    'updatedAt': result[1].isoformat() if result[1] else None
                }),
                'isBase64Encoded': False
            }
        
        elif method == 'DELETE':
            params = event.get('queryStringParameters') or {}
            template_id = params.get('id')
            
            if not template_id:
                return {
                    'statusCode': 400,
                    'headers': cors_headers,
                    'body': json.dumps({'error': 'Не указан ID шаблона'}),
                    'isBase64Encoded': False
                }
            
            cursor.execute('SELECT name FROM templates WHERE id = %s', (template_id,))
            template_data = cursor.fetchone()
            
            if not template_data:
                return {
                    'statusCode': 404,
                    'headers': cors_headers,
                    'body': json.dumps({'error': 'Шаблон не найден'}),
                    'isBase64Encoded': False
                }
            
            cursor.execute('DELETE FROM templates WHERE id = %s', (template_id,))
            conn.commit()
            
            return {
                'statusCode': 200,
                'headers': cors_headers,
                'body': json.dumps({
                    'message': f'Шаблон "{template_data[0]}" успешно удалён'
                }),
                'isBase64Encoded': False
            }
        
        else:
            return {
                'statusCode': 405,
                'headers': cors_headers,
                'body': json.dumps({'error': 'Method not allowed'}),
                'isBase64Encoded': False
            }
    
    except psycopg2.Error as e:
        return {
            'statusCode': 500,
            'headers': cors_headers,
            'body': json.dumps({'error': f'Database error: {str(e)}'}),
            'isBase64Encoded': False
        }
    except Exception as e:
        return {
            'statusCode': 500,
            'headers': cors_headers,
            'body': json.dumps({'error': f'Server error: {str(e)}'}),
            'isBase64Encoded': False
        }
    finally:
        if 'cursor' in locals():
            cursor.close()
        if 'conn' in locals():
            conn.close()