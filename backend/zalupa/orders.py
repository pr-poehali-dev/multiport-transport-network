import json
from typing import Dict, Any
from telegram_notifications import send_notification


def handle_orders(method: str, event: Dict[str, Any], cursor, conn, cors_headers: Dict[str, str]) -> Dict[str, Any]:
    '''Обработка запросов к orders'''
    params = event.get('queryStringParameters') or {}
    order_id = params.get('id')
    action = params.get('action')
    
    if method == 'POST' and action == 'notify_order_saved':
        return notify_order_saved(event, cursor, conn, cors_headers)
    
    if method == 'POST' and action == 'notify_route_saved':
        return notify_route_saved(event, cursor, conn, cors_headers)
    
    if method == 'GET':
        if order_id:
            return get_order_by_id(cursor, order_id, cors_headers)
        return get_all_orders(cursor, cors_headers)
    
    elif method == 'POST':
        return create_order(event, cursor, conn, cors_headers)
    
    elif method == 'PUT':
        if not order_id:
            return {
                'statusCode': 400,
                'headers': cors_headers,
                'body': json.dumps({'error': 'id обязателен для обновления'}),
                'isBase64Encoded': False
            }
        return update_order(order_id, event, cursor, conn, cors_headers)
    
    elif method == 'DELETE':
        if not order_id:
            return {
                'statusCode': 400,
                'headers': cors_headers,
                'body': json.dumps({'error': 'id обязателен для удаления'}),
                'isBase64Encoded': False
            }
        return delete_order(order_id, cursor, conn, cors_headers)
    
    return {
        'statusCode': 405,
        'headers': cors_headers,
        'body': json.dumps({'error': 'Method not allowed'}),
        'isBase64Encoded': False
    }


def get_all_orders(cursor, cors_headers: Dict[str, str]) -> Dict[str, Any]:
    '''Получить все заказы со связанными данными'''
    cursor.execute('''
        SELECT 
            o.id, o.prefix, o.order_date, o.route_number, o.invoice, 
            o.trak, o.weight, o.full_route, o.created_at, o.updated_at
        FROM orders o
        ORDER BY o.order_date DESC, o.created_at DESC
    ''')
    
    orders = []
    for row in cursor.fetchall():
        order = {
            'id': row[0],
            'prefix': row[1],
            'orderDate': row[2].isoformat() if row[2] else None,
            'routeNumber': row[3],
            'invoice': row[4],
            'trak': row[5],
            'weight': float(row[6]) if row[6] else None,
            'fullRoute': row[7],
            'createdAt': row[8].isoformat() if row[8] else None,
            'updatedAt': row[9].isoformat() if row[9] else None,
        }
        
        cursor.execute('''
            SELECT id, contractor_id, name, note, position
            FROM order_consignees
            WHERE order_id = %s
            ORDER BY position
        ''', (row[0],))
        order['consignees'] = [
            {
                'id': c[0],
                'contractorId': c[1],
                'name': c[2],
                'note': c[3],
                'position': c[4]
            }
            for c in cursor.fetchall()
        ]
        
        cursor.execute('''
            SELECT id, from_address, to_address, vehicle_id, driver_name, loading_date, position
            FROM order_routes
            WHERE order_id = %s
            ORDER BY position
        ''', (row[0],))
        
        routes = []
        for r in cursor.fetchall():
            route = {
                'id': r[0],
                'from': r[1],
                'to': r[2],
                'vehicleId': r[3],
                'driverName': r[4],
                'loadingDate': r[5].isoformat() if r[5] else None,
                'position': r[6]
            }
            
            cursor.execute('''
                SELECT id, stop_type, address, note, position
                FROM route_stops
                WHERE route_id = %s
                ORDER BY position
            ''', (r[0],))
            route['additionalStops'] = [
                {
                    'id': s[0],
                    'type': s[1],
                    'address': s[2],
                    'note': s[3],
                    'position': s[4]
                }
                for s in cursor.fetchall()
            ]
            
            routes.append(route)
        
        order['routes'] = routes
        orders.append(order)
    
    return {
        'statusCode': 200,
        'headers': cors_headers,
        'body': json.dumps({'orders': orders, 'total': len(orders)}),
        'isBase64Encoded': False
    }


