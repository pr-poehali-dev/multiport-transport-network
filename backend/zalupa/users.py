import json
from psycopg2.extras import RealDictCursor
from datetime import datetime


def serialize_datetime(obj):
    if isinstance(obj, datetime):
        return obj.isoformat()
    raise TypeError(f"Type {type(obj)} not serializable")


def handle_users(method: str, event: dict, cursor, conn, cors_headers: dict) -> dict:
    if method == 'GET':
        params = event.get('queryStringParameters') or {}
        user_id = params.get('id')

        cursor = conn.cursor(cursor_factory=RealDictCursor)

        if user_id:
            cursor.execute('''
                SELECT 
                    u.id, u.username, u.email, u.full_name, u.is_active, 
                    u.created_at, u.updated_at,
                    json_agg(
                        json_build_object(
                            'role_id', r.id,
                            'role_name', r.name,
                            'role_display_name', r.display_name
                        )
                    ) FILTER (WHERE r.id IS NOT NULL) as roles
                FROM users u
                LEFT JOIN user_roles ur ON u.id = ur.user_id
                LEFT JOIN roles r ON ur.role_id = r.id
                WHERE u.id = %s
                GROUP BY u.id
            ''', (user_id,))
            user = cursor.fetchone()

            if not user:
                return {
                    'statusCode': 404,
                    'headers': cors_headers,
                    'body': json.dumps({'error': 'User not found'}),
                    'isBase64Encoded': False
                }

            return {
                'statusCode': 200,
                'headers': cors_headers,
                'body': json.dumps(dict(user), default=serialize_datetime),
                'isBase64Encoded': False
            }

        try:
            cursor.execute('''
                SELECT 
                    u.id, u.username, u.email, u.full_name, u.is_active, 
                    u.created_at, u.updated_at,
                    json_agg(
                        json_build_object(
                            'role_id', r.id,
                            'role_name', r.name,
                            'role_display_name', r.display_name
                        )
                    ) FILTER (WHERE r.id IS NOT NULL) as roles
                FROM users u
                LEFT JOIN user_roles ur ON u.id = ur.user_id
                LEFT JOIN roles r ON ur.role_id = r.id
                GROUP BY u.id
                ORDER BY u.created_at DESC
            ''')
            users = cursor.fetchall()
            print(f"[DEBUG] GET /users found {len(users)} users")

            return {
                'statusCode': 200,
                'headers': cors_headers,
                'body': json.dumps({'users': [dict(u) for u in users]}, default=serialize_datetime),
                'isBase64Encoded': False
            }
        except Exception as e:
            print(f"[ERROR] GET /users failed: {str(e)}")
            return {
                'statusCode': 500,
                'headers': cors_headers,
                'body': json.dumps({'error': str(e)}),
                'isBase64Encoded': False
            }

    elif method == 'POST':
        body = json.loads(event.get('body', '{}'))
        print(f"[DEBUG] POST /users body: {json.dumps(body)}")
        
        username = body.get('username', '').strip()
        email = body.get('email', '').strip()
        full_name = body.get('full_name', '').strip()
        phone = body.get('phone', '').strip()
        password = body.get('password', '').strip()
        role_ids = body.get('role_ids', [])

        print(f"[DEBUG] Parsed: username={username}, email={email}, full_name={full_name}, password={'***' if password else 'EMPTY'}")

        if not full_name or not password:
            print(f"[ERROR] Validation failed: full_name={bool(full_name)}, password={bool(password)}")
            return {
                'statusCode': 400,
                'headers': cors_headers,
                'body': json.dumps({'error': 'full_name and password are required'}),
                'isBase64Encoded': False
            }

        try:
            # Генерируем дефолтные значения для обязательных полей
            if not username:
                username = f"user_{int(__import__('time').time() * 1000)}"
            if not email:
                email = f"{username}@temp.local"
            
            # Проверяем, существует ли пользователь с таким username
            cursor.execute('SELECT id FROM users WHERE username = %s', (username,))
            existing_user = cursor.fetchone()
            
            if existing_user:
                print(f"[ERROR] User with username={username} already exists")
                return {
                    'statusCode': 400,
                    'headers': cors_headers,
                    'body': json.dumps({'error': f'Пользователь с логином "{username}" уже существует'}),
                    'isBase64Encoded': False
                }
            
            print(f"[DEBUG] Executing INSERT with username={username}, email={email}")
            cursor.execute(
                'INSERT INTO users (username, email, full_name, phone, password_hash) VALUES (%s, %s, %s, %s, %s) RETURNING id',
                (username, email, full_name, phone or None, password)
            )
            user_id = cursor.fetchone()[0]

            for role_id in role_ids:
                cursor.execute(
                    'INSERT INTO user_roles (user_id, role_id) VALUES (%s, %s)',
                    (user_id, role_id)
                )

            conn.commit()

            return {
                'statusCode': 201,
                'headers': cors_headers,
                'body': json.dumps({'id': user_id, 'message': 'User created'}),
                'isBase64Encoded': False
            }
        except Exception as e:
            print(f"[ERROR] INSERT failed: {str(e)}")
            conn.rollback()
            return {
                'statusCode': 400,
                'headers': cors_headers,
                'body': json.dumps({'error': str(e)}),
                'isBase64Encoded': False
            }

    elif method == 'PUT':
        params = event.get('queryStringParameters') or {}
        user_id = params.get('id')

        if not user_id:
            return {
                'statusCode': 400,
                'headers': cors_headers,
                'body': json.dumps({'error': 'user id is required'}),
                'isBase64Encoded': False
            }

        body = json.loads(event.get('body', '{}'))
        username = body.get('username', '').strip()
        email = body.get('email', '').strip()
        full_name = body.get('full_name', '').strip()
        phone = body.get('phone', '').strip()
        is_active = body.get('is_active', True)
        role_ids = body.get('role_ids', [])

        cursor.execute('SELECT id FROM users WHERE id = %s', (user_id,))
        if not cursor.fetchone():
            return {
                'statusCode': 404,
                'headers': cors_headers,
                'body': json.dumps({'error': 'User not found'}),
                'isBase64Encoded': False
            }

        try:
            if username and email and full_name:
                cursor.execute(
                    'UPDATE users SET username = %s, email = %s, full_name = %s, phone = %s, is_active = %s, updated_at = CURRENT_TIMESTAMP WHERE id = %s',
                    (username, email, full_name, phone, is_active, user_id)
                )

            cursor.execute('DELETE FROM user_roles WHERE user_id = %s', (user_id,))

            for role_id in role_ids:
                cursor.execute(
                    'INSERT INTO user_roles (user_id, role_id) VALUES (%s, %s)',
                    (user_id, role_id)
                )

            conn.commit()

            return {
                'statusCode': 200,
                'headers': cors_headers,
                'body': json.dumps({'message': 'User updated'}),
                'isBase64Encoded': False
            }
        except Exception as e:
            conn.rollback()
            return {
                'statusCode': 400,
                'headers': cors_headers,
                'body': json.dumps({'error': str(e)}),
                'isBase64Encoded': False
            }

    elif method == 'DELETE':
        params = event.get('queryStringParameters') or {}
        user_id = params.get('id')
        
        print(f"[DEBUG] DELETE /users id={user_id}")

        if not user_id:
            return {
                'statusCode': 400,
                'headers': cors_headers,
                'body': json.dumps({'error': 'user id is required'}),
                'isBase64Encoded': False
            }

        try:
            cursor.execute('SELECT id FROM users WHERE id = %s', (user_id,))
            if not cursor.fetchone():
                return {
                    'statusCode': 404,
                    'headers': cors_headers,
                    'body': json.dumps({'error': 'User not found'}),
                    'isBase64Encoded': False
                }

            # Удаляем связанные записи
            cursor.execute('DELETE FROM user_roles WHERE user_id = %s', (user_id,))
            print(f"[DEBUG] Deleted user_roles for user {user_id}")
            
            cursor.execute('DELETE FROM users WHERE id = %s', (user_id,))
            print(f"[DEBUG] Deleted user {user_id}")

            conn.commit()
            
            print(f"[DEBUG] User {user_id} deleted successfully")

            return {
                'statusCode': 200,
                'headers': cors_headers,
                'body': json.dumps({'message': 'User deleted'}),
                'isBase64Encoded': False
            }
        except Exception as e:
            print(f"[ERROR] DELETE /users failed: {str(e)}")
            conn.rollback()
            return {
                'statusCode': 500,
                'headers': cors_headers,
                'body': json.dumps({'error': str(e)}),
                'isBase64Encoded': False
            }

    return {
        'statusCode': 405,
        'headers': cors_headers,
        'body': json.dumps({'error': 'Method not allowed'}),
        'isBase64Encoded': False
    }