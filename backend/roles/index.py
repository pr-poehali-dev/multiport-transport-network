import json
import os
import psycopg2
from psycopg2.extras import RealDictCursor

def handler(event: dict, context) -> dict:
    method = event.get('httpMethod', 'GET')

    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type'
            },
            'body': ''
        }

    dsn = os.environ.get('DATABASE_URL')
    if not dsn:
        return {
            'statusCode': 500,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'DATABASE_URL not configured'})
        }

    conn = None
    try:
        conn = psycopg2.connect(dsn)
        cursor = conn.cursor(cursor_factory=RealDictCursor)

        if method == 'GET':
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
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'roles': list(roles_dict.values())})
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
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'display_name is required'})
                }

            if not name:
                import re
                import hashlib
                base_name = re.sub(r'[^a-z0-9_]', '', display_name.lower().replace(' ', '_'))
                name = f"{base_name}_{hashlib.md5(display_name.encode()).hexdigest()[:6]}"

            cursor.execute(
                'INSERT INTO roles (name, display_name, description) VALUES (%s, %s, %s) RETURNING id',
                (name, display_name, description)
            )
            role_id = cursor.fetchone()['id']

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
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'id': role_id, 'message': 'Role created'})
            }

        elif method == 'PUT':
            path_params = event.get('pathParams', {})
            role_id = path_params.get('id')

            if not role_id:
                return {
                    'statusCode': 400,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'role id is required'})
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
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'Role not found'})
                }

            if role['is_system']:
                return {
                    'statusCode': 403,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'Cannot modify system role'})
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
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'message': 'Role updated'})
            }

        return {
            'statusCode': 405,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Method not allowed'})
        }

    except psycopg2.Error as e:
        if conn:
            conn.rollback()
        return {
            'statusCode': 500,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': f'Database error: {str(e)}'})
        }
    except Exception as e:
        if conn:
            conn.rollback()
        return {
            'statusCode': 500,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': str(e)})
        }
    finally:
        if conn:
            cursor.close()
            conn.close()