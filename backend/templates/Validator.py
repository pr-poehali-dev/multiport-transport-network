"""
Модуль валидации данных для API шаблонов
Проверяет корректность входных данных
"""

from typing import Dict, Any, Tuple, Optional


def validate_template_create(data: Dict[str, Any]) -> Tuple[bool, Optional[str]]:
    """
    Валидация данных для создания шаблона
    
    Args:
        data: данные шаблона (должно содержать name)
        
    Returns:
        (is_valid, error_message) - результат валидации и текст ошибки
    """
    if not data.get('name'):
        return False, 'Template name is required'
    
    if not isinstance(data.get('name'), str):
        return False, 'Template name must be a string'
    
    if len(data.get('name', '')) < 3:
        return False, 'Template name must be at least 3 characters'
    
    return True, None


def validate_template_update(data: Dict[str, Any]) -> Tuple[bool, Optional[str]]:
    """
    Валидация данных для обновления шаблона
    
    Args:
        data: данные шаблона (должно содержать id)
        
    Returns:
        (is_valid, error_message) - результат валидации и текст ошибки
    """
    if not data.get('id'):
        return False, 'Template ID is required'
    
    if not isinstance(data.get('id'), str):
        return False, 'Template ID must be a string'
    
    return True, None


def validate_template_id(template_id: Optional[str]) -> Tuple[bool, Optional[str]]:
    """
    Валидация ID шаблона
    
    Args:
        template_id: ID шаблона для проверки
        
    Returns:
        (is_valid, error_message) - результат валидации и текст ошибки
    """
    if not template_id:
        return False, 'Template ID is required'
    
    if not isinstance(template_id, str):
        return False, 'Template ID must be a string'
    
    return True, None
