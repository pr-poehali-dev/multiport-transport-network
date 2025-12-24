import json
import psycopg2
import os
import base64
from typing import Dict, Any, List, Tuple
from io import BytesIO
from pypdf import PdfReader, PdfWriter
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import letter

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    '''
    Генерация PDF документа водителя на основе шаблона
    Args: event - dict с httpMethod, body (templateId, driverId)
          context - объект с атрибутами request_id, function_name
    Returns: HTTP response с PDF в base64
    '''
    method: str = event.get('httpMethod', 'POST')
    
    cors_headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, X-User-Id, X-Auth-Token',
        'Access-Control-Max-Age': '86400',
        'Content-Type': 'application/json'
    }
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': cors_headers,
            'body': '',
            'isBase64Encoded': False
        }
    
    if method != 'POST':
        return {
            'statusCode': 405,
            'headers': cors_headers,
            'body': json.dumps({'error': 'Method not allowed'}),
            'isBase64Encoded': False
        }
    
    db_url = os.environ.get('DATABASE_URL')
    if not db_url:
        return {
            'statusCode': 500,
            'headers': cors_headers,
            'body': json.dumps({'error': 'DATABASE_URL not configured'}),
            'isBase64Encoded': False
        }
    
    try:
        body_data = json.loads(event.get('body', '{}'))
        template_id = body_data.get('templateId')
        driver_id = body_data.get('driverId')
        
        if not template_id or not driver_id:
            return {
                'statusCode': 400,
                'headers': cors_headers,
                'body': json.dumps({'error': 'Укажите templateId и driverId'}),
                'isBase64Encoded': False
            }
        
        conn = psycopg2.connect(db_url)
        cursor = conn.cursor()
        
        # Получаем шаблон
        cursor.execute('SELECT file_data, field_mappings FROM templates WHERE id = %s', (template_id,))
        template_row = cursor.fetchone()
        
        if not template_row or not template_row[0]:
            return {
                'statusCode': 404,
                'headers': cors_headers,
                'body': json.dumps({'error': 'Шаблон не найден'}),
                'isBase64Encoded': False
            }
        
        pdf_data = bytes(template_row[0])
        field_mappings = template_row[1] or []
        
        # Получаем данные водителя
        cursor.execute('SELECT * FROM drivers WHERE id = %s', (driver_id,))
        driver_row = cursor.fetchone()
        
        if not driver_row:
            return {
                'statusCode': 404,
                'headers': cors_headers,
                'body': json.dumps({'error': 'Водитель не найден'}),
                'isBase64Encoded': False
            }
        
        driver_data = {
            'lastName': driver_row[1] or '',
            'firstName': driver_row[2] or '',
            'middleName': driver_row[3] or '',
            'phone': driver_row[4] or '',
            'phoneExtra': driver_row[5] or '',
            'passportSeries': driver_row[6] or '',
            'passportNumber': driver_row[7] or '',
            'passportDate': driver_row[8] or '',
            'passportIssued': driver_row[9] or '',
            'licenseSeries': driver_row[10] or '',
            'licenseNumber': driver_row[11] or '',
            'licenseDate': driver_row[12] or '',
            'licenseIssued': driver_row[13] or '',
        }
        
        cursor.close()
        conn.close()
        
        # Генерируем PDF с наложением данных
        result_pdf = generate_pdf_with_data(pdf_data, field_mappings, driver_data)
        result_b64 = base64.b64encode(result_pdf).decode('utf-8')
        
        return {
            'statusCode': 200,
            'headers': cors_headers,
            'body': json.dumps({
                'pdfData': result_b64,
                'message': 'PDF успешно сгенерирован'
            }),
            'isBase64Encoded': False
        }
        
    except Exception as e:
        return {
            'statusCode': 500,
            'headers': cors_headers,
            'body': json.dumps({'error': f'Ошибка генерации PDF: {str(e)}'}),
            'isBase64Encoded': False
        }


def wrap_text(text: str, max_width: float, font_size: float, font_name: str = 'Helvetica') -> List[str]:
    '''
    Разбивает текст на строки по словам (word wrap)
    Args:
        text: исходный текст
        max_width: максимальная ширина в пунктах
        font_size: размер шрифта
        font_name: название шрифта
    Returns: список строк
    '''
    from reportlab.pdfbase.pdfmetrics import stringWidth
    
    words = text.split(' ')
    lines = []
    current_line = ''
    
    for word in words:
        test_line = f"{current_line} {word}".strip()
        test_width = stringWidth(test_line, font_name, font_size)
        
        if test_width <= max_width:
            current_line = test_line
        else:
            if current_line:
                lines.append(current_line)
            current_line = word
    
    if current_line:
        lines.append(current_line)
    
    return lines if lines else [text]


