import json
import secrets
from psycopg2.extras import RealDictCursor


def handle_invites(method: str, event: dict, cursor, conn, cors_headers: dict) -> dict:
    params = event.get('queryStringParameters') or {}
    action = params.get('action')
    
    if method == 'GET' and action == 'user_invite':
        user_id = params.get('user_id')
        
        if not user_id:
            return {
                'statusCode': 400,
                'headers': cors_headers,
                'body': json.dumps({'error': 'user_id is required'}),
                'isBase64Encoded': False
            }
        
        cursor = conn.cursor(cursor_factory=RealDictCursor)
        cursor.execute('''
            SELECT id, invite_code, invite_created_at, invite_used_at, telegram_id
            FROM users
            WHERE id = %s
        ''', (user_id,))
        user = cursor.fetchone()
        
        if not user or not user.get('invite_code'):
            return {
                'statusCode': 200,
                'headers': cors_headers,
                'body': json.dumps({'invite': None}),
                'isBase64Encoded': False
            }
        
        cursor.execute('SELECT bot_username FROM telegram_config WHERE id = 1')
        config = cursor.fetchone()
        bot_username = config['bot_username'] if config and config.get('bot_username') else 'your_bot'
        
        invite_link = f'https://t.me/{bot_username}?start={user["invite_code"]}'
        is_used = user['invite_used_at'] is not None
        
        return {
            'statusCode': 200,
            'headers': cors_headers,
            'body': json.dumps({
                'invite': {
                    'id': user['id'],
                    'code': user['invite_code'],
                    'invite_link': invite_link,
                    'is_used': is_used,
                    'current_uses': 1 if is_used else 0,
                    'max_uses': 1
                }
            }),
            'isBase64Encoded': False
        }
    
    elif method == 'POST' and action == 'regenerate':
        user_id = params.get('user_id')
        
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
        
        cursor.execute('''
            UPDATE users 
            SET invite_code = %s, 
                invite_created_at = CURRENT_TIMESTAMP,
                invite_used_at = NULL,
                telegram_id = NULL
            WHERE id = %s
        ''', (invite_code, user_id))
        conn.commit()
        
        cursor.execute('SELECT bot_username FROM telegram_config WHERE id = 1')
        config = cursor.fetchone()
        bot_username = config[0] if config and config[0] else 'your_bot'
        
        invite_link = f'https://t.me/{bot_username}?start={invite_code}'
        
        return {
            'statusCode': 201,
            'headers': cors_headers,
            'body': json.dumps({
                'id': user_id,
                'code': invite_code,
                'invite_link': invite_link,
                'is_used': False
            }),
            'isBase64Encoded': False
        }
    
    elif method == 'POST':
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

        cursor.execute('''
            UPDATE users 
            SET invite_code = %s, 
                invite_created_at = CURRENT_TIMESTAMP
            WHERE id = %s
        ''', (invite_code, user_id))
        conn.commit()

        cursor.execute('SELECT bot_username FROM telegram_config WHERE id = 1')
        config = cursor.fetchone()
        bot_username = config[0] if config and config[0] else 'your_bot'
        
        invite_link = f'https://t.me/{bot_username}?start={invite_code}'

        return {
            'statusCode': 201,
            'headers': cors_headers,
            'body': json.dumps({
                'id': user_id,
                'code': invite_code,
                'invite_link': invite_link
            }),
            'isBase64Encoded': False
        }

    elif method == 'GET':
        cursor = conn.cursor(cursor_factory=RealDictCursor)
        cursor.execute('''
            SELECT 
                id, full_name, invite_code, invite_created_at, 
                invite_used_at, telegram_id
            FROM users
            WHERE invite_code IS NOT NULL
            ORDER BY invite_created_at DESC
        ''')
        users = cursor.fetchall()

        invites = []
        for user in users:
            invites.append({
                'id': user['id'],
                'code': user['invite_code'],
                'created_by': user['id'],
                'creator_name': user['full_name'],
                'created_at': user['invite_created_at'].isoformat() if user['invite_created_at'] else None,
                'is_used': user['invite_used_at'] is not None,
                'current_uses': 1 if user['invite_used_at'] else 0,
                'max_uses': 1
            })

        return {
            'statusCode': 200,
            'headers': cors_headers,
            'body': json.dumps({'invites': invites}),
            'isBase64Encoded': False
        }

    elif method == 'DELETE':
        params = event.get('queryStringParameters') or {}
        user_id = params.get('id')

        if not user_id:
            return {
                'statusCode': 400,
                'headers': cors_headers,
                'body': json.dumps({'error': 'user id is required'}),
                'isBase64Encoded': False
            }

        cursor.execute('''
            UPDATE users 
            SET invite_code = NULL, 
                invite_created_at = NULL,
                invite_used_at = NULL
            WHERE id = %s
        ''', (user_id,))
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
