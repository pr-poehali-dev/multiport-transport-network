import json
import os
import base64
from typing import Dict, Any
import psycopg2
from psycopg2.extras import RealDictCursor
from io import BytesIO
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import A4
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.lib.utils import ImageReader
from PyPDF2 import PdfReader, PdfWriter

def handler(event: dict, context) -> dict:
    '''API для генерации PDF документов по шаблонам'''
    method = event.get('httpMethod', 'POST')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type'
            },
            'body': '',
            'isBase64Encoded': False
        }
    
    if method != 'POST':
        return {
            'statusCode': 405,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({'error': 'Method not allowed'}),
            'isBase64Encoded': False
        }
    
    try:
        body_str = event.get('body') or '{}'
        if not body_str.strip():
            body_str = '{}'
        body = json.loads(body_str)
        template_id = body.get('templateId')
        contract_id = body.get('contractId')
        
        if not template_id or not contract_id:
            return {
                'statusCode': 400,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps({'error': 'templateId and contractId are required'}),
                'isBase64Encoded': False
            }
        
        # Подключаемся к БД
        dsn = os.environ.get('DATABASE_URL')
        conn = psycopg2.connect(dsn)
        cursor = conn.cursor(cursor_factory=RealDictCursor)
        
        # Загружаем шаблон
        cursor.execute(
            "SELECT id, name, file_name, file_data, field_mappings FROM templates WHERE id = %s",
            (template_id,)
        )
        template = cursor.fetchone()
        
        if not template:
            cursor.close()
            conn.close()
            return {
                'statusCode': 404,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps({'error': 'Template not found'}),
                'isBase64Encoded': False
            }
        
        # Загружаем договор
        cursor.execute(
            "SELECT * FROM contracts WHERE id = %s",
            (contract_id,)
        )
        contract = cursor.fetchone()
        
        if not contract:
            cursor.close()
            conn.close()
            return {
                'statusCode': 404,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps({'error': 'Contract not found'}),
                'isBase64Encoded': False
            }
        
        # Загружаем связанные данные контрагентов
        related_data = {}
        if contract.get('customer_id'):
            cursor.execute("SELECT * FROM contractors WHERE id = %s", (contract['customer_id'],))
            related_data['customer'] = cursor.fetchone()
        
        if contract.get('carrier_id'):
            cursor.execute("SELECT * FROM contractors WHERE id = %s", (contract['carrier_id'],))
            related_data['carrier'] = cursor.fetchone()
        
        if contract.get('loading_seller_id'):
            cursor.execute("SELECT * FROM contractors WHERE id = %s", (contract['loading_seller_id'],))
            related_data['loadingSeller'] = cursor.fetchone()
        
        if contract.get('unloading_buyer_id'):
            cursor.execute("SELECT * FROM contractors WHERE id = %s", (contract['unloading_buyer_id'],))
            related_data['unloadingBuyer'] = cursor.fetchone()
        
        cursor.close()
        conn.close()
        
        # Генерируем PDF
        pdf_bytes = generate_pdf(template, contract, related_data)
        pdf_base64 = base64.b64encode(pdf_bytes).decode('utf-8')
        
        return {
            'statusCode': 200,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({
                'success': True,
                'message': 'PDF сгенерирован успешно',
                'pdfData': pdf_base64,
                'fileName': f"{template['name']}_{contract['contract_number']}.pdf"
            }),
            'isBase64Encoded': False
        }
        
    except Exception as e:
        return {
            'statusCode': 500,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({'error': str(e)}),
            'isBase64Encoded': False
        }


def generate_pdf(template: Dict[str, Any], contract: Dict[str, Any], related_data: Dict[str, Any]) -> bytes:
    '''Генерирует PDF из шаблона с подстановкой данных'''
    
    # Декодируем PDF шаблон из base64
    template_pdf_bytes = base64.b64decode(template['file_data'])
    template_pdf = BytesIO(template_pdf_bytes)
    
    # Читаем шаблон
    reader = PdfReader(template_pdf)
    writer = PdfWriter()
    
    # Создаем overlay с текстом
    packet = BytesIO()
    can = canvas.Canvas(packet, pagesize=A4)
    
    # Обрабатываем маппинги полей
    field_mappings = template.get('field_mappings', [])
    
    for mapping in field_mappings:
        x = mapping.get('x', 0)
        y = mapping.get('y', 0)
        font_size = mapping.get('fontSize', 12)
        field_label = mapping.get('fieldLabel', '')
        
        # Получаем значение поля
        value = resolve_field_value(field_label, contract, related_data)
        
        # Рисуем текст на canvas
        can.setFont('Helvetica', font_size)
        can.drawString(x, y, str(value))
    
    can.save()
    
    # Накладываем overlay на шаблон
    packet.seek(0)
    overlay_pdf = PdfReader(packet)
    
    page = reader.pages[0]
    page.merge_page(overlay_pdf.pages[0])
    writer.add_page(page)
    
    # Записываем результат
    output = BytesIO()
    writer.write(output)
    output.seek(0)
    
    return output.getvalue()


def resolve_field_value(field_label: str, contract: Dict[str, Any], related_data: Dict[str, Any]) -> str:
    '''Разрешает значение поля из формулы с тегами'''
    
    # Маппинг тегов на поля договора
    field_mapping = {
        'Номер договора': 'contract_number',
        'Дата договора': 'contract_date',
        'Заказчик': 'customer_name',
        'Перевозчик': 'carrier_name',
        'Груз': 'cargo',
        'Грузоотправитель': 'loading_seller_name',
        'Грузополучатель': 'unloading_buyer_name',
        'Адреса погрузки': 'loading_addresses',
        'Адреса разгрузки': 'unloading_addresses',
        'Дата погрузки': 'loading_date',
        'Дата разгрузки': 'unloading_date',
        'Сумма (руб.)': 'payment_amount',
        'Водитель ФИО': 'driver_full_name',
        'Водитель телефон': 'driver_phone',
        'ТС: Номер тягача': 'vehicle_registration_number',
        'ТС: Номер прицепа': 'vehicle_trailer_number',
    }
    
    # Простая замена одного тега
    for tag, field_name in field_mapping.items():
        if f'<{tag}>' in field_label:
            value = contract.get(field_name, '')
            if isinstance(value, list):
                value = ', '.join(value)
            field_label = field_label.replace(f'<{tag}>', str(value) if value else '')
    
    # Обработка вложенных полей (customer.inn, carrier.kpp и т.д.)
    import re
    nested_pattern = r'<(Заказчик|Перевозчик|Грузоотправитель|Грузополучатель): (.+?)>'
    matches = re.findall(nested_pattern, field_label)
    
    for entity_ru, field_ru in matches:
        entity_map = {
            'Заказчик': 'customer',
            'Перевозчик': 'carrier',
            'Грузоотправитель': 'loadingSeller',
            'Грузополучатель': 'unloadingBuyer'
        }
        
        field_map = {
            'ИНН': 'inn',
            'КПП': 'kpp',
            'ОГРН': 'ogrn',
            'Юр. адрес': 'legal_address',
            'Факт. адрес': 'actual_address',
            'Директор': 'director_name',
            'Бухгалтер': 'accountant_name',
            'Телефон': 'phone',
            'Email': 'email'
        }
        
        entity_key = entity_map.get(entity_ru)
        field_key = field_map.get(field_ru)
        
        if entity_key and field_key and entity_key in related_data:
            value = related_data[entity_key].get(field_key, '') if related_data[entity_key] else ''
            field_label = field_label.replace(f'<{entity_ru}: {field_ru}>', str(value) if value else '')
    
    return field_label