import json
from psycopg2.extras import RealDictCursor


def handle_telegram(method: str, event: dict, cursor, conn, cors_headers: dict) -> dict:
    if method == 'GET':
        cursor = conn.cursor(cursor_factory=RealDictCursor)
        cursor.execute('SELECT * FROM telegram_settings ORDER BY event_type')
        settings = cursor.fetchall()

        return {
            'statusCode': 200,
            'headers': cors_headers,
            'body': json.dumps({'settings': [dict(s) for s in settings]}),
            'isBase64Encoded': False
        }

    elif method == 'PUT':
        params = event.get('queryStringParameters') or {}
        event_type = params.get('event_type')

        if not event_type:
            return {
                'statusCode': 400,
                'headers': cors_headers,
                'body': json.dumps({'error': 'event_type is required'}),
                'isBase64Encoded': False
            }

        body = json.loads(event.get('body', '{}'))
        
        update_fields = []
        update_values = []
        
        if 'is_enabled' in body:
            update_fields.append('is_enabled = %s')
            update_values.append(body['is_enabled'])
        
        if 'notification_text' in body:
            update_fields.append('notification_text = %s')
            update_values.append(body['notification_text'])
        
        if 'role_ids' in body:
            update_fields.append('role_ids = %s')
            update_values.append(body['role_ids'])
        
        if not update_fields:
            return {
                'statusCode': 400,
                'headers': cors_headers,
                'body': json.dumps({'error': 'No fields to update'}),
                'isBase64Encoded': False
            }
        
        update_fields.append('updated_at = CURRENT_TIMESTAMP')
        update_values.append(event_type)
        
        query = f"UPDATE telegram_settings SET {', '.join(update_fields)} WHERE event_type = %s"
        cursor.execute(query, update_values)
        conn.commit()

        return {
            'statusCode': 200,
            'headers': cors_headers,
            'body': json.dumps({'message': 'Setting updated'}),
            'isBase64Encoded': False
        }

    return {
        'statusCode': 405,
        'headers': cors_headers,
        'body': json.dumps({'error': 'Method not allowed'}),
        'isBase64Encoded': False
    }
