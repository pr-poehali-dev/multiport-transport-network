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
                response_text = (
                    "👋 Добро пожаловать в Диантус!\n\n"
                    "Для подключения к системе вам нужна инвайт-ссылка от администратора.\n"
                    "Если у вас есть инвайт-ссылка, просто перейдите по ней."
                )
            else:
                invite_code = parts[1]
                
                cursor.execute('''
                    SELECT id, created_by, current_uses, max_uses, is_active
                    FROM invite_links
                    WHERE code = %s
                ''', (invite_code,))
                invite = cursor.fetchone()
                
                if not invite or not invite[4]:
                    response_text = "❌ Инвайт-ссылка недействительна или уже использована."
                elif invite[2] >= invite[3]:
                    response_text = "❌ Эта инвайт-ссылка уже использована."
                else:
                    user_id = invite[1]
                    
                    cursor.execute('''
                        SELECT id FROM user_telegram_links
                        WHERE user_id = %s
                    ''', (user_id,))
                    
                    if cursor.fetchone():
                        response_text = "✅ Вы уже подключены к системе!"
                    else:
                        cursor.execute('''
                            INSERT INTO user_telegram_links (user_id, telegram_id)
                            VALUES (%s, %s)
                            ON CONFLICT (user_id) DO UPDATE SET telegram_id = EXCLUDED.telegram_id
                        ''', (user_id, chat_id))
                        
                        cursor.execute('''
                            UPDATE invite_links
                            SET current_uses = current_uses + 1
                            WHERE id = %s
                        ''', (invite[0],))
                        
                        conn.commit()
                        
                        cursor.execute('''
                            SELECT full_name FROM users WHERE id = %s
                        ''', (user_id,))
                        user = cursor.fetchone()
                        user_name = user[0] if user else 'Пользователь'
                        
                        response_text = (
                            f"✅ Отлично, {user_name}!\n\n"
                            "Вы успешно подключены к системе Диантус.\n"
                            "Теперь вы будете получать уведомления о важных событиях."
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
                SELECT u.full_name, u.email
                FROM user_telegram_links utl
                JOIN users u ON utl.user_id = u.id
                WHERE utl.telegram_id = %s
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
