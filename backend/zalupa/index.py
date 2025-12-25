import json
import psycopg2
import os
import base64
from typing import Dict, Any

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    '''
    API для управления водителями, автомобилями, PDF шаблонами и контрагентами
    Args: event - dict с httpMethod, body, queryStringParameters
          context - объект с атрибутами request_id, function_name
    Returns: HTTP response dict
    '''
    method: str = event.get('httpMethod', 'GET')
    path: str = event.get('path', '')
    
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
        
        # Определяем, с чем работаем - drivers, vehicles, templates или contractors
        params = event.get('queryStringParameters') or {}
        resource = params.get('resource', 'drivers')  # По умолчанию drivers
        
        # === АВТОМОБИЛИ (VEHICLES) ===
        if resource == 'vehicles':
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
                    UPDATE vehicles SET
                        brand = %s,
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
                        'message': f'Автомобиль {brand} {registration_number} обновлён',
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
                    'body': json.dumps({'message': 'Автомобиль удалён'}),
                    'isBase64Encoded': False
                }
        
        # === ШАБЛОНЫ (TEMPLATES) ===
        if resource == 'templates':
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
        
        # === КОНТРАГЕНТЫ (CONTRACTORS) ===
        elif resource == 'contractors':
            if method == 'POST':
                body_data = json.loads(event.get('body', '{}'))
                
                name = (body_data.get('name') or '').strip()
                inn = (body_data.get('inn') or '').strip()
                
                if not name or not inn:
                    return {
                        'statusCode': 400,
                        'headers': cors_headers,
                        'body': json.dumps({'error': 'Заполните обязательные поля: Наименование, ИНН'}),
                        'isBase64Encoded': False
                    }
                
                kpp = (body_data.get('kpp') or '').strip() or None
                ogrn = (body_data.get('ogrn') or '').strip() or None
                director = (body_data.get('director') or '').strip() or None
                legal_address = (body_data.get('legalAddress') or '').strip() or None
                actual_address = (body_data.get('actualAddress') or '').strip() or None
                postal_address = (body_data.get('postalAddress') or '').strip() or None
                is_seller = body_data.get('isSeller', False)
                is_buyer = body_data.get('isBuyer', False)
                is_carrier = body_data.get('isCarrier', False)
                bank_accounts = json.dumps(body_data.get('bankAccounts', []))
                delivery_addresses = json.dumps(body_data.get('deliveryAddresses', []))
                
                cursor.execute('''
                    INSERT INTO contractors (
                        name, inn, kpp, ogrn, director, legal_address, actual_address, postal_address,
                        is_seller, is_buyer, is_carrier, bank_accounts, delivery_addresses
                    ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s::jsonb, %s::jsonb)
                    RETURNING id, created_at
                ''', (
                    name, inn, kpp, ogrn, director, legal_address, actual_address, postal_address,
                    is_seller, is_buyer, is_carrier, bank_accounts, delivery_addresses
                ))
                
                result = cursor.fetchone()
                conn.commit()
                
                return {
                    'statusCode': 201,
                    'headers': cors_headers,
                    'body': json.dumps({
                        'id': result[0],
                        'message': f'Контрагент {name} успешно добавлен',
                        'createdAt': result[1].isoformat() if result[1] else None
                    }),
                    'isBase64Encoded': False
                }
            
            elif method == 'GET':
                contractor_id = params.get('id')
                
                if contractor_id:
                    cursor.execute('SELECT * FROM contractors WHERE id = %s', (contractor_id,))
                    row = cursor.fetchone()
                    
                    if not row:
                        return {
                            'statusCode': 404,
                            'headers': cors_headers,
                            'body': json.dumps({'error': 'Контрагент не найден'}),
                            'isBase64Encoded': False
                        }
                    
                    contractor = {
                        'id': row[0],
                        'name': row[1],
                        'inn': row[2],
                        'kpp': row[3],
                        'ogrn': row[4],
                        'director': row[5],
                        'legalAddress': row[6],
                        'actualAddress': row[7],
                        'postalAddress': row[8],
                        'isSeller': row[9],
                        'isBuyer': row[10],
                        'isCarrier': row[11],
                        'bankAccounts': row[12] if row[12] else [],
                        'deliveryAddresses': row[13] if row[13] else [],
                        'createdAt': row[14].isoformat() if row[14] else None,
                        'updatedAt': row[15].isoformat() if row[15] else None
                    }
                    
                    return {
                        'statusCode': 200,
                        'headers': cors_headers,
                        'body': json.dumps(contractor),
                        'isBase64Encoded': False
                    }
                else:
                    cursor.execute('SELECT * FROM contractors ORDER BY created_at DESC')
                    rows = cursor.fetchall()
                    
                    contractors = []
                    for row in rows:
                        contractors.append({
                            'id': row[0],
                            'name': row[1],
                            'inn': row[2],
                            'kpp': row[3],
                            'ogrn': row[4],
                            'director': row[5],
                            'legalAddress': row[6],
                            'actualAddress': row[7],
                            'postalAddress': row[8],
                            'isSeller': row[9],
                            'isBuyer': row[10],
                            'isCarrier': row[11],
                            'bankAccounts': row[12] if row[12] else [],
                            'deliveryAddresses': row[13] if row[13] else [],
                            'createdAt': row[14].isoformat() if row[14] else None,
                            'updatedAt': row[15].isoformat() if row[15] else None
                        })
                    
                    return {
                        'statusCode': 200,
                        'headers': cors_headers,
                        'body': json.dumps({'contractors': contractors, 'total': len(contractors)}),
                        'isBase64Encoded': False
                    }
            
            elif method == 'PUT':
                contractor_id = params.get('id')
                
                if not contractor_id:
                    return {
                        'statusCode': 400,
                        'headers': cors_headers,
                        'body': json.dumps({'error': 'Не указан ID контрагента'}),
                        'isBase64Encoded': False
                    }
                
                body_data = json.loads(event.get('body', '{}'))
                
                name = (body_data.get('name') or '').strip()
                inn = (body_data.get('inn') or '').strip()
                
                if not name or not inn:
                    return {
                        'statusCode': 400,
                        'headers': cors_headers,
                        'body': json.dumps({'error': 'Заполните обязательные поля: Наименование, ИНН'}),
                        'isBase64Encoded': False
                    }
                
                kpp = (body_data.get('kpp') or '').strip() or None
                ogrn = (body_data.get('ogrn') or '').strip() or None
                director = (body_data.get('director') or '').strip() or None
                legal_address = (body_data.get('legalAddress') or '').strip() or None
                actual_address = (body_data.get('actualAddress') or '').strip() or None
                postal_address = (body_data.get('postalAddress') or '').strip() or None
                is_seller = body_data.get('isSeller', False)
                is_buyer = body_data.get('isBuyer', False)
                is_carrier = body_data.get('isCarrier', False)
                bank_accounts = json.dumps(body_data.get('bankAccounts', []))
                delivery_addresses = json.dumps(body_data.get('deliveryAddresses', []))
                
                cursor.execute('''
                    UPDATE contractors SET
                        name = %s,
                        inn = %s,
                        kpp = %s,
                        ogrn = %s,
                        director = %s,
                        legal_address = %s,
                        actual_address = %s,
                        postal_address = %s,
                        is_seller = %s,
                        is_buyer = %s,
                        is_carrier = %s,
                        bank_accounts = %s::jsonb,
                        delivery_addresses = %s::jsonb,
                        updated_at = CURRENT_TIMESTAMP
                    WHERE id = %s
                    RETURNING id, updated_at
                ''', (
                    name, inn, kpp, ogrn, director, legal_address, actual_address, postal_address,
                    is_seller, is_buyer, is_carrier, bank_accounts, delivery_addresses, contractor_id
                ))
                
                result = cursor.fetchone()
                
                if not result:
                    return {
                        'statusCode': 404,
                        'headers': cors_headers,
                        'body': json.dumps({'error': 'Контрагент не найден'}),
                        'isBase64Encoded': False
                    }
                
                conn.commit()
                
                return {
                    'statusCode': 200,
                    'headers': cors_headers,
                    'body': json.dumps({
                        'message': f'Контрагент {name} успешно обновлён',
                        'updatedAt': result[1].isoformat() if result[1] else None
                    }),
                    'isBase64Encoded': False
                }
            
            elif method == 'DELETE':
                contractor_id = params.get('id')
                
                if not contractor_id:
                    return {
                        'statusCode': 400,
                        'headers': cors_headers,
                        'body': json.dumps({'error': 'Не указан ID контрагента'}),
                        'isBase64Encoded': False
                    }
                
                cursor.execute('DELETE FROM contractors WHERE id = %s RETURNING id', (contractor_id,))
                result = cursor.fetchone()
                
                if not result:
                    return {
                        'statusCode': 404,
                        'headers': cors_headers,
                        'body': json.dumps({'error': 'Контрагент не найден'}),
                        'isBase64Encoded': False
                    }
                
                conn.commit()
                
                return {
                    'statusCode': 200,
                    'headers': cors_headers,
                    'body': json.dumps({'message': 'Контрагент удалён'}),
                    'isBase64Encoded': False
                }
        
        # === ВОДИТЕЛИ (DRIVERS) - по умолчанию ===
        else:
            if method == 'POST':
                body_data = json.loads(event.get('body', '{}'))
                
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
                        'updatedAt': row[15].isoformat() if row[15] else None
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
                            'updatedAt': row[15].isoformat() if row[15] else None
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
                phone = body_data.get('phone', '').strip()
                
                if not last_name or not first_name or not phone:
                    return {
                        'statusCode': 400,
                        'headers': cors_headers,
                        'body': json.dumps({'error': 'Заполните обязательные поля: Фамилия, Имя, Телефон'}),
                        'isBase64Encoded': False
                    }
                
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
                        'message': f'Водитель {last_name} {first_name} обновлён',
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
                    'body': json.dumps({'message': 'Водитель удалён'}),
                    'isBase64Encoded': False
                }
        
        cursor.close()
        conn.close()
        
        return {
            'statusCode': 405,
            'headers': cors_headers,
            'body': json.dumps({'error': 'Method not allowed'}),
            'isBase64Encoded': False
        }
    
    except Exception as e:
        return {
            'statusCode': 500,
            'headers': cors_headers,
            'body': json.dumps({'error': str(e)}),
            'isBase64Encoded': False
        }
                contractor_id = params.get('id')
                
                if not contractor_id:
                    return {
                        'statusCode': 400,
                        'headers': cors_headers,
                        'body': json.dumps({'error': 'Не указан ID контрагента'}),
                        'isBase64Encoded': False
                    }
                
                body_data = json.loads(event.get('body', '{}'))
                
                name = (body_data.get('name') or '').strip()
                inn = (body_data.get('inn') or '').strip()
                
                if not name or not inn:
                    return {
                        'statusCode': 400,
                        'headers': cors_headers,
                        'body': json.dumps({'error': 'Заполните обязательные поля: Наименование, ИНН'}),
                        'isBase64Encoded': False
                    }
                
                kpp = (body_data.get('kpp') or '').strip() or None
                ogrn = (body_data.get('ogrn') or '').strip() or None
                director = (body_data.get('director') or '').strip() or None
                legal_address = (body_data.get('legalAddress') or '').strip() or None
                actual_address = (body_data.get('actualAddress') or '').strip() or None
                postal_address = (body_data.get('postalAddress') or '').strip() or None
                is_seller = body_data.get('isSeller', False)
                is_buyer = body_data.get('isBuyer', False)
                is_carrier = body_data.get('isCarrier', False)
                bank_accounts = json.dumps(body_data.get('bankAccounts', []))
                delivery_addresses = json.dumps(body_data.get('deliveryAddresses', []))
                
                cursor.execute('''
                    UPDATE contractors SET
                        name = %s,
                        inn = %s,
                        kpp = %s,
                        ogrn = %s,
                        director = %s,
                        legal_address = %s,
                        actual_address = %s,
                        postal_address = %s,
                        is_seller = %s,
                        is_buyer = %s,
                        is_carrier = %s,
                        bank_accounts = %s::jsonb,
                        delivery_addresses = %s::jsonb,
                        updated_at = CURRENT_TIMESTAMP
                    WHERE id = %s
                    RETURNING id, updated_at
                ''', (
                    name, inn, kpp, ogrn, director, legal_address, actual_address, postal_address,
                    is_seller, is_buyer, is_carrier, bank_accounts, delivery_addresses, contractor_id
                ))
                
                result = cursor.fetchone()
                
                if not result:
                    return {
                        'statusCode': 404,
                        'headers': cors_headers,
                        'body': json.dumps({'error': 'Контрагент не найден'}),
                        'isBase64Encoded': False
                    }
                
                conn.commit()
                
                return {
                    'statusCode': 200,
                    'headers': cors_headers,
                    'body': json.dumps({
                        'message': f'Контрагент {name} успешно обновлён',
                        'updatedAt': result[1].isoformat() if result[1] else None
                    }),
                    'isBase64Encoded': False
                }
            
            elif method == 'DELETE':
                contractor_id = params.get('id')
                
                if not contractor_id:
                    return {
                        'statusCode': 400,
                        'headers': cors_headers,
                        'body': json.dumps({'error': 'Не указан ID контрагента'}),
                        'isBase64Encoded': False
                    }
                
                cursor.execute('DELETE FROM contractors WHERE id = %s RETURNING id', (contractor_id,))
                result = cursor.fetchone()
                
                if not result:
                    return {
                        'statusCode': 404,
                        'headers': cors_headers,
                        'body': json.dumps({'error': 'Контрагент не найден'}),
                        'isBase64Encoded': False
                    }
                
                conn.commit()
                
                return {
                    'statusCode': 200,
                    'headers': cors_headers,
                    'body': json.dumps({'message': 'Контрагент удалён'}),
                    'isBase64Encoded': False
                }
        
        cursor.close()
        conn.close()
        
        return {
            'statusCode': 405,
            'headers': cors_headers,
            'body': json.dumps({'error': 'Method not allowed'}),
            'isBase64Encoded': False
        }
    
    except Exception as e:
        return {
            'statusCode': 500,
            'headers': cors_headers,
            'body': json.dumps({'error': str(e)}),
            'isBase64Encoded': False
        }