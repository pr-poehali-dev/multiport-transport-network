import json
import re
import hashlib
from psycopg2.extras import RealDictCursor


def handle_roles(method: str, event: dict, cursor, conn, cors_headers: dict) -> dict:
    if method == 'GET':
        cursor = conn.cursor(cursor_factory=RealDictCursor)
        cursor.execute('''
            SELECT id, name, display_name, description, is_system
            FROM roles
            ORDER BY id
        ''')
        roles = cursor.fetchall()

        return {
            'statusCode': 200,
            'headers': cors_headers,
            'body': json.dumps({'roles': [dict(r) for r in roles]}),
            'isBase64Encoded': False
        }

    elif method == 'POST':
        body = json.loads(event.get('body', '{}'))
        name = body.get('name', '').strip()
        display_name = body.get('display_name', '').strip()
        description = body.get('description', '').strip()

        if not display_name:
            return {
                'statusCode': 400,
                'headers': cors_headers,
                'body': json.dumps({'error': 'display_name is required'}),
                'isBase64Encoded': False
            }

        if not name:
            base_name = re.sub(r'[^a-z0-9_]', '', display_name.lower().replace(' ', '_'))
            name = f"{base_name}_{hashlib.md5(display_name.encode()).hexdigest()[:6]}"

        cursor.execute(
            'INSERT INTO roles (name, display_name, description) VALUES (%s, %s, %s) RETURNING id',
            (name, display_name, description)
        )
        role_id = cursor.fetchone()[0]
        conn.commit()

        return {
            'statusCode': 201,
            'headers': cors_headers,
            'body': json.dumps({'id': role_id, 'message': 'Role created'}),
            'isBase64Encoded': False
        }

    elif method == 'PUT':
        params = event.get('queryStringParameters') or {}
        role_id = params.get('id')

        if not role_id:
            return {
                'statusCode': 400,
                'headers': cors_headers,
                'body': json.dumps({'error': 'role id is required'}),
                'isBase64Encoded': False
            }

        body = json.loads(event.get('body', '{}'))
        display_name = body.get('display_name', '').strip()
        description = body.get('description', '').strip()

        cursor.execute('SELECT is_system FROM roles WHERE id = %s', (role_id,))
        role = cursor.fetchone()
        
        if not role:
            return {
                'statusCode': 404,
                'headers': cors_headers,
                'body': json.dumps({'error': 'Role not found'}),
                'isBase64Encoded': False
            }

        if role[0]:
            return {
                'statusCode': 403,
                'headers': cors_headers,
                'body': json.dumps({'error': 'Cannot modify system role'}),
                'isBase64Encoded': False
            }

        if display_name:
            cursor.execute(
                'UPDATE roles SET display_name = %s, description = %s WHERE id = %s',
                (display_name, description, role_id)
            )

        conn.commit()

        return {
            'statusCode': 200,
            'headers': cors_headers,
            'body': json.dumps({'message': 'Role updated'}),
            'isBase64Encoded': False
        }

    elif method == 'DELETE':
        params = event.get('queryStringParameters') or {}
        role_id = params.get('id')

        if not role_id:
            return {
                'statusCode': 400,
                'headers': cors_headers,
                'body': json.dumps({'error': 'role id is required'}),
                'isBase64Encoded': False
            }

        cursor.execute('SELECT is_system FROM roles WHERE id = %s', (role_id,))
        role = cursor.fetchone()
        
        if not role:
            return {
                'statusCode': 404,
                'headers': cors_headers,
                'body': json.dumps({'error': 'Role not found'}),
                'isBase64Encoded': False
            }

        if role[0]:
            return {
                'statusCode': 403,
                'headers': cors_headers,
                'body': json.dumps({'error': 'Cannot delete system role'}),
                'isBase64Encoded': False
            }

        cursor.execute('DELETE FROM user_roles WHERE role_id = %s', (role_id,))
        cursor.execute('DELETE FROM roles WHERE id = %s', (role_id,))
        
        conn.commit()

        return {
            'statusCode': 200,
            'headers': cors_headers,
            'body': json.dumps({'message': 'Role deleted'}),
            'isBase64Encoded': False
        }

    return {
        'statusCode': 405,
        'headers': cors_headers,
        'body': json.dumps({'error': 'Method not allowed'}),
        'isBase64Encoded': False
    }