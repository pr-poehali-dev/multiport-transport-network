import json
import re
import hashlib
from psycopg2.extras import RealDictCursor


def handle_roles(method: str, event: dict, cursor, conn, cors_headers: dict) -> dict:
    if method == 'GET':
        cursor = conn.cursor(cursor_factory=RealDictCursor)
        cursor.execute('''
            SELECT 
                r.id, r.name, r.display_name, r.description, r.is_system,
                rp.id as perm_id, rp.resource, rp.can_create, rp.can_read, 
                rp.can_update, rp.can_remove
            FROM roles r
            LEFT JOIN role_permissions rp ON r.id = rp.role_id
            ORDER BY r.id, rp.resource
        ''')
        rows = cursor.fetchall()

        roles_dict = {}
        for row in rows:
            role_id = row['id']
            if role_id not in roles_dict:
                roles_dict[role_id] = {
                    'id': row['id'],
                    'name': row['name'],
                    'display_name': row['display_name'],
                    'description': row['description'],
                    'is_system': row['is_system'],
                    'permissions': []
                }
            
            if row['resource']:
                roles_dict[role_id]['permissions'].append({
                    'resource': row['resource'],
                    'can_create': row['can_create'],
                    'can_read': row['can_read'],
                    'can_update': row['can_update'],
                    'can_remove': row['can_remove']
                })

        return {
            'statusCode': 200,
            'headers': cors_headers,
            'body': json.dumps({'roles': list(roles_dict.values())}),
            'isBase64Encoded': False
        }

    elif method == 'POST':
        body = json.loads(event.get('body', '{}'))
        name = body.get('name', '').strip()
        display_name = body.get('display_name', '').strip()
        description = body.get('description', '').strip()
        permissions = body.get('permissions', [])

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

        for perm in permissions:
            if perm.get('can_create') or perm.get('can_read') or perm.get('can_update') or perm.get('can_remove'):
                cursor.execute('''
                    INSERT INTO role_permissions 
                    (role_id, resource, can_create, can_read, can_update, can_remove)
                    VALUES (%s, %s, %s, %s, %s, %s)
                ''', (
                    role_id,
                    perm['resource'],
                    perm.get('can_create', False),
                    perm.get('can_read', False),
                    perm.get('can_update', False),
                    perm.get('can_remove', False)
                ))

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
        permissions = body.get('permissions', [])

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

        cursor.execute('DELETE FROM role_permissions WHERE role_id = %s', (role_id,))

        for perm in permissions:
            if perm.get('can_create') or perm.get('can_read') or perm.get('can_update') or perm.get('can_remove'):
                cursor.execute('''
                    INSERT INTO role_permissions 
                    (role_id, resource, can_create, can_read, can_update, can_remove)
                    VALUES (%s, %s, %s, %s, %s, %s)
                ''', (
                    role_id,
                    perm['resource'],
                    perm.get('can_create', False),
                    perm.get('can_read', False),
                    perm.get('can_update', False),
                    perm.get('can_remove', False)
                ))

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

        cursor.execute('DELETE FROM role_permissions WHERE role_id = %s', (role_id,))
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