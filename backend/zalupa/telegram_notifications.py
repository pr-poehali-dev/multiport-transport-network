import requests
from typing import Optional, Dict, Any


def send_notification(
    cursor,
    event_type: str,
    variables: Dict[str, Any]
) -> bool:
    '''Отправка уведомления в Telegram для определённого события'''
    
    cursor.execute('''
        SELECT ts.notification_text, ts.role_ids, tc.bot_token, tc.admin_telegram_id
        FROM telegram_settings ts
        CROSS JOIN telegram_config tc
        WHERE ts.event_type = %s 
          AND ts.is_enabled = true
          AND tc.is_connected = true
          AND tc.id = 1
    ''', (event_type,))
    
    result = cursor.fetchone()
    if not result:
        return False
    
    notification_text, role_ids, bot_token, admin_telegram_id = result
    
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
