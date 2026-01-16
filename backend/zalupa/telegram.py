import json
import requests
from psycopg2.extras import RealDictCursor


def handle_telegram(method: str, event: dict, cursor, conn, cors_headers: dict) -> dict:
    params = event.get('queryStringParameters') or {}
    action = params.get('action', 'settings')

    if action == 'config':
        if method == 'GET':
            cursor = conn.cursor(cursor_factory=RealDictCursor)
            cursor.execute('''
                SELECT 
                    id, bot_token, bot_username, admin_telegram_id, is_connected,
                    to_char(last_check, 'YYYY-MM-DD"T"HH24:MI:SS') as last_check,
                    to_char(created_at, 'YYYY-MM-DD"T"HH24:MI:SS') as created_at,
                    to_char(updated_at, 'YYYY-MM-DD"T"HH24:MI:SS') as updated_at
                FROM telegram_config WHERE id = 1
            ''')
            config = cursor.fetchone()
            
            if config:
                result = dict(config)
                if result.get('bot_token'):
                    result['bot_token_masked'] = '***' + result['bot_token'][-4:] if len(result['bot_token']) > 4 else '***'
                return {
                    'statusCode': 200,
                    'headers': cors_headers,
                    'body': json.dumps({'config': result}),
                    'isBase64Encoded': False
                }
            else:
                return {
                    'statusCode': 200,
                    'headers': cors_headers,
                    'body': json.dumps({'config': None}),
                    'isBase64Encoded': False
                }

        elif method == 'POST':
            body = json.loads(event.get('body', '{}'))
            bot_token = body.get('bot_token', '').strip()
            bot_username = body.get('bot_username', '').strip()

            if not bot_token or not bot_username:
                return {
                    'statusCode': 400,
                    'headers': cors_headers,
                    'body': json.dumps({'error': 'bot_token and bot_username are required'}),
                    'isBase64Encoded': False
                }

            try:
                response = requests.get(f'https://api.telegram.org/bot{bot_token}/getMe', timeout=10)
                data = response.json()

                if not data.get('ok'):
                    return {
                        'statusCode': 400,
                        'headers': cors_headers,
                        'body': json.dumps({'error': 'Неверный токен бота'}),
                        'isBase64Encoded': False
                    }

                bot_info = data.get('result', {})
                actual_username = bot_info.get('username', '')

                if actual_username.lower() != bot_username.lower():
                    return {
                        'statusCode': 400,
                        'headers': cors_headers,
                        'body': json.dumps({'error': f'Username не совпадает. Бот: @{actual_username}'}),
                        'isBase64Encoded': False
                    }

                cursor.execute('''
                    INSERT INTO telegram_config (id, bot_token, bot_username, is_connected, last_check, updated_at)
                    VALUES (1, %s, %s, TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
                    ON CONFLICT (id) DO UPDATE SET
                        bot_token = EXCLUDED.bot_token,
                        bot_username = EXCLUDED.bot_username,
                        is_connected = TRUE,
                        last_check = CURRENT_TIMESTAMP,
                        updated_at = CURRENT_TIMESTAMP
                ''', (bot_token, bot_username))
                conn.commit()

                webhook_url = 'https://functions.poehali.dev/33cce63d-413a-4ccd-976c-ece47a291bc9'
                webhook_response = requests.post(
                    f'https://api.telegram.org/bot{bot_token}/setWebhook',
                    json={'url': webhook_url},
                    timeout=10
                )
                webhook_data = webhook_response.json()
                
                if not webhook_data.get('ok'):
                    print(f'Webhook setup warning: {webhook_data}')

                return {
                    'statusCode': 200,
                    'headers': cors_headers,
                    'body': json.dumps({
                        'message': 'Бот успешно подключён',
                        'is_connected': True,
                        'bot_info': bot_info
                    }),
                    'isBase64Encoded': False
                }

            except requests.exceptions.Timeout:
                return {
                    'statusCode': 500,
                    'headers': cors_headers,
                    'body': json.dumps({'error': 'Таймаут при проверке бота'}),
                    'isBase64Encoded': False
                }
            except Exception as e:
                return {
                    'statusCode': 500,
                    'headers': cors_headers,
                    'body': json.dumps({'error': f'Ошибка подключения: {str(e)}'}),
                    'isBase64Encoded': False
                }

    elif action == 'admin':
        if method == 'POST':
            body = json.loads(event.get('body', '{}'))
            admin_telegram_id = body.get('admin_telegram_id')

            if not admin_telegram_id:
                return {
                    'statusCode': 400,
                    'headers': cors_headers,
                    'body': json.dumps({'error': 'admin_telegram_id is required'}),
                    'isBase64Encoded': False
                }

            cursor.execute('SELECT bot_token FROM telegram_config WHERE id = 1')
            config = cursor.fetchone()

            if not config or not config[0]:
                return {
                    'statusCode': 400,
                    'headers': cors_headers,
                    'body': json.dumps({'error': 'Сначала подключите бота'}),
                    'isBase64Encoded': False
                }

            bot_token = config[0]

            try:
                response = requests.get(
                    f'https://api.telegram.org/bot{bot_token}/getChat',
                    params={'chat_id': admin_telegram_id},
                    timeout=10
                )
                data = response.json()

                if not data.get('ok'):
                    return {
                        'statusCode': 400,
                        'headers': cors_headers,
                        'body': json.dumps({'error': 'Не удалось найти пользователя. Убедитесь, что он запустил бота командой /start'}),
                        'isBase64Encoded': False
                    }

                user_info = data.get('result', {})

                cursor.execute('''
                    UPDATE telegram_config 
                    SET admin_telegram_id = %s, updated_at = CURRENT_TIMESTAMP 
                    WHERE id = 1
                ''', (admin_telegram_id,))
                conn.commit()

                return {
                    'statusCode': 200,
                    'headers': cors_headers,
                    'body': json.dumps({
                        'message': 'Админ успешно добавлен',
                        'user_info': {
                            'id': user_info.get('id'),
                            'first_name': user_info.get('first_name'),
                            'username': user_info.get('username')
                        }
                    }),
                    'isBase64Encoded': False
                }

            except Exception as e:
                return {
                    'statusCode': 500,
                    'headers': cors_headers,
                    'body': json.dumps({'error': f'Ошибка проверки: {str(e)}'}),
                    'isBase64Encoded': False
                }

    elif action == 'settings':
        if method == 'GET':
            try:
                cursor = conn.cursor(cursor_factory=RealDictCursor)
                cursor.execute('SELECT * FROM telegram_settings ORDER BY event_type')
                settings = cursor.fetchall()

                return {
                    'statusCode': 200,
                    'headers': cors_headers,
                    'body': json.dumps({'settings': [dict(s) for s in settings]}),
                    'isBase64Encoded': False
                }
            except Exception as e:
                return {
                    'statusCode': 500,
                    'headers': cors_headers,
                    'body': json.dumps({'error': f'Settings fetch error: {str(e)}'}),
                    'isBase64Encoded': False
                }

        elif method == 'PUT':
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