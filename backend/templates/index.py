"""
Backend функция для работы с PDF-шаблонами
Методы: GET (список), POST (создание), PUT (обновление), DELETE (удаление)
"""

import json
from typing import Dict, Any
from TemplatesPDF import TemplatesPDF
from ResponseBuilder import cors_response, success_response, error_response
from Validator import validate_template_create, validate_template_update, validate_template_id


def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    """
    Обработчик запросов к API шаблонов
    
    Args:
        event: HTTP запрос с методом, путем, телом
        context: контекст выполнения функции
        
    Returns:
        HTTP ответ с данными шаблонов
    """
    method: str = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return cors_response()
    
    templates_module = TemplatesPDF()
    
    if method == 'GET':
        params = event.get('queryStringParameters') or {}
        template_id = params.get('id')
        
        if template_id:
            template = templates_module.get_template_by_id(template_id)
            if template:
                return success_response(template)
            return error_response(404, 'Template not found')
        
        all_templates = templates_module.get_all_templates()
        return success_response({
            'templates': all_templates,
            'total': len(all_templates)
        })
    
    if method == 'POST':
        body_data = json.loads(event.get('body', '{}'))
        
        is_valid, error_msg = validate_template_create(body_data)
        if not is_valid:
            return error_response(400, error_msg)
        
        result = templates_module.create_template(body_data)
        return success_response(result, 201)
    
    if method == 'PUT':
        body_data = json.loads(event.get('body', '{}'))
        
        is_valid, error_msg = validate_template_update(body_data)
        if not is_valid:
            return error_response(400, error_msg)
        
        template_id = body_data.get('id')
        result = templates_module.update_template(template_id, body_data)
        return success_response(result)
    
    if method == 'DELETE':
        params = event.get('queryStringParameters') or {}
        template_id = params.get('id')
        
        is_valid, error_msg = validate_template_id(template_id)
        if not is_valid:
            return error_response(400, error_msg)
        
        success = templates_module.delete_template(template_id)
        status = 200 if success else 500
        return success_response({'success': success}, status)
    
    return error_response(405, 'Method not allowed')