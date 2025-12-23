import json
from typing import Dict, Any, List, Optional
from dataclasses import dataclass, asdict


@dataclass
class Cell:
    """Ячейка таблицы"""
    value: Any
    row: int
    col: int
    format: Optional[str] = None


def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    """
    Spreadshit API - работа с таблицами (с юмором!)
    
    Поддерживает операции через параметр 'action' в body:
    - GET - информация об API
    - POST с action: create, read, update, delete
    
    Args:
        event: HTTP запрос с method, body
        context: объект контекста выполнения
    
    Returns:
        HTTP ответ с данными таблицы
    """
    method: str = event.get('httpMethod', 'GET')
    
    # CORS preflight
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, X-User-Id',
                'Access-Control-Max-Age': '86400'
            },
            'body': '',
            'isBase64Encoded': False
        }
    
    # GET - информация об API
    if method == 'GET':
        return {
            'statusCode': 200,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({
                'message': 'Welcome to Spreadshit API! 💩📊',
                'description': 'Because sometimes your data needs a sense of humor',
                'usage': 'POST with action parameter: create, read, update, delete',
                'example': {
                    'action': 'create',
                    'name': 'My Sheet',
                    'rows': 10,
                    'cols': 10
                },
                'status': 'ready to handle your sheet... I mean data! 😄'
            }, ensure_ascii=False),
            'isBase64Encoded': False
        }
    
    # POST - обработка действий
    if method == 'POST':
        body_data = json.loads(event.get('body', '{}'))
        action: str = body_data.get('action', '')
        
        # CREATE - создать новую таблицу
        if action == 'create':
            rows: int = body_data.get('rows', 10)
            cols: int = body_data.get('cols', 10)
            name: str = body_data.get('name', 'Untitled Sheet')
            
            # Создаем пустую таблицу
            sheet_data: List[List[str]] = [['' for _ in range(cols)] for _ in range(rows)]
            
            return {
                'statusCode': 201,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps({
                    'id': f'sheet_{abs(hash(name))}',
                    'name': name,
                    'rows': rows,
                    'cols': cols,
                    'data': sheet_data,
                    'message': f'Holy sheet! Created "{name}" with {rows}x{cols} cells 🎉'
                }, ensure_ascii=False),
                'isBase64Encoded': False
            }
        
        # READ - прочитать данные из диапазона
        if action == 'read':
            sheet_id: str = body_data.get('sheetId', '')
            start_row: int = body_data.get('startRow', 0)
            end_row: int = body_data.get('endRow', 10)
            start_col: int = body_data.get('startCol', 0)
            end_col: int = body_data.get('endCol', 10)
            
            # Мок-данные для демонстрации
            sample_data: List[List[Any]] = [
                ['Name', 'Age', 'City', 'Score'],
                ['Иван', 25, 'Москва', 95],
                ['Мария', 30, 'Санкт-Петербург', 87],
                ['Петр', 28, 'Казань', 92],
            ]
            
            # Срезаем данные по диапазону
            result_data = [row[start_col:end_col] for row in sample_data[start_row:end_row]]
            
            return {
                'statusCode': 200,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps({
                    'sheetId': sheet_id,
                    'range': f'{start_row}:{end_row}, {start_col}:{end_col}',
                    'data': result_data,
                    'message': 'Data retrieved! No sheet, Sherlock! 🕵️'
                }, ensure_ascii=False),
                'isBase64Encoded': False
            }
        
        # UPDATE - обновить ячейку
        if action == 'update':
            sheet_id: str = body_data.get('sheetId', '')
            row: int = body_data.get('row', 0)
            col: int = body_data.get('col', 0)
            value: Any = body_data.get('value', '')
            
            cell = Cell(value=value, row=row, col=col)
            
            return {
                'statusCode': 200,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps({
                    'sheetId': sheet_id,
                    'cell': asdict(cell),
                    'message': f'Cell updated! That\'s a sheet-load of success! 💪',
                    'updated': True
                }, ensure_ascii=False),
                'isBase64Encoded': False
            }
        
        # DELETE - удалить строку или столбец
        if action == 'delete':
            sheet_id: str = body_data.get('sheetId', '')
            delete_type: str = body_data.get('type', 'row')
            index: int = body_data.get('index', 0)
            
            return {
                'statusCode': 200,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps({
                    'sheetId': sheet_id,
                    'deleted': {
                        'type': delete_type,
                        'index': index
                    },
                    'message': f'Deleted {delete_type} {index}! Gone with the sheet! 🗑️'
                }, ensure_ascii=False),
                'isBase64Encoded': False
            }
        
        # Unknown action
        return {
            'statusCode': 400,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({
                'error': 'Invalid action',
                'message': f'Action "{action}" not supported! This sheet is getting real! 😅',
                'validActions': ['create', 'read', 'update', 'delete']
            }, ensure_ascii=False),
            'isBase64Encoded': False
        }
    
    # Unsupported method
    return {
        'statusCode': 405,
        'headers': {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
        },
        'body': json.dumps({
            'error': 'Method not allowed',
            'message': 'Only GET and POST methods are supported!'
        }),
        'isBase64Encoded': False
    }
