import json
from typing import Dict, Any

def handle_vehicles(method: str, event: Dict[str, Any], cursor, conn, cors_headers: Dict[str, str]) -> Dict[str, Any]:
    '''
    Обработка всех CRUD операций для автомобилей (vehicles)
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
        
        brand = body_data.get('brand', '').strip()
        registration_number = body_data.get('registrationNumber', '').strip()
        
        if not brand or not registration_number:
            return {
                'statusCode': 400,
                'headers': cors_headers,
                'body': json.dumps({'error': 'Заполните обязательные поля: Марка ТС, Номер ТС'}),
                'isBase64Encoded': False
            }
        
        capacity = body_data.get('capacity')
        trailer_number = body_data.get('trailerNumber', '').strip() or None
        trailer_type = body_data.get('trailerType', '').strip() or None
        company_id = body_data.get('companyId')
        driver_id = body_data.get('driverId')
        
        cursor.execute('''
            INSERT INTO vehicles (
                brand, registration_number, capacity, trailer_number, trailer_type,
                company_id, driver_id
            ) VALUES (%s, %s, %s, %s, %s, %s, %s)
            RETURNING id, created_at
        ''', (
            brand, registration_number, capacity, trailer_number, trailer_type,
            company_id, driver_id
        ))
        
        result = cursor.fetchone()
        conn.commit()
        
        return {
            'statusCode': 201,
            'headers': cors_headers,
            'body': json.dumps({
                'id': result[0],
                'message': f'Автомобиль {brand} {registration_number} успешно добавлен',
                'createdAt': result[1].isoformat() if result[1] else None
            }),
            'isBase64Encoded': False
        }
    
    elif method == 'GET':
        vehicle_id = params.get('id')
        
        if vehicle_id:
            cursor.execute('SELECT * FROM vehicles WHERE id = %s', (vehicle_id,))
            row = cursor.fetchone()
            
            if not row:
                return {
                    'statusCode': 404,
                    'headers': cors_headers,
                    'body': json.dumps({'error': 'Автомобиль не найден'}),
                    'isBase64Encoded': False
                }
            
            vehicle = {
                'id': row[0],
                'brand': row[1],
                'registrationNumber': row[2],
                'capacity': float(row[3]) if row[3] else None,
                'trailerNumber': row[4],
                'trailerType': row[5],
                'companyId': row[6],
                'driverId': row[7],
                'createdAt': row[8].isoformat() if row[8] else None,
                'updatedAt': row[9].isoformat() if row[9] else None
            }
            
            return {
                'statusCode': 200,
                'headers': cors_headers,
                'body': json.dumps(vehicle),
                'isBase64Encoded': False
            }
        else:
            cursor.execute('SELECT * FROM vehicles ORDER BY created_at DESC')
            rows = cursor.fetchall()
            
            vehicles = []
            for row in rows:
                vehicles.append({
                    'id': row[0],
                    'brand': row[1],
                    'registrationNumber': row[2],
                    'capacity': float(row[3]) if row[3] else None,
                    'trailerNumber': row[4],
                    'trailerType': row[5],
                    'companyId': row[6],
                    'driverId': row[7],
                    'createdAt': row[8].isoformat() if row[8] else None,
                    'updatedAt': row[9].isoformat() if row[9] else None
                })
            
            return {
                'statusCode': 200,
                'headers': cors_headers,
                'body': json.dumps({'vehicles': vehicles, 'total': len(vehicles)}),
                'isBase64Encoded': False
            }
    
    elif method == 'PUT':
        vehicle_id = params.get('id')
        
        if not vehicle_id:
            return {
                'statusCode': 400,
                'headers': cors_headers,
                'body': json.dumps({'error': 'Не указан ID автомобиля'}),
                'isBase64Encoded': False
            }
        
        body_data = json.loads(event.get('body', '{}'))
        
        brand = body_data.get('brand', '').strip()
        registration_number = body_data.get('registrationNumber', '').strip()
        
        if not brand or not registration_number:
            return {
                'statusCode': 400,
                'headers': cors_headers,
                'body': json.dumps({'error': 'Заполните обязательные поля: Марка ТС, Номер ТС'}),
                'isBase64Encoded': False
            }
        
        capacity = body_data.get('capacity')
        trailer_number = body_data.get('trailerNumber', '').strip() or None
        trailer_type = body_data.get('trailerType', '').strip() or None
        company_id = body_data.get('companyId')
        driver_id = body_data.get('driverId')
        
        cursor.execute('''
            UPDATE vehicles
            SET brand = %s,
                registration_number = %s,
                capacity = %s,
                trailer_number = %s,
                trailer_type = %s,
                company_id = %s,
                driver_id = %s,
                updated_at = CURRENT_TIMESTAMP
            WHERE id = %s
            RETURNING id, updated_at
        ''', (
            brand, registration_number, capacity, trailer_number, trailer_type,
            company_id, driver_id, vehicle_id
        ))
        
        result = cursor.fetchone()
        
        if not result:
            return {
                'statusCode': 404,
                'headers': cors_headers,
                'body': json.dumps({'error': 'Автомобиль не найден'}),
                'isBase64Encoded': False
            }
        
        conn.commit()
        
        return {
            'statusCode': 200,
            'headers': cors_headers,
            'body': json.dumps({
                'id': result[0],
                'message': f'Автомобиль {brand} {registration_number} успешно обновлен',
                'updatedAt': result[1].isoformat() if result[1] else None
            }),
            'isBase64Encoded': False
        }
    
    elif method == 'DELETE':
        vehicle_id = params.get('id')
        
        if not vehicle_id:
            return {
                'statusCode': 400,
                'headers': cors_headers,
                'body': json.dumps({'error': 'Не указан ID автомобиля'}),
                'isBase64Encoded': False
            }
        
        cursor.execute('DELETE FROM vehicles WHERE id = %s RETURNING id', (vehicle_id,))
        result = cursor.fetchone()
        
        if not result:
            return {
                'statusCode': 404,
                'headers': cors_headers,
                'body': json.dumps({'error': 'Автомобиль не найден'}),
                'isBase64Encoded': False
            }
        
        conn.commit()
        
        return {
            'statusCode': 200,
            'headers': cors_headers,
            'body': json.dumps({'message': 'Автомобиль успешно удален'}),
            'isBase64Encoded': False
        }
    
    else:
        return {
            'statusCode': 405,
            'headers': cors_headers,
            'body': json.dumps({'error': f'Метод {method} не поддерживается'}),
            'isBase64Encoded': False
        }
