import json
import os
import base64
import re
from typing import Dict, Any
import psycopg2
from psycopg2.extras import RealDictCursor
from io import BytesIO
from pypdf import PdfReader, PdfWriter
import pikepdf

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
        
        # Проверяем что file_data не пустой
        if not template.get('file_data'):
            cursor.close()
            conn.close()
            return {
                'statusCode': 400,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps({'error': 'Template file data is empty'}),
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
    '''Генерирует PDF заполняя поля формы из шаблона'''
    
    # Получаем file_data из шаблона
    file_data = template['file_data']
    
    # PostgreSQL bytea возвращается как memoryview или bytes
    if isinstance(file_data, memoryview):
        template_pdf_bytes = file_data.tobytes()
    elif isinstance(file_data, bytes):
        template_pdf_bytes = file_data
    elif isinstance(file_data, str):
        file_data = file_data.strip().replace('\n', '').replace('\r', '')
        template_pdf_bytes = base64.b64decode(file_data)
    else:
        raise ValueError(f'Unexpected file_data type: {type(file_data)}')
    
    # Проверяем что это действительно PDF
    if not template_pdf_bytes.startswith(b'%PDF'):
        raise ValueError(f'Invalid PDF header: {template_pdf_bytes[:20]}')
    
    template_pdf = BytesIO(template_pdf_bytes)
    
    # Подготавливаем данные для замены
    form_data = prepare_form_data(contract, related_data)
    
    print(f'[DEBUG] Data to fill: {form_data}')
    
    # Шаг 1: Заменяем плейсхолдеры {{field_name}}
    try:
        pdf_with_placeholders = replace_placeholders(template_pdf_bytes, form_data)
        template_pdf = BytesIO(pdf_with_placeholders)
    except Exception as e:
        print(f'[WARNING] Placeholder replacement failed: {e}, skipping')
        template_pdf = BytesIO(template_pdf_bytes)
    
    # Шаг 2: Заполняем поля формы (если они есть)
    reader = PdfReader(template_pdf, strict=False)
    writer = PdfWriter()
    writer.append(reader)
    
    for page in writer.pages:
        try:
            writer.update_page_form_field_values(page, form_data)
        except Exception as e:
            print(f'[WARNING] Could not update form fields: {e}')
    
    # Записываем результат
    output = BytesIO()
    writer.write(output)
    output.seek(0)
    
    return output.getvalue()


def replace_placeholders(pdf_bytes: bytes, data: Dict[str, str]) -> bytes:
    '''Заменяет плейсхолдеры {{field_name}} в PDF на реальные значения'''
    
    try:
        with pikepdf.open(BytesIO(pdf_bytes)) as pdf:
            replacements_made = 0
            
            for page in pdf.pages:
                # Извлекаем содержимое страницы
                if '/Contents' not in page:
                    continue
                
                contents = page.Contents
                
                # Если Contents - массив, обрабатываем каждый элемент
                if isinstance(contents, pikepdf.Array):
                    for i, content_stream in enumerate(contents):
                        stream_data = content_stream.read_bytes().decode('latin-1', errors='ignore')
                        modified = stream_data
                        
                        # Заменяем все плейсхолдеры
                        for key, value in data.items():
                            placeholder = f'{{{{{key}}}}}'
                            if placeholder in modified:
                                modified = modified.replace(placeholder, str(value))
                                replacements_made += 1
                                print(f'[DEBUG] Replaced {placeholder} -> {value}')
                        
                        if modified != stream_data:
                            contents[i] = pikepdf.Stream(pdf, modified.encode('latin-1', errors='ignore'))
                else:
                    # Одиночный stream
                    stream_data = contents.read_bytes().decode('latin-1', errors='ignore')
                    modified = stream_data
                    
                    for key, value in data.items():
                        placeholder = f'{{{{{key}}}}}'
                        if placeholder in modified:
                            modified = modified.replace(placeholder, str(value))
                            replacements_made += 1
                            print(f'[DEBUG] Replaced {placeholder} -> {value}')
                    
                    if modified != stream_data:
                        page.Contents = pikepdf.Stream(pdf, modified.encode('latin-1', errors='ignore'))
            
            print(f'[INFO] Total placeholder replacements: {replacements_made}')
            
            # Сохраняем в буфер
            output = BytesIO()
            pdf.save(output)
            output.seek(0)
            return output.getvalue()
    
    except Exception as e:
        print(f'[ERROR] Placeholder replacement failed: {e}')
        return pdf_bytes


def prepare_form_data(contract: Dict[str, Any], related_data: Dict[str, Any]) -> Dict[str, str]:
    '''Подготавливает данные для заполнения полей PDF-формы'''
    
    form_data = {}
    
    # Данные договора
    if contract.get('contract_number'):
        form_data['contract_number'] = str(contract['contract_number'])
    
    if contract.get('contract_date'):
        form_data['contract_date'] = str(contract['contract_date'])
    
    if contract.get('cargo'):
        form_data['cargo'] = str(contract['cargo'])
    
    if contract.get('loading_addresses'):
        addresses = contract['loading_addresses']
        form_data['loading_addresses'] = ', '.join(addresses) if isinstance(addresses, list) else str(addresses)
    
    if contract.get('unloading_addresses'):
        addresses = contract['unloading_addresses']
        form_data['unloading_addresses'] = ', '.join(addresses) if isinstance(addresses, list) else str(addresses)
    
    if contract.get('loading_date'):
        form_data['loading_date'] = str(contract['loading_date'])
    
    if contract.get('unloading_date'):
        form_data['unloading_date'] = str(contract['unloading_date'])
    
    if contract.get('payment_amount'):
        form_data['payment_amount'] = str(contract['payment_amount'])
    
    if contract.get('driver_full_name'):
        form_data['driver_full_name'] = str(contract['driver_full_name'])
    
    if contract.get('driver_phone'):
        form_data['driver_phone'] = str(contract['driver_phone'])
    
    if contract.get('vehicle_registration_number'):
        form_data['vehicle_registration_number'] = str(contract['vehicle_registration_number'])
    
    if contract.get('vehicle_trailer_number'):
        form_data['vehicle_trailer_number'] = str(contract['vehicle_trailer_number'])
    
    if contract.get('temperature_mode'):
        form_data['temperature_mode'] = str(contract['temperature_mode'])
    
    if contract.get('additional_conditions'):
        form_data['additional_conditions'] = str(contract['additional_conditions'])
    
    # Данные контрагентов
    if 'customer' in related_data and related_data['customer']:
        customer = related_data['customer']
        if customer.get('name'):
            form_data['customer_name'] = str(customer['name'])
        if customer.get('inn'):
            form_data['customer_inn'] = str(customer['inn'])
        if customer.get('kpp'):
            form_data['customer_kpp'] = str(customer['kpp'])
        if customer.get('ogrn'):
            form_data['customer_ogrn'] = str(customer['ogrn'])
        if customer.get('legal_address'):
            form_data['customer_legal_address'] = str(customer['legal_address'])
        if customer.get('director'):
            form_data['customer_director'] = str(customer['director'])
    
    if 'carrier' in related_data and related_data['carrier']:
        carrier = related_data['carrier']
        if carrier.get('name'):
            form_data['carrier_name'] = str(carrier['name'])
        if carrier.get('inn'):
            form_data['carrier_inn'] = str(carrier['inn'])
        if carrier.get('kpp'):
            form_data['carrier_kpp'] = str(carrier['kpp'])
        if carrier.get('ogrn'):
            form_data['carrier_ogrn'] = str(carrier['ogrn'])
        if carrier.get('legal_address'):
            form_data['carrier_legal_address'] = str(carrier['legal_address'])
        if carrier.get('director'):
            form_data['carrier_director'] = str(carrier['director'])
    
    if 'loadingSeller' in related_data and related_data['loadingSeller']:
        seller = related_data['loadingSeller']
        if seller.get('name'):
            form_data['loading_seller_name'] = str(seller['name'])
        if seller.get('inn'):
            form_data['loading_seller_inn'] = str(seller['inn'])
    
    if 'unloadingBuyer' in related_data and related_data['unloadingBuyer']:
        buyer = related_data['unloadingBuyer']
        if buyer.get('name'):
            form_data['unloading_buyer_name'] = str(buyer['name'])
        if buyer.get('inn'):
            form_data['unloading_buyer_inn'] = str(buyer['inn'])
    
    return form_data