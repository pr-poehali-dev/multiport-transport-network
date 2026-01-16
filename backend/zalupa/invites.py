import json
import secrets
import os
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
            SELECT id, code, current_uses, max_uses, is_active
            FROM invite_links
            WHERE created_by = %s AND is_active = true
            ORDER BY created_at DESC
            LIMIT 1
        ''', (user_id,))
        invite = cursor.fetchone()
        
        if not invite:
            return {
                'statusCode': 200,
                'headers': cors_headers,
                'body': json.dumps({'invite': None}),
                'isBase64Encoded': False
            }
        
        cursor.execute('SELECT bot_username FROM telegram_config WHERE id = 1')
        config = cursor.fetchone()
        bot_username = config['bot_username'] if config and config.get('bot_username') else 'your_bot'
        
        invite_dict = dict(invite)
        invite_dict['invite_link'] = f'https://t.me/{bot_username}?start={invite_dict["code"]}'
        invite_dict['is_used'] = invite_dict['current_uses'] >= invite_dict['max_uses']
        
        return {
            'statusCode': 200,
            'headers': cors_headers,
            'body': json.dumps({'invite': invite_dict}),
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
        
        cursor.execute('''
            UPDATE invite_links 
            SET is_active = false 
            WHERE created_by = %s AND is_active = true
        ''', (user_id,))
        
        invite_code = secrets.token_urlsafe(16)
        cursor.execute(
            'INSERT INTO invite_links (code, created_by, max_uses) VALUES (%s, %s, %s) RETURNING id',
            (invite_code, user_id, 1)
        )
        invite_id = cursor.fetchone()[0]
        conn.commit()
        
        cursor.execute('SELECT bot_username FROM telegram_config WHERE id = 1')
        config = cursor.fetchone()
        bot_username = config[0] if config and config[0] else 'your_bot'
        
        invite_link = f'https://t.me/{bot_username}?start={invite_code}'
        
        return {
            'statusCode': 201,
            'headers': cors_headers,
            'body': json.dumps({
                'id': invite_id,
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

        cursor.execute(
            'INSERT INTO invite_links (code, created_by, max_uses) VALUES (%s, %s, %s) RETURNING id',
            (invite_code, user_id, 1)
        )
        invite_id = cursor.fetchone()[0]
        conn.commit()

        cursor.execute('SELECT bot_username FROM telegram_config WHERE id = 1')
        config = cursor.fetchone()
        bot_username = config[0] if config and config[0] else 'your_bot'
        
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