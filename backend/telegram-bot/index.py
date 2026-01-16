import json
import os
import psycopg2
import requests
from typing import Dict, Any


def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    '''Webhook для Telegram бота - обработка команд и сообщений от пользователей'''
    
    method = event.get('httpMethod', 'GET')
    
    cors_headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Content-Type': 'application/json'
    }
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': cors_headers,
            'body': '',
            'isBase64Encoded': False
        }
    
    if method == 'GET':
        return {
            'statusCode': 200,
            'headers': cors_headers,
            'body': json.dumps({'status': 'Telegram Bot Webhook Active'}),
            'isBase64Encoded': False
        }
    
    if method != 'POST':
        return {
            'statusCode': 405,
            'headers': cors_headers,
            'body': json.dumps({'error': 'Method not allowed'}),
            'isBase64Encoded': False
        }
    
    try:
        update = json.loads(event.get('body', '{}'))
        
        if not update.get('message'):
            return {
                'statusCode': 200,
                'headers': cors_headers,
                'body': json.dumps({'ok': True}),
                'isBase64Encoded': False
            }
        
        message = update['message']
        chat_id = message['chat']['id']
        text = message.get('text', '')
        
        db_url = os.environ.get('DATABASE_URL')
        if not db_url:
            return {
                'statusCode': 500,
                'headers': cors_headers,
                'body': json.dumps({'error': 'DATABASE_URL not configured'}),
                'isBase64Encoded': False
            }
        
        conn = psycopg2.connect(db_url)
        cursor = conn.cursor()
        
        cursor.execute('SELECT bot_token FROM telegram_config WHERE id = 1')
        config = cursor.fetchone()
        
        if not config or not config[0]:
            cursor.close()
            conn.close()
            return {
                'statusCode': 200,
                'headers': cors_headers,
                'body': json.dumps({'ok': True}),
                'isBase64Encoded': False
            }
        
        bot_token = config[0]
        
        if text.startswith('/start'):
            parts = text.split(' ')
            
            if len(parts) == 1:
                # Проверяем, может это админ без инвайта
                cursor.execute('''
                    SELECT id, full_name, is_admin, telegram_id
                    FROM users
                    WHERE telegram_id = %s
                ''', (chat_id,))
                existing_user = cursor.fetchone()
                
                if existing_user:
                    response_text = f"✅ Вы уже подключены к системе, {existing_user[1]}!"
                else:
                    # Проверяем есть ли админ с таким chat_id в telegram_config
                    cursor.execute('SELECT admin_telegram_id FROM telegram_config WHERE id = 1')
                    config = cursor.fetchone()
                    
                    if config and config[0] == chat_id:
                        # Это админ! Привязываем к первому admin аккаунту
                        cursor.execute('''
                            UPDATE users 
                            SET telegram_id = %s 
                            WHERE is_admin = true AND telegram_id IS NULL
                            RETURNING id, full_name
                        ''', (chat_id,))
                        admin_user = cursor.fetchone()
                        
                        if admin_user:
                            conn.commit()
                            response_text = (
                                f"✅ Отлично, {admin_user[1]}!\n\n"
                                "Вы подключены как администратор системы.\n"
                                "Теперь вы будете получать все уведомления."
                            )
                        else:
                            response_text = (
                                "👋 Добро пожаловать в Диантус!\n\n"
                                "Для подключения к системе вам нужна инвайт-ссылка от администратора.\n"
                                "Если у вас есть инвайт-ссылка, просто перейдите по ней."
                            )
                    else:
                        response_text = (
                            "👋 Добро пожаловать в Диантус!\n\n"
                            "Для подключения к системе вам нужна инвайт-ссылка от администратора.\n"
                            "Если у вас есть инвайт-ссылка, просто перейдите по ней."
                        )
            else:
                invite_code = parts[1]
                
                cursor.execute('''
                    SELECT id, full_name, telegram_id, invite_used_at
                    FROM users
                    WHERE invite_code = %s
                ''', (invite_code,))
                user = cursor.fetchone()
                
                if not user:
                    response_text = "❌ Инвайт-ссылка недействительна."
                elif user[3] is not None:
                    response_text = "❌ Эта инвайт-ссылка уже использована."
                elif user[2] is not None:
                    response_text = "✅ Вы уже подключены к системе!"
                else:
                    user_id = user[0]
                    user_name = user[1]
                    
                    cursor.execute('''
                        UPDATE users
                        SET telegram_id = %s, invite_used_at = NOW()
                        WHERE id = %s
                    ''', (chat_id, user_id))
                    
                    conn.commit()
                    
                    response_text = (
                        f"✅ Отлично, {user_name}!\n\n"
                        "Вы успешно подключены к системе Диантус.\n"
                        "Теперь вы будете получать уведомления о важных событиях."
                    )
                    
                    # Отправляем уведомление админу
                    cursor.execute('SELECT admin_telegram_id FROM telegram_config WHERE id = 1')
                    admin_config = cursor.fetchone()
                    
                    if admin_config and admin_config[0]:
                        admin_telegram_id = admin_config[0]
                        admin_notification = (
                            f"🎉 Новый пользователь подключился!\n\n"
                            f"👤 {user_name}\n"
                            f"📱 Telegram ID: {chat_id}"
                        )
                        requests.post(
                            f'https://api.telegram.org/bot{bot_token}/sendMessage',
                            json={
                                'chat_id': admin_telegram_id,
                                'text': admin_notification,
                                'parse_mode': 'HTML'
                            },
                            timeout=5
                        )
        
        elif text == '/help':
            response_text = (
                "📋 Доступные команды:\n\n"
                "/start - Подключиться к системе\n"
                "/help - Показать эту справку\n"
                "/status - Проверить статус подключения"
            )
        
        elif text == '/status':
            cursor.execute('''
                SELECT full_name, email
                FROM users
                WHERE telegram_id = %s
            ''', (chat_id,))
            user = cursor.fetchone()
            
            if user:
                response_text = (
                    f"✅ Вы подключены к системе\n\n"
                    f"👤 {user[0]}\n"
                    f"📧 {user[1]}"
                )
            else:
                response_text = "❌ Вы не подключены к системе. Используйте инвайт-ссылку для подключения."
        
        else:
            response_text = "Используйте /help для просмотра доступных команд."
        
        cursor.close()
        conn.close()
        
        requests.post(
            f'https://api.telegram.org/bot{bot_token}/sendMessage',
            json={
                'chat_id': chat_id,
                'text': response_text,
                'parse_mode': 'HTML'
            },
            timeout=5
        )
        
        return {
            'statusCode': 200,
            'headers': cors_headers,
            'body': json.dumps({'ok': True}),
            'isBase64Encoded': False
        }
        
    except Exception as e:
        return {
            'statusCode': 200,
            'headers': cors_headers,
            'body': json.dumps({'ok': True, 'error': str(e)}),
            'isBase64Encoded': False
        }