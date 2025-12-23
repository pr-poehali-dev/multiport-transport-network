import json
import psycopg2
import os
from typing import Dict, Any
from datetime import datetime

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    '''
    API для управления водителями - создание, чтение, обновление, удаление
    Args: event - dict с httpMethod, body, queryStringParameters
          context - объект с атрибутами request_id, function_name
    Returns: HTTP response dict
    '''
    method: str = event.get('httpMethod', 'GET')
    
    # CORS для всех запросов
    cors_headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, X-User-Id, X-Auth-Token',
        'Access-Control-Max-Age': '86400',
        'Content-Type': 'application/json'
    }
    
    # OPTIONS для CORS preflight
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': cors_headers,
            'body': '',
            'isBase64Encoded': False
        }
    
    # Подключение к БД
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
            # Создание нового водителя
            body_data = json.loads(event.get('body', '{}'))
            
            # Обязательные поля
            last_name = body_data.get('lastName', '').strip()
            first_name = body_data.get('firstName', '').strip()
            phone = body_data.get('phone', '').strip()
            
            if not last_name or not first_name or not phone:
                return {
                    'statusCode': 400,
                    'headers': cors_headers,
                    'body': json.dumps({'error': 'Заполните обязательные поля: Фамилия, Имя, Телефон'}),
                    'isBase64Encoded': False
                }
            
            # Опциональные поля
            middle_name = body_data.get('middleName', '').strip() or None
            phone_extra = body_data.get('phoneExtra', '').strip() or None
            
            # Паспорт
            passport_series = body_data.get('passportSeries', '').strip() or None
            passport_number = body_data.get('passportNumber', '').strip() or None
            passport_date = body_data.get('passportDate', '').strip() or None
            passport_issued = body_data.get('passportIssued', '').strip() or None
            
            # Водительское удостоверение
            license_series = body_data.get('licenseSeries', '').strip() or None
            license_number = body_data.get('licenseNumber', '').strip() or None
            license_date = body_data.get('licenseDate', '').strip() or None
            license_issued = body_data.get('licenseIssued', '').strip() or None
            
            # Вставка в БД
            cursor.execute('''
                INSERT INTO drivers (
                    last_name, first_name, middle_name, phone, phone_extra,
                    passport_series, passport_number, passport_date, passport_issued,
                    license_series, license_number, license_date, license_issued
                ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                RETURNING id, created_at
            ''', (
                last_name, first_name, middle_name, phone, phone_extra,
                passport_series, passport_number, passport_date, passport_issued,
                license_series, license_number, license_date, license_issued
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
            # Получение списка водителей
            params = event.get('queryStringParameters') or {}
            driver_id = params.get('id')
            
            if driver_id:
                # Получить одного водителя по ID
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
                    'updatedAt': row[15].isoformat() if row[15] else None
                }
                
                return {
                    'statusCode': 200,
                    'headers': cors_headers,
                    'body': json.dumps(driver),
                    'isBase64Encoded': False
                }
            else:
                # Получить всех водителей
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
                        'updatedAt': row[15].isoformat() if row[15] else None
                    })
                
                return {
                    'statusCode': 200,
                    'headers': cors_headers,
                    'body': json.dumps({'drivers': drivers, 'total': len(drivers)}),
                    'isBase64Encoded': False
                }
        
        elif method == 'PUT':
            # Обновление водителя
            params = event.get('queryStringParameters') or {}
            driver_id = params.get('id')
            
            if not driver_id:
                return {
                    'statusCode': 400,
                    'headers': cors_headers,
                    'body': json.dumps({'error': 'Не указан ID водителя'}),
                    'isBase64Encoded': False
                }
            
            body_data = json.loads(event.get('body', '{}'))
            
            # Обязательные поля
            last_name = body_data.get('lastName', '').strip()
            first_name = body_data.get('firstName', '').strip()
            phone = body_data.get('phone', '').strip()
            
            if not last_name or not first_name or not phone:
                return {
                    'statusCode': 400,
                    'headers': cors_headers,
                    'body': json.dumps({'error': 'Заполните обязательные поля: Фамилия, Имя, Телефон'}),
                    'isBase64Encoded': False
                }
            
            # Опциональные поля
            middle_name = body_data.get('middleName', '').strip() or None
            phone_extra = body_data.get('phoneExtra', '').strip() or None
            passport_series = body_data.get('passportSeries', '').strip() or None
            passport_number = body_data.get('passportNumber', '').strip() or None
            passport_date = body_data.get('passportDate', '').strip() or None
            passport_issued = body_data.get('passportIssued', '').strip() or None
            license_series = body_data.get('licenseSeries', '').strip() or None
            license_number = body_data.get('licenseNumber', '').strip() or None
            license_date = body_data.get('licenseDate', '').strip() or None
            license_issued = body_data.get('licenseIssued', '').strip() or None
            
            # Обновление в БД
            cursor.execute('''
                UPDATE drivers SET
                    last_name = %s, first_name = %s, middle_name = %s,
                    phone = %s, phone_extra = %s,
                    passport_series = %s, passport_number = %s,
                    passport_date = %s, passport_issued = %s,
                    license_series = %s, license_number = %s,
                    license_date = %s, license_issued = %s,
                    updated_at = CURRENT_TIMESTAMP
                WHERE id = %s
                RETURNING id, updated_at
            ''', (
                last_name, first_name, middle_name, phone, phone_extra,
                passport_series, passport_number, passport_date, passport_issued,
                license_series, license_number, license_date, license_issued,
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
                    'message': f'Водитель {last_name} {first_name} успешно обновлён',
                    'updatedAt': result[1].isoformat() if result[1] else None
                }),
                'isBase64Encoded': False
            }
        
        elif method == 'DELETE':
            # Удаление водителя
            params = event.get('queryStringParameters') or {}
            driver_id = params.get('id')
            
            if not driver_id:
                return {
                    'statusCode': 400,
                    'headers': cors_headers,
                    'body': json.dumps({'error': 'Не указан ID водителя'}),
                    'isBase64Encoded': False
                }
            
            # Проверка существования
            cursor.execute('SELECT last_name, first_name FROM drivers WHERE id = %s', (driver_id,))
            driver_data = cursor.fetchone()
            
            if not driver_data:
                return {
                    'statusCode': 404,
                    'headers': cors_headers,
                    'body': json.dumps({'error': 'Водитель не найден'}),
                    'isBase64Encoded': False
                }
            
            # Удаление
            cursor.execute('DELETE FROM drivers WHERE id = %s', (driver_id,))
            conn.commit()
            
            return {
                'statusCode': 200,
                'headers': cors_headers,
                'body': json.dumps({
                    'message': f'Водитель {driver_data[0]} {driver_data[1]} успешно удалён'
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