import json
from typing import Dict, Any
from psycopg2.extras import RealDictCursor


def handle_contracts(method: str, event: Dict[str, Any], cursor, conn, cors_headers: Dict[str, str]) -> Dict[str, Any]:
    '''Обработка запросов для договоров-заявок'''
    
    params = event.get('queryStringParameters') or {}
    contract_id = params.get('id')
    
    if method == 'GET':
        if contract_id:
            return get_contract_by_id(cursor, contract_id, cors_headers)
        else:
            return get_all_contracts(cursor, cors_headers)
    
    elif method == 'POST':
        return create_contract(event, cursor, conn, cors_headers)
    
    elif method == 'PUT':
        if not contract_id:
            return {
                'statusCode': 400,
                'headers': cors_headers,
                'body': json.dumps({'error': 'ID договора обязателен'}),
                'isBase64Encoded': False
            }
        return update_contract(contract_id, event, cursor, conn, cors_headers)
    
    elif method == 'DELETE':
        if not contract_id:
            return {
                'statusCode': 400,
                'headers': cors_headers,
                'body': json.dumps({'error': 'ID договора обязателен'}),
                'isBase64Encoded': False
            }
        return delete_contract(contract_id, cursor, conn, cors_headers)
    
    return {
        'statusCode': 405,
        'headers': cors_headers,
        'body': json.dumps({'error': 'Метод не поддерживается'}),
        'isBase64Encoded': False
    }


def get_all_contracts(cursor, cors_headers: Dict[str, str]) -> Dict[str, Any]:
    '''Получить все договоры-заявки с информацией о контрагентах'''
    
    cursor = cursor.connection.cursor(cursor_factory=RealDictCursor)
    
    cursor.execute('''
        SELECT 
            c.*,
            customer.name as customer_name,
            carrier.name as carrier_name,
            loading_seller.name as loading_seller_name,
            unloading_buyer.name as unloading_buyer_name
        FROM contracts c
        LEFT JOIN contractors customer ON c.customer_id = customer.id
        LEFT JOIN contractors carrier ON c.carrier_id = carrier.id
        LEFT JOIN contractors loading_seller ON c.loading_seller_id = loading_seller.id
        LEFT JOIN contractors unloading_buyer ON c.unloading_buyer_id = unloading_buyer.id
        ORDER BY c.created_at DESC
    ''')
    
    contracts = cursor.fetchall()
    
    return {
        'statusCode': 200,
        'headers': cors_headers,
        'body': json.dumps({
            'contracts': [dict(c) for c in contracts],
            'total': len(contracts)
        }, default=str),
        'isBase64Encoded': False
    }


def get_contract_by_id(cursor, contract_id: str, cors_headers: Dict[str, str]) -> Dict[str, Any]:
    '''Получить один договор-заявку по ID'''
    
    cursor = cursor.connection.cursor(cursor_factory=RealDictCursor)
    
    cursor.execute('''
        SELECT 
            c.*,
            customer.name as customer_name,
            carrier.name as carrier_name,
            loading_seller.name as loading_seller_name,
            unloading_buyer.name as unloading_buyer_name
        FROM contracts c
        LEFT JOIN contractors customer ON c.customer_id = customer.id
        LEFT JOIN contractors carrier ON c.carrier_id = carrier.id
        LEFT JOIN contractors loading_seller ON c.loading_seller_id = loading_seller.id
        LEFT JOIN contractors unloading_buyer ON c.unloading_buyer_id = unloading_buyer.id
        WHERE c.id = %s
    ''', (contract_id,))
    
    contract = cursor.fetchone()
    
    if not contract:
        return {
            'statusCode': 404,
            'headers': cors_headers,
            'body': json.dumps({'error': 'Договор не найден'}),
            'isBase64Encoded': False
        }
    
    return {
        'statusCode': 200,
        'headers': cors_headers,
        'body': json.dumps(dict(contract), default=str),
        'isBase64Encoded': False
    }


def create_contract(event: Dict[str, Any], cursor, conn, cors_headers: Dict[str, str]) -> Dict[str, Any]:
    '''Создать новый договор-заявку'''
    
    body = json.loads(event.get('body', '{}'))
    
    # Обязательные поля
    contract_number = body.get('contractNumber', '').strip()
    contract_date = body.get('contractDate')
    cargo = body.get('cargo', '').strip()
    
    if not contract_number or not contract_date or not cargo:
        return {
            'statusCode': 400,
            'headers': cors_headers,
            'body': json.dumps({'error': 'Номер договора, дата и груз обязательны'}),
            'isBase64Encoded': False
        }
    
    # Проверка уникальности номера
    cursor.execute('SELECT id FROM contracts WHERE contract_number = %s', (contract_number,))
    if cursor.fetchone():
        return {
            'statusCode': 400,
            'headers': cors_headers,
            'body': json.dumps({'error': 'Договор с таким номером уже существует'}),
            'isBase64Encoded': False
        }
    
    # Вставка
    cursor.execute('''
        INSERT INTO contracts (
            contract_number, contract_date, customer_id, carrier_id,
            vehicle_type, vehicle_capacity_tons, vehicle_capacity_m3,
            temperature_mode, additional_conditions, cargo,
            loading_seller_id, loading_addresses, loading_date,
            unloading_buyer_id, unloading_addresses, unloading_date,
            payment_amount, taxation_type, payment_terms,
            driver_id, driver_full_name, driver_phone, driver_phone_extra,
            driver_passport, driver_license,
            vehicle_id, vehicle_registration_number, vehicle_trailer_number, vehicle_brand
        ) VALUES (
            %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s,
            %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s
        ) RETURNING id, created_at
    ''', (
        contract_number, contract_date, body.get('customerId'), body.get('carrierId'),
        body.get('vehicleType'), body.get('vehicleCapacityTons'), body.get('vehicleCapacityM3'),
        body.get('temperatureMode'), body.get('additionalConditions'), cargo,
        body.get('loadingSellerId'), json.dumps(body.get('loadingAddresses', [])), body.get('loadingDate'),
        body.get('unloadingBuyerId'), json.dumps(body.get('unloadingAddresses', [])), body.get('unloadingDate'),
        body.get('paymentAmount'), body.get('taxationType'), body.get('paymentTerms'),
        body.get('driverId'), body.get('driverFullName'), body.get('driverPhone'), body.get('driverPhoneExtra'),
        body.get('driverPassport'), body.get('driverLicense'),
        body.get('vehicleId'), body.get('vehicleRegistrationNumber'), body.get('vehicleTrailerNumber'), body.get('vehicleBrand')
    ))
    
    result = cursor.fetchone()
    conn.commit()
    
    return {
        'statusCode': 201,
        'headers': cors_headers,
        'body': json.dumps({
            'id': result[0],
            'message': 'Договор-заявка успешно создан',
            'createdAt': str(result[1])
        }),
        'isBase64Encoded': False
    }


def update_contract(contract_id: str, event: Dict[str, Any], cursor, conn, cors_headers: Dict[str, str]) -> Dict[str, Any]:
    '''Обновить договор-заявку'''
    
    body = json.loads(event.get('body', '{}'))
    
    # Проверка существования
    cursor.execute('SELECT id FROM contracts WHERE id = %s', (contract_id,))
    if not cursor.fetchone():
        return {
            'statusCode': 404,
            'headers': cors_headers,
            'body': json.dumps({'error': 'Договор не найден'}),
            'isBase64Encoded': False
        }
    
    # Обновление
    cursor.execute('''
        UPDATE contracts SET
            contract_number = %s, contract_date = %s, customer_id = %s, carrier_id = %s,
            vehicle_type = %s, vehicle_capacity_tons = %s, vehicle_capacity_m3 = %s,
            temperature_mode = %s, additional_conditions = %s, cargo = %s,
            loading_seller_id = %s, loading_addresses = %s, loading_date = %s,
            unloading_buyer_id = %s, unloading_addresses = %s, unloading_date = %s,
            payment_amount = %s, taxation_type = %s, payment_terms = %s,
            driver_id = %s, driver_full_name = %s, driver_phone = %s, driver_phone_extra = %s,
            driver_passport = %s, driver_license = %s,
            vehicle_id = %s, vehicle_registration_number = %s, vehicle_trailer_number = %s, vehicle_brand = %s,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = %s
    ''', (
        body.get('contractNumber'), body.get('contractDate'), body.get('customerId'), body.get('carrierId'),
        body.get('vehicleType'), body.get('vehicleCapacityTons'), body.get('vehicleCapacityM3'),
        body.get('temperatureMode'), body.get('additionalConditions'), body.get('cargo'),
        body.get('loadingSellerId'), json.dumps(body.get('loadingAddresses', [])), body.get('loadingDate'),
        body.get('unloadingBuyerId'), json.dumps(body.get('unloadingAddresses', [])), body.get('unloadingDate'),
        body.get('paymentAmount'), body.get('taxationType'), body.get('paymentTerms'),
        body.get('driverId'), body.get('driverFullName'), body.get('driverPhone'), body.get('driverPhoneExtra'),
        body.get('driverPassport'), body.get('driverLicense'),
        body.get('vehicleId'), body.get('vehicleRegistrationNumber'), body.get('vehicleTrailerNumber'), body.get('vehicleBrand'),
        contract_id
    ))
    
    conn.commit()
    
    return {
        'statusCode': 200,
        'headers': cors_headers,
        'body': json.dumps({'message': 'Договор-заявка успешно обновлён'}),
        'isBase64Encoded': False
    }


def delete_contract(contract_id: str, cursor, conn, cors_headers: Dict[str, str]) -> Dict[str, Any]:
    '''Удалить договор-заявку'''
    
    cursor.execute('DELETE FROM contracts WHERE id = %s RETURNING id', (contract_id,))
    result = cursor.fetchone()
    
    if not result:
        return {
            'statusCode': 404,
            'headers': cors_headers,
            'body': json.dumps({'error': 'Договор не найден'}),
            'isBase64Encoded': False
        }
    
    conn.commit()
    
    return {
        'statusCode': 200,
        'headers': cors_headers,
        'body': json.dumps({'message': 'Договор-заявка успешно удалён'}),
        'isBase64Encoded': False
    }
