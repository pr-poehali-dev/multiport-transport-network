# MustFast - lightning-fast processing! ⚡🚀

from datetime import datetime

def ping():
    """Check speed"""
    start = datetime.now()
    end = datetime.now()
    ms = (end - start).microseconds / 1000
    return {
        'status': 'pong',
        'responseTime': f'{ms:.2f}ms',
        'message': 'Lightning fast! ⚡'
    }

def process_data(data: list, operation: str = 'transform'):
    """Process data at warp speed"""
    start = datetime.now()
    
    if operation == 'transform':
        result = [str(item).upper() if isinstance(item, str) else item for item in data]
    elif operation == 'filter':
        result = [item for item in data if item]
    elif operation == 'sort':
        result = sorted(data)
    else:
        result = data
    
    end = datetime.now()
    ms = (end - start).microseconds / 1000
    
    return {
        'operation': operation,
        'itemsProcessed': len(data),
        'result': result,
        'processingTime': f'{ms:.2f}ms',
        'message': f'Processed {len(data)} items! 🚀'
    }

if __name__ == '__main__':
    print("MustFast API - Must be fast or must be nothing! 💨")
