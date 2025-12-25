import json
import base64
from typing import Dict, Any

def handle_templates(method: str, event: Dict[str, Any], cursor, conn, cors_headers: Dict[str, str]) -> Dict[str, Any]:
    '''
    Обработка всех CRUD операций для PDF шаблонов (templates)
    Args:
        method - HTTP метод (GET, POST, PUT, DELETE)
        event - dict с данными события
        cursor - курсор БД
        conn - соединение с БД
        cors_headers - заголовки CORS
    Returns:
        HTTP response dict
    '''
    params = event.get('queryStringParameters') or {}
    
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
            
            file_data_b64 = None
            if row[7]:
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
                'message': f'Шаблон "{name}" обновлён',
                'updatedAt': result[1].isoformat() if result[1] else None
            }),
            'isBase64Encoded': False
        }
    
    elif method == 'DELETE':
        template_id = params.get('id')
        
        if not template_id:
            return {
                'statusCode': 400,
                'headers': cors_headers,
                'body': json.dumps({'error': 'Не указан ID шаблона'}),
                'isBase64Encoded': False
            }
        
        cursor.execute('DELETE FROM templates WHERE id = %s RETURNING id', (template_id,))
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
            'body': json.dumps({'message': 'Шаблон удалён'}),
            'isBase64Encoded': False
        }
    
    else:
        return {
            'statusCode': 405,
            'headers': cors_headers,
            'body': json.dumps({'error': f'Метод {method} не поддерживается'}),
            'isBase64Encoded': False
        }
