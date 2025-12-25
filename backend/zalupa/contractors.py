import json
from typing import Dict, Any

def handle_contractors(method: str, event: Dict[str, Any], cursor, conn, cors_headers: Dict[str, str]) -> Dict[str, Any]:
    '''
    Обработка всех CRUD операций для контрагентов (contractors)
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
    
    else:
        return {
            'statusCode': 405,
            'headers': cors_headers,
            'body': json.dumps({'error': f'Метод {method} не поддерживается'}),
            'isBase64Encoded': False
        }
