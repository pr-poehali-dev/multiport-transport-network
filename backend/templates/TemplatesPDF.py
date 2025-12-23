"""
Модуль для работы с PDF-шаблонами
Функции: создание, редактирование, удаление, получение списка шаблонов
"""

from typing import Dict, Any, List, Optional
import json
import io
from PyPDF2 import PdfReader, PdfWriter
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import A4
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont


class TemplatesPDF:
    """Класс для управления PDF-шаблонами"""
    
    def __init__(self, db_connection=None):
        """
        Инициализация модуля шаблонов
        
        Args:
            db_connection: подключение к базе данных (опционально)
        """
        self.db = db_connection
    
    def get_all_templates(self) -> List[Dict[str, Any]]:
        """
        Получить список всех шаблонов
        
        Returns:
            Список шаблонов с метаданными
        """
        # TODO: реализовать получение из БД
        return [
            {
                'id': '1',
                'name': 'Договор перевозки',
                'type': 'contract',
                'created_at': '2024-01-15',
                'updated_at': '2024-01-20'
            }
        ]
    
    def get_template_by_id(self, template_id: str) -> Optional[Dict[str, Any]]:
        """
        Получить шаблон по ID
        
        Args:
            template_id: ID шаблона
            
        Returns:
            Данные шаблона или None
        """
        # TODO: реализовать получение из БД
        return {
            'id': template_id,
            'name': 'Договор перевозки',
            'content': {},
            'fields': []
        }
    
    def create_template(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Создать новый шаблон
        
        Args:
            data: данные шаблона (name, type, content)
            
        Returns:
            Созданный шаблон с ID
        """
        # TODO: реализовать сохранение в БД
        return {
            'id': 'new_template_id',
            'name': data.get('name'),
            'type': data.get('type'),
            'created_at': '2024-12-23'
        }
    
    def update_template(self, template_id: str, data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Обновить существующий шаблон
        
        Args:
            template_id: ID шаблона
            data: новые данные
            
        Returns:
            Обновленный шаблон
        """
        # TODO: реализовать обновление в БД
        return {
            'id': template_id,
            'updated_at': '2024-12-23',
            **data
        }
    
    def delete_template(self, template_id: str) -> bool:
        """
        Удалить шаблон
        
        Args:
            template_id: ID шаблона
            
        Returns:
            True если успешно
        """
        # TODO: реализовать удаление из БД
        return True
    
    def fill_pdf_template(self, template_bytes: bytes, fields: Dict[str, Any]) -> bytes:
        """
        Заполнить PDF-шаблон данными (добавить текст поверх)
        
        Args:
            template_bytes: PDF файл шаблона в байтах
            fields: словарь с данными {field_name: {'text': 'value', 'x': 100, 'y': 200}}
            
        Returns:
            PDF файл с заполненными данными
        """
        template_pdf = PdfReader(io.BytesIO(template_bytes))
        output = PdfWriter()
        
        for page_num in range(len(template_pdf.pages)):
            page = template_pdf.pages[page_num]
            
            packet = io.BytesIO()
            can = canvas.Canvas(packet, pagesize=A4)
            
            for field_name, field_data in fields.items():
                if field_data.get('page', 0) == page_num:
                    text = str(field_data.get('text', ''))
                    x = field_data.get('x', 100)
                    y = field_data.get('y', 700)
                    font_size = field_data.get('font_size', 12)
                    
                    can.setFont("Helvetica", font_size)
                    can.drawString(x, y, text)
            
            can.save()
            packet.seek(0)
            
            overlay = PdfReader(packet)
            page.merge_page(overlay.pages[0])
            output.add_page(page)
        
        output_stream = io.BytesIO()
        output.write(output_stream)
        output_stream.seek(0)
        
        return output_stream.read()
    
    def extract_text_from_pdf(self, pdf_bytes: bytes) -> str:
        """
        Извлечь текст из PDF файла
        
        Args:
            pdf_bytes: PDF файл в байтах
            
        Returns:
            Извлеченный текст
        """
        pdf = PdfReader(io.BytesIO(pdf_bytes))
        text = ""
        
        for page in pdf.pages:
            text += page.extract_text()
        
        return text
    
    def merge_pdfs(self, pdf_list: List[bytes]) -> bytes:
        """
        Объединить несколько PDF файлов в один
        
        Args:
            pdf_list: список PDF файлов в байтах
            
        Returns:
            Объединенный PDF
        """
        output = PdfWriter()
        
        for pdf_bytes in pdf_list:
            pdf = PdfReader(io.BytesIO(pdf_bytes))
            for page in pdf.pages:
                output.add_page(page)
        
        output_stream = io.BytesIO()
        output.write(output_stream)
        output_stream.seek(0)
        
        return output_stream.read()
    
    def generate_pdf(self, template_id: str, data: Dict[str, Any]) -> bytes:
        """
        Сгенерировать PDF из шаблона с данными
        
        Args:
            template_id: ID шаблона
            data: данные для заполнения
            
        Returns:
            PDF файл в виде байтов
        """
        template_info = self.get_template_by_id(template_id)
        
        if not template_info:
            raise ValueError(f"Template {template_id} not found")
        
        template_bytes = template_info.get('pdf_content', b'')
        fields = data.get('fields', {})
        
        return self.fill_pdf_template(template_bytes, fields)