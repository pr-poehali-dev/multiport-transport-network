import os
import json
import psycopg2
import requests
from typing import Dict, Any


def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    '''Обработчик очереди Telegram уведомлений - отправляет накопленные сообщения'''
    
    cors_headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Content-Type': 'application/json'
    }
    
    method = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': cors_headers,
            'body': '',
            'isBase64Encoded': False
        }
    
    db_url = os.environ.get('DATABASE_URL')
    if not db_url:
        return {
            'statusCode': 500,
            'headers': cors_headers,
            'body': json.dumps({'error': 'DATABASE_URL not configured'}),
            'isBase64Encoded': False
        }
    
    try:
        conn = psycopg2.connect(db_url)
        cursor = conn.cursor()
        
        # Получаем bot_token из конфига
        cursor.execute('SELECT bot_token FROM telegram_config WHERE id = 1 AND is_connected = true')
        config = cursor.fetchone()
        
        if not config or not config[0]:
            cursor.close()
            conn.close()
            return {
                'statusCode': 200,
                'headers': cors_headers,
                'body': json.dumps({'message': 'Bot not configured', 'processed': 0}),
                'isBase64Encoded': False
            }
        
        bot_token = config[0]
        
        # Выбираем все pending уведомления (максимум 50 за раз)
        cursor.execute('''
            SELECT id, event_type, variables
            FROM telegram_notification_queue
            WHERE status = 'pending'
            ORDER BY created_at ASC
            LIMIT 50
        ''')
        
        notifications = cursor.fetchall()
        processed = 0
        
        for notif_id, event_type, variables in notifications:
            try:
                success = send_notification(cursor, bot_token, event_type, variables)
                
                if success:
                    cursor.execute('''
                        UPDATE telegram_notification_queue
                        SET status = 'sent', sent_at = CURRENT_TIMESTAMP
                        WHERE id = %s
                    ''', (notif_id,))
                    processed += 1
                else:
                    cursor.execute('''
                        UPDATE telegram_notification_queue
                        SET status = 'failed', attempts = attempts + 1, last_error = 'Send failed'
                        WHERE id = %s
                    ''', (notif_id,))
                
            except Exception as e:
                cursor.execute('''
                    UPDATE telegram_notification_queue
                    SET status = 'failed', attempts = attempts + 1, last_error = %s
                    WHERE id = %s
                ''', (str(e), notif_id))
        
        conn.commit()
        cursor.close()
        conn.close()
        
        return {
            'statusCode': 200,
            'headers': cors_headers,
            'body': json.dumps({
                'message': 'Queue processed',
                'total': len(notifications),
                'processed': processed,
                'failed': len(notifications) - processed
            }),
            'isBase64Encoded': False
        }
        
    except Exception as e:
        return {
            'statusCode': 500,
            'headers': cors_headers,
            'body': json.dumps({'error': str(e)}),
            'isBase64Encoded': False
        }


def send_notification(cursor, bot_token: str, event_type: str, variables: Dict[str, Any]) -> bool:
    '''Отправка уведомления в Telegram'''
    
    cursor.execute('''
        SELECT ts.notification_text, ts.role_ids, tc.admin_telegram_id
        FROM telegram_settings ts
        CROSS JOIN telegram_config tc
        WHERE ts.event_type = %s 
          AND ts.is_enabled = true
          AND tc.id = 1
    ''', (event_type,))
    
    result = cursor.fetchone()
    if not result:
        return False
    
    notification_text, role_ids, admin_telegram_id = result
    
    if not bot_token or not admin_telegram_id:
        return False
    
    message = notification_text
    for key, value in variables.items():
        message = message.replace(f'{{{key}}}', str(value))
    
    cursor.execute('''
        SELECT DISTINCT utl.telegram_id
        FROM user_telegram_links utl
        JOIN user_roles ur ON utl.user_id = ur.user_id
        WHERE ur.role_id = ANY(%s)
          AND utl.telegram_id IS NOT NULL
    ''', (role_ids,))
    
    telegram_ids = [row[0] for row in cursor.fetchall()]
    
    if admin_telegram_id not in telegram_ids:
        telegram_ids.append(admin_telegram_id)
    
    success = False
    for telegram_id in telegram_ids:
        try:
            response = requests.post(
                f'https://api.telegram.org/bot{bot_token}/sendMessage',
                json={
                    'chat_id': telegram_id,
                    'text': message,
                    'parse_mode': 'HTML'
                },
                timeout=5
            )
            if response.json().get('ok'):
                success = True
        except Exception as e:
            print(f'Ошибка отправки в Telegram {telegram_id}: {e}')
            continue
    
    return success
