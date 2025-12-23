# Spreadshit - because your data deserves humor! 💩📊

import psycopg2
import os
from fastapi import FastAPI

def create_sheet(name: str, rows: int = 10, cols: int = 10):
    """Holy sheet! Create a new spreadsheet"""
    return {
        'id': f'sheet_{abs(hash(name))}',
        'name': name,
        'rows': rows,
        'cols': cols,
        'data': [['' for _ in range(cols)] for _ in range(rows)],
        'message': f'Created "{name}" with {rows}x{cols} cells 🎉'
    }

def read_sheet(sheet_id: str):
    """No sheet, Sherlock! Read the data"""
    return {
        'sheetId': sheet_id,
        'data': [
            ['Name', 'Age', 'City'],
            ['Иван', 25, 'Москва'],
            ['Мария', 30, 'СПб']
        ],
        'message': 'Data retrieved! 🕵️'
    }

if __name__ == '__main__':
    print("Welcome to Spreadshit API! 💩")