def draw_text_centered(c: canvas.Canvas, text: str, x: float, y: float, width: float, height: float, 
                       font_size: float, font_name: str = 'Helvetica', word_wrap: bool = True):
    '''
    Рисует текст с центрированием и переносом по словам
    Args:
        c: canvas объект
        text: текст для отрисовки
        x, y: координаты левого верхнего угла
        width, height: размеры области
        font_size: размер шрифта
        font_name: название шрифта
        word_wrap: использовать перенос по словам
    '''
    from reportlab.pdfbase.pdfmetrics import stringWidth
    
    # Белый фон (затираем старый текст)
    c.setFillColorRGB(1, 1, 1)
    c.rect(x, y - height, width, height, fill=True, stroke=False)
    
    # Чёрный цвет текста
    c.setFillColorRGB(0, 0, 0)
    c.setFont(font_name, font_size)
    
    if word_wrap:
        lines = wrap_text(text, width - 8, font_size, font_name)
    else:
        lines = [text]
    
    line_height = font_size * 1.2
    total_text_height = len(lines) * line_height
    
    # Вертикальное центрирование
    start_y = y - (height - total_text_height) / 2 - font_size
    
    for i, line in enumerate(lines):
        line_width = stringWidth(line, font_name, font_size)
        # Горизонтальное центрирование
        text_x = x + (width - line_width) / 2
        text_y = start_y - (i * line_height)
        
        c.drawString(text_x, text_y, line)


def evaluate_formula(formula: str, driver_data: Dict[str, str]) -> str:
    '''
    Вычисляет формулу, заменяя поля на данные водителя
    Args:
        formula: формула вида "<Фамилия> <Имя> <Отчество>"
        driver_data: словарь с данными водителя
    Returns: результат подстановки
    '''
    result = formula
    
    field_map = {
        'Фамилия': 'lastName',
        'Имя': 'firstName',
        'Отчество': 'middleName',
        'Телефон 1': 'phone',
        'Телефон 2': 'phoneExtra',
        'Паспорт: Серия': 'passportSeries',
        'Паспорт: Номер': 'passportNumber',
        'Паспорт: Дата выдачи': 'passportDate',
        'Паспорт: Кем выдан': 'passportIssued',
        'ВУ: Серия': 'licenseSeries',
        'ВУ: Номер': 'licenseNumber',
        'ВУ: Дата выдачи': 'licenseDate',
        'ВУ: Кем выдан': 'licenseIssued',
    }
    
    for label, field_name in field_map.items():
        placeholder = f"<{label}>"
        if placeholder in result:
            result = result.replace(placeholder, driver_data.get(field_name, ''))
    
    return result.strip()


def generate_pdf_with_data(pdf_data: bytes, field_mappings: List[Dict], driver_data: Dict[str, str]) -> bytes:
    '''
    Генерирует PDF с наложением данных водителя
    Args:
        pdf_data: исходный PDF файл
        field_mappings: маппинги полей
        driver_data: данные водителя
    Returns: байты нового PDF
    '''
    existing_pdf = PdfReader(BytesIO(pdf_data))
    output = PdfWriter()
    
    page = existing_pdf.pages[0]
    page_width = float(page.mediabox.width)
    page_height = float(page.mediabox.height)
    
    # Создаём overlay с текстом
    packet = BytesIO()
    c = canvas.Canvas(packet, pagesize=(page_width, page_height))
    
    for mapping in field_mappings:
        formula = mapping.get('fieldLabel', '')
        x = mapping.get('x', 0)
        y = mapping.get('y', 0)
        width = mapping.get('width', 100)
        height = mapping.get('height', 20)
        font_size = mapping.get('fontSize', 12)
        font_family = mapping.get('fontFamily', 'Helvetica')
        align = mapping.get('align', 'center')
        word_wrap = mapping.get('wordWrap', True)
        
        # Вычисляем текст из формулы
        text = evaluate_formula(formula, driver_data)
        
        # Конвертируем координаты (PDF использует нижний левый угол)
        pdf_y = page_height - y
        
        # Рисуем текст с центрированием и word wrap
        draw_text_centered(c, text, x, pdf_y, width, height, font_size, font_family, word_wrap)
    
    c.save()
    
    # Накладываем overlay на оригинальный PDF
    packet.seek(0)
    overlay_pdf = PdfReader(packet)
    page.merge_page(overlay_pdf.pages[0])
    output.add_page(page)
    
    # Возвращаем результат
    result = BytesIO()
    output.write(result)
    return result.getvalue()
