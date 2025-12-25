import json
from typing import Dict, Any


def handle_drivers(method: str, event: Dict[str, Any], cursor, conn, cors_headers: Dict[str, str]) -> Dict[str, Any]:
    """Обработка запросов для водителей"""
    
    params = event.get('queryStringParameters') or {}
    
    if method == 'POST':
        body_data = json.loads(event.get('body', '{}'))
        
        last_name = body_data.get('lastName', '').strip()
        first_name = body_data.get('firstName', '').strip()
        
        if not last_name or not first_name:
            return {
                'statusCode': 400,
                'headers': cors_headers,
                'body': json.dumps({'error': 'Заполните обязательные поля: Фамилия, Имя'}),
                'isBase64Encoded': False
            }
        
        middle_name = body_data.get('middleName', '').strip()
        phone = body_data.get('phone', '').strip()
        phone_extra = body_data.get('phoneExtra', '').strip() or None
        passport_series = body_data.get('passportSeries', '').strip() or None
        passport_number = body_data.get('passportNumber', '').strip() or None
        passport_date = body_data.get('passportDate') or None
        passport_issued = body_data.get('passportIssued', '').strip() or None
        license_series = body_data.get('licenseSeries', '').strip() or None
        license_number = body_data.get('licenseNumber', '').strip() or None
        license_date = body_data.get('licenseDate') or None
        license_issued = body_data.get('licenseIssued', '').strip() or None
        company_id = body_data.get('companyId')
        
        # Проверка на дубликат (ФИО + телефон)
        cursor.execute('''
            SELECT id FROM drivers 
            WHERE last_name = %s 
              AND first_name = %s 
              AND COALESCE(middle_name, '') = %s 
              AND phone = %s
        ''', (last_name, first_name, middle_name, phone))
        
        existing = cursor.fetchone()
        if existing:
            return {
                'statusCode': 409,
                'headers': cors_headers,
                'body': json.dumps({'error': f'Водитель {last_name} {first_name} с телефоном {phone} уже существует'}),
                'isBase64Encoded': False
            }
        
        cursor.execute('''
            INSERT INTO drivers (
                last_name, first_name, middle_name, phone, phone_extra,
                passport_series, passport_number, passport_date, passport_issued,
                license_series, license_number, license_date, license_issued, company_id
            ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
            RETURNING id, created_at
        ''', (
            last_name, first_name, middle_name, phone, phone_extra,
            passport_series, passport_number, passport_date, passport_issued,
            license_series, license_number, license_date, license_issued, company_id
        ))
        
        result = cursor.fetchone()
        conn.commit()
        
        return {
            'statusCode': 201,
            'headers': cors_headers,
            'body': json.dumps({
                'id': result[0],
                'message': f'Водитель {last_name} {first_name} успешно добавлен',
                'createdAt': result[1].isoformat() if result[1] else None
            }),
            'isBase64Encoded': False
        }
    
    elif method == 'GET':
        driver_id = params.get('id')
        
        if driver_id:
            cursor.execute('SELECT * FROM drivers WHERE id = %s', (driver_id,))
            row = cursor.fetchone()
            
            if not row:
                return {
                    'statusCode': 404,
                    'headers': cors_headers,
                    'body': json.dumps({'error': 'Водитель не найден'}),
                    'isBase64Encoded': False
                }
            
            driver = {
                'id': row[0],
                'lastName': row[1],
                'firstName': row[2],
                'middleName': row[3],
                'phone': row[4],
                'phoneExtra': row[5],
                'passportSeries': row[6],
                'passportNumber': row[7],
                'passportDate': row[8].isoformat() if row[8] else None,
                'passportIssued': row[9],
                'licenseSeries': row[10],
                'licenseNumber': row[11],
                'licenseDate': row[12].isoformat() if row[12] else None,
                'licenseIssued': row[13],
                'createdAt': row[14].isoformat() if row[14] else None,
                'updatedAt': row[15].isoformat() if row[15] else None,
                'companyId': row[16]
            }
            
            return {
                'statusCode': 200,
                'headers': cors_headers,
                'body': json.dumps(driver),
                'isBase64Encoded': False
            }
        else:
            cursor.execute('SELECT * FROM drivers ORDER BY created_at DESC')
            rows = cursor.fetchall()
            
            drivers = []
            for row in rows:
                drivers.append({
                    'id': row[0],
                    'lastName': row[1],
                    'firstName': row[2],
                    'middleName': row[3],
                    'phone': row[4],
                    'phoneExtra': row[5],
                    'passportSeries': row[6],
                    'passportNumber': row[7],
                    'passportDate': row[8].isoformat() if row[8] else None,
                    'passportIssued': row[9],
                    'licenseSeries': row[10],
                    'licenseNumber': row[11],
                    'licenseDate': row[12].isoformat() if row[12] else None,
                    'licenseIssued': row[13],
                    'createdAt': row[14].isoformat() if row[14] else None,
                    'updatedAt': row[15].isoformat() if row[15] else None,
                    'companyId': row[16]
                })
            
            return {
                'statusCode': 200,
                'headers': cors_headers,
                'body': json.dumps({'drivers': drivers, 'total': len(drivers)}),
                'isBase64Encoded': False
            }
    
    elif method == 'PUT':
        driver_id = params.get('id')
        
        if not driver_id:
            return {
                'statusCode': 400,
                'headers': cors_headers,
                'body': json.dumps({'error': 'Не указан ID водителя'}),
                'isBase64Encoded': False
            }
        
        body_data = json.loads(event.get('body', '{}'))
        
        last_name = body_data.get('lastName', '').strip()
        first_name = body_data.get('firstName', '').strip()
        
        if not last_name or not first_name:
            return {
                'statusCode': 400,
                'headers': cors_headers,
                'body': json.dumps({'error': 'Заполните обязательные поля: Фамилия, Имя'}),
                'isBase64Encoded': False
            }
        
        middle_name = body_data.get('middleName', '').strip()
        phone = body_data.get('phone', '').strip()
        phone_extra = body_data.get('phoneExtra', '').strip() or None
        passport_series = body_data.get('passportSeries', '').strip() or None
        passport_number = body_data.get('passportNumber', '').strip() or None
        passport_date = body_data.get('passportDate') or None
        passport_issued = body_data.get('passportIssued', '').strip() or None
        license_series = body_data.get('licenseSeries', '').strip() or None
        license_number = body_data.get('licenseNumber', '').strip() or None
        license_date = body_data.get('licenseDate') or None
        license_issued = body_data.get('licenseIssued', '').strip() or None
        company_id = body_data.get('companyId')
        
        cursor.execute('''
            UPDATE drivers SET
                last_name = %s,
                first_name = %s,
                middle_name = %s,
                phone = %s,
                phone_extra = %s,
                passport_series = %s,
                passport_number = %s,
                passport_date = %s,
                passport_issued = %s,
                license_series = %s,
                license_number = %s,
                license_date = %s,
                license_issued = %s,
                company_id = %s,
                updated_at = CURRENT_TIMESTAMP
            WHERE id = %s
            RETURNING id, updated_at
        ''', (
            last_name, first_name, middle_name, phone, phone_extra,
            passport_series, passport_number, passport_date, passport_issued,
            license_series, license_number, license_date, license_issued, company_id,
            driver_id
        ))
        
        result = cursor.fetchone()
        
        if not result:
            return {
                'statusCode': 404,
                'headers': cors_headers,
                'body': json.dumps({'error': 'Водитель не найден'}),
                'isBase64Encoded': False
            }
        
        conn.commit()
        
        return {
            'statusCode': 200,
            'headers': cors_headers,
            'body': json.dumps({
                'id': result[0],
                'message': f'Водитель {last_name} {first_name} успешно обновлен',
                'updatedAt': result[1].isoformat() if result[1] else None
            }),
            'isBase64Encoded': False
        }
    
    elif method == 'DELETE':
        driver_id = params.get('id')
        
        if not driver_id:
            return {
                'statusCode': 400,
                'headers': cors_headers,
                'body': json.dumps({'error': 'Не указан ID водителя'}),
                'isBase64Encoded': False
            }
        
        cursor.execute('DELETE FROM drivers WHERE id = %s RETURNING id', (driver_id,))
        result = cursor.fetchone()
        
        if not result:
            return {
                'statusCode': 404,
                'headers': cors_headers,
                'body': json.dumps({'error': 'Водитель не найден'}),
                'isBase64Encoded': False
            }
        
        conn.commit()
        
        return {
            'statusCode': 200,
            'headers': cors_headers,
            'body': json.dumps({'message': 'Водитель успешно удален'}),
            'isBase64Encoded': False
        }
    
    return {
        'statusCode': 405,
        'headers': cors_headers,
        'body': json.dumps({'error': 'Метод не поддерживается'}),
        'isBase64Encoded': False
    }