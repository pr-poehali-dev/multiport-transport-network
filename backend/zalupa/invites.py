import json
import secrets
from psycopg2.extras import RealDictCursor


def handle_invites(method: str, event: dict, cursor, conn, cors_headers: dict) -> dict:
    if method == 'POST':
        body = json.loads(event.get('body', '{}'))
        user_id = body.get('user_id')

        if not user_id:
            return {
                'statusCode': 400,
                'headers': cors_headers,
                'body': json.dumps({'error': 'user_id is required'}),
                'isBase64Encoded': False
            }

        cursor.execute('SELECT id FROM users WHERE id = %s', (user_id,))
        if not cursor.fetchone():
            return {
                'statusCode': 404,
                'headers': cors_headers,
                'body': json.dumps({'error': 'User not found'}),
                'isBase64Encoded': False
            }

        invite_code = secrets.token_urlsafe(16)

        cursor.execute(
            'INSERT INTO invite_links (code, created_by, max_uses) VALUES (%s, %s, %s) RETURNING id',
            (invite_code, user_id, 1)
        )
        invite_id = cursor.fetchone()[0]
        conn.commit()

        bot_username = 'your_bot'
        invite_link = f'https://t.me/{bot_username}?start={invite_code}'

        return {
            'statusCode': 201,
            'headers': cors_headers,
            'body': json.dumps({
                'id': invite_id,
                'code': invite_code,
                'invite_link': invite_link
            }),
            'isBase64Encoded': False
        }

    elif method == 'GET':
        cursor = conn.cursor(cursor_factory=RealDictCursor)
        cursor.execute('''
            SELECT 
                il.id, il.code, il.created_by, il.expires_at, 
                il.max_uses, il.current_uses, il.is_active, il.created_at,
                u.full_name as creator_name
            FROM invite_links il
            LEFT JOIN users u ON il.created_by = u.id
            ORDER BY il.created_at DESC
        ''')
        invites = cursor.fetchall()

        return {
            'statusCode': 200,
            'headers': cors_headers,
            'body': json.dumps({'invites': [dict(i) for i in invites]}),
            'isBase64Encoded': False
        }

    elif method == 'DELETE':
        params = event.get('queryStringParameters') or {}
        invite_id = params.get('id')

        if not invite_id:
            return {
                'statusCode': 400,
                'headers': cors_headers,
                'body': json.dumps({'error': 'invite id is required'}),
                'isBase64Encoded': False
            }

        cursor.execute('DELETE FROM invite_links WHERE id = %s', (invite_id,))
        conn.commit()

        return {
            'statusCode': 200,
            'headers': cors_headers,
            'body': json.dumps({'message': 'Invite deleted'}),
            'isBase64Encoded': False
        }

    return {
        'statusCode': 405,
        'headers': cors_headers,
        'body': json.dumps({'error': 'Method not allowed'}),
        'isBase64Encoded': False
    }
