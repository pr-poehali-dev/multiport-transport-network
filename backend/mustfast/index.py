import json
from typing import Dict, Any, List
from datetime import datetime


def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    """
    MustFast API - быстрая обработка данных (must be fast!)
    
    Операции через параметр 'action':
    - ping - проверка скорости ответа
    - process - быстрая обработка данных
    - batch - пакетная обработка
    - benchmark - тест производительности
    
    Args:
        event: HTTP запрос с method, body
        context: объект контекста выполнения
    
    Returns:
        HTTP ответ с результатами обработки
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
                'message': 'Welcome to MustFast API! ⚡️🚀',
                'description': 'Lightning-fast data processing because slow is not an option',
                'motto': 'Must be fast or must be nothing!',
                'usage': 'POST with action: ping, process, batch, benchmark',
                'status': 'ready to go FAST! 💨'
            }, ensure_ascii=False),
            'isBase64Encoded': False
        }
    
    # POST - обработка действий
    if method == 'POST':
        body_data = json.loads(event.get('body', '{}'))
        action: str = body_data.get('action', '')
        start_time = datetime.now()
        
        # PING - проверка скорости
        if action == 'ping':
            end_time = datetime.now()
            response_time_ms = (end_time - start_time).microseconds / 1000
            
            return {
                'statusCode': 200,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps({
                    'action': 'ping',
                    'status': 'pong',
                    'responseTime': f'{response_time_ms:.2f}ms',
                    'message': 'Lightning fast! ⚡️',
                    'timestamp': end_time.isoformat()
                }, ensure_ascii=False),
                'isBase64Encoded': False
            }
        
        # PROCESS - быстрая обработка данных
        if action == 'process':
            data: List[Any] = body_data.get('data', [])
            operation: str = body_data.get('operation', 'transform')
            
            # Быстрая обработка (пример)
            if operation == 'transform':
                result = [str(item).upper() if isinstance(item, str) else item for item in data]
            elif operation == 'filter':
                result = [item for item in data if item]
            elif operation == 'sort':
                result = sorted(data)
            else:
                result = data
            
            end_time = datetime.now()
            processing_time = (end_time - start_time).microseconds / 1000
            
            return {
                'statusCode': 200,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps({
                    'action': 'process',
                    'operation': operation,
                    'itemsProcessed': len(data),
                    'result': result,
                    'processingTime': f'{processing_time:.2f}ms',
                    'message': f'Processed {len(data)} items in {processing_time:.2f}ms! 🚀'
                }, ensure_ascii=False),
                'isBase64Encoded': False
            }
        
        # BATCH - пакетная обработка
        if action == 'batch':
            batches: List[List[Any]] = body_data.get('batches', [])
            
            results = []
            for batch in batches:
                results.append({
                    'size': len(batch),
                    'processed': True
                })
            
            end_time = datetime.now()
            processing_time = (end_time - start_time).microseconds / 1000
            
            return {
                'statusCode': 200,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps({
                    'action': 'batch',
                    'batchesProcessed': len(batches),
                    'results': results,
                    'processingTime': f'{processing_time:.2f}ms',
                    'message': f'Batch processed {len(batches)} groups at warp speed! 🌟'
                }, ensure_ascii=False),
                'isBase64Encoded': False
            }
        
        # BENCHMARK - тест производительности
        if action == 'benchmark':
            iterations: int = body_data.get('iterations', 1000)
            
            # Имитация работы
            for i in range(iterations):
                _ = i * 2
            
            end_time = datetime.now()
            total_time = (end_time - start_time).microseconds / 1000
            ops_per_sec = (iterations / total_time) * 1000 if total_time > 0 else 0
            
            return {
                'statusCode': 200,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps({
                    'action': 'benchmark',
                    'iterations': iterations,
                    'totalTime': f'{total_time:.2f}ms',
                    'operationsPerSecond': f'{ops_per_sec:.0f}',
                    'message': f'Blazing fast! {ops_per_sec:.0f} ops/sec! 🔥'
                }, ensure_ascii=False),
                'isBase64Encoded': False
            }
        
        return {
            'statusCode': 400,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({
                'error': 'Invalid action',
                'message': f'Action "{action}" not supported!',
                'validActions': ['ping', 'process', 'batch', 'benchmark']
            }, ensure_ascii=False),
            'isBase64Encoded': False
        }
    
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