def get_order_by_id(cursor, order_id: str, cors_headers: Dict[str, str]) -> Dict[str, Any]:
    '''Получить заказ по ID'''
    cursor.execute('''
        SELECT 
            id, prefix, order_date, route_number, invoice, 
            trak, weight, full_route, created_at, updated_at
        FROM orders
        WHERE id = %s
    ''', (order_id,))
    
    row = cursor.fetchone()
    if not row:
        return {
            'statusCode': 404,
            'headers': cors_headers,
            'body': json.dumps({'error': 'Заказ не найден'}),
            'isBase64Encoded': False
        }
    
    order = {
        'id': row[0],
        'prefix': row[1],
        'orderDate': row[2].isoformat() if row[2] else None,
        'routeNumber': row[3],
        'invoice': row[4],
        'trak': row[5],
        'weight': float(row[6]) if row[6] else None,
        'fullRoute': row[7],
        'createdAt': row[8].isoformat() if row[8] else None,
        'updatedAt': row[9].isoformat() if row[9] else None,
    }
    
    cursor.execute('''
        SELECT id, contractor_id, name, note, position
        FROM order_consignees
        WHERE order_id = %s
        ORDER BY position
    ''', (order_id,))
    order['consignees'] = [
        {
            'id': c[0],
            'contractorId': c[1],
            'name': c[2],
            'note': c[3],
            'position': c[4]
        }
        for c in cursor.fetchall()
    ]
    
    cursor.execute('''
        SELECT id, from_address, to_address, vehicle_id, driver_name, loading_date, position
        FROM order_routes
        WHERE order_id = %s
        ORDER BY position
    ''', (order_id,))
    
    routes = []
    for r in cursor.fetchall():
        route = {
            'id': r[0],
            'from': r[1],
            'to': r[2],
            'vehicleId': r[3],
            'driverName': r[4],
            'loadingDate': r[5].isoformat() if r[5] else None,
            'position': r[6]
        }
        
        cursor.execute('''
            SELECT id, stop_type, address, note, position
            FROM route_stops
            WHERE route_id = %s
            ORDER BY position
        ''', (r[0],))
        route['additionalStops'] = [
            {
                'id': s[0],
                'type': s[1],
                'address': s[2],
                'note': s[3],
                'position': s[4]
            }
            for s in cursor.fetchall()
        ]
        
        routes.append(route)
    
    order['routes'] = routes
    
    return {
        'statusCode': 200,
        'headers': cors_headers,
        'body': json.dumps(order),
        'isBase64Encoded': False
    }


def create_order(event: Dict[str, Any], cursor, conn, cors_headers: Dict[str, str]) -> Dict[str, Any]:
    '''Создать новый заказ'''
    try:
        data = json.loads(event.get('body', '{}'))
        
        cursor.execute('''
            INSERT INTO orders (prefix, order_date, route_number, invoice, trak, weight, full_route)
            VALUES (%s, %s, %s, %s, %s, %s, %s)
            RETURNING id, created_at
        ''', (
            data.get('prefix'),
            data.get('orderDate'),
            data.get('routeNumber'),
            data.get('invoice'),
            data.get('trak'),
            data.get('weight'),
            data.get('fullRoute')
        ))
        
        order_id, created_at = cursor.fetchone()
        
        consignees = data.get('consignees', [])
        for idx, consignee in enumerate(consignees):
            cursor.execute('''
                INSERT INTO order_consignees (order_id, contractor_id, name, note, position)
                VALUES (%s, %s, %s, %s, %s)
            ''', (order_id, consignee.get('contractorId'), consignee.get('name'), consignee.get('note'), idx))
        
        routes = data.get('routes', [])
        for idx, route in enumerate(routes):
            cursor.execute('''
                INSERT INTO order_routes (order_id, from_address, to_address, vehicle_id, driver_name, loading_date, position)
                VALUES (%s, %s, %s, %s, %s, %s, %s)
                RETURNING id
            ''', (order_id, route.get('from'), route.get('to'), route.get('vehicleId'), route.get('driverName'), route.get('loadingDate'), idx))
            
            route_id = cursor.fetchone()[0]
            
            stops = route.get('additionalStops', [])
            for stop_idx, stop in enumerate(stops):
                cursor.execute('''
                    INSERT INTO route_stops (route_id, stop_type, address, note, position)
                    VALUES (%s, %s, %s, %s, %s)
                ''', (route_id, stop.get('type'), stop.get('address'), stop.get('note'), stop_idx))
        
        conn.commit()
        
        try:
            send_notification(
                cursor,
                'order_created',
                {
                    'order_id': order_id,
                    'prefix': data.get('prefix', ''),
                    'route_number': data.get('routeNumber', '')
                }
            )
        except Exception as e:
            print(f'Ошибка отправки уведомления: {e}')
        
        return {
            'statusCode': 201,
            'headers': cors_headers,
            'body': json.dumps({
                'id': order_id,
                'message': 'Заказ успешно создан',
                'createdAt': created_at.isoformat()
            }),
            'isBase64Encoded': False
        }
        
    except Exception as e:
        conn.rollback()
        return {
            'statusCode': 500,
            'headers': cors_headers,
            'body': json.dumps({'error': str(e)}),
            'isBase64Encoded': False
        }


def update_order(order_id: str, event: Dict[str, Any], cursor, conn, cors_headers: Dict[str, str]) -> Dict[str, Any]:
    '''Обновить заказ'''
    try:
        data = json.loads(event.get('body', '{}'))
        
        cursor.execute('''
            UPDATE orders
            SET prefix = %s, order_date = %s, route_number = %s, invoice = %s, 
                trak = %s, weight = %s, full_route = %s, updated_at = CURRENT_TIMESTAMP
            WHERE id = %s
        ''', (
            data.get('prefix'),
            data.get('orderDate'),
            data.get('routeNumber'),
            data.get('invoice'),
            data.get('trak'),
            data.get('weight'),
            data.get('fullRoute'),
            order_id
        ))
        
        if cursor.rowcount == 0:
            return {
                'statusCode': 404,
                'headers': cors_headers,
                'body': json.dumps({'error': 'Заказ не найден'}),
                'isBase64Encoded': False
            }
        
        conn.commit()
        
        return {
            'statusCode': 200,
            'headers': cors_headers,
            'body': json.dumps({'message': 'Заказ обновлён'}),
            'isBase64Encoded': False
        }
        
    except Exception as e:
        conn.rollback()
        return {
            'statusCode': 500,
            'headers': cors_headers,
            'body': json.dumps({'error': str(e)}),
            'isBase64Encoded': False
        }


def delete_order(order_id: str, cursor, conn, cors_headers: Dict[str, str]) -> Dict[str, Any]:
    '''Удалить заказ и все связанные данные'''
    try:
        cursor.execute('SELECT id FROM order_routes WHERE order_id = %s', (order_id,))
        route_ids = [r[0] for r in cursor.fetchall()]
        
        for route_id in route_ids:
            cursor.execute('DELETE FROM route_stops WHERE route_id = %s', (route_id,))
        
        cursor.execute('DELETE FROM order_routes WHERE order_id = %s', (order_id,))
        cursor.execute('DELETE FROM order_consignees WHERE order_id = %s', (order_id,))
        cursor.execute('DELETE FROM orders WHERE id = %s', (order_id,))
        
        if cursor.rowcount == 0:
            return {
                'statusCode': 404,
                'headers': cors_headers,
                'body': json.dumps({'error': 'Заказ не найден'}),
                'isBase64Encoded': False
            }
        
        conn.commit()
        
        return {
            'statusCode': 200,
            'headers': cors_headers,
            'body': json.dumps({'message': 'Заказ удалён'}),
            'isBase64Encoded': False
        }
    
    except Exception as e:
        conn.rollback()
        return {
            'statusCode': 500,
            'headers': cors_headers,
            'body': json.dumps({'error': str(e)}),
            'isBase64Encoded': False
        }


def notify_order_saved(event: Dict[str, Any], cursor, conn, cors_headers: Dict[str, str]) -> Dict[str, Any]:
    '''Отправить уведомление о сохранении основной информации заказа'''
    try:
        data = json.loads(event.get('body', '{}'))
        
        send_notification(
            cursor,
            'order_created',
            {
                'order_id': data.get('routeNumber', 'Новый'),
                'prefix': data.get('prefix', ''),
                'route_number': data.get('routeNumber', '')
            }
        )
        
        return {
            'statusCode': 200,
            'headers': cors_headers,
            'body': json.dumps({'message': 'Уведомление отправлено'}),
            'isBase64Encoded': False
        }
    except Exception as e:
        return {
            'statusCode': 200,
            'headers': cors_headers,
            'body': json.dumps({'message': 'ok', 'error': str(e)}),
            'isBase64Encoded': False
        }


def notify_route_saved(event: Dict[str, Any], cursor, conn, cors_headers: Dict[str, str]) -> Dict[str, Any]:
    '''Отправить уведомление о сохранении маршрута'''
    try:
        data = json.loads(event.get('body', '{}'))
        
        send_notification(
            cursor,
            'order_assigned',
            {
                'order_id': data.get('routeNumber', ''),
                'driver_name': data.get('driverName', 'Не указан'),
                'route_from': data.get('from', ''),
                'route_to': data.get('to', '')
            }
        )
        
        return {
            'statusCode': 200,
            'headers': cors_headers,
            'body': json.dumps({'message': 'Уведомление отправлено'}),
            'isBase64Encoded': False
        }
    except Exception as e:
        return {
            'statusCode': 200,
            'headers': cors_headers,
            'body': json.dumps({'message': 'ok', 'error': str(e)}),
            'isBase64Encoded': False
        }
        
    except Exception as e:
        conn.rollback()
        return {
            'statusCode': 500,
            'headers': cors_headers,
            'body': json.dumps({'error': str(e)}),
            'isBase64Encoded': False
        }