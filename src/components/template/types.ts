import type { TextItem } from 'pdfjs-dist/types/src/display/api';

export interface FieldMapping {
  id: string;
  fieldName: string;
  fieldLabel: string;
  x: number;
  y: number;
  width: number;
  height: number;
  page: number;
  fontSize?: number;
  fontFamily?: string;
  text?: string;
}

export interface TextItemWithPosition extends TextItem {
  transform: number[];
}

export interface TextItemData {
  text: string;
  x: number;
  y: number;
  width: number;
  height: number;
  fontSize: number;
  fontFamily: string;
}

export interface TemplateFile {
  file: File;
  pdfUrl: string;
  fileName: string;
}

export const DRIVER_FIELDS = [
  { value: 'lastName', label: 'Фамилия', group: 'personal' },
  { value: 'firstName', label: 'Имя', group: 'personal' },
  { value: 'middleName', label: 'Отчество', group: 'personal' },
  { value: 'phone', label: 'Телефон 1', group: 'contact' },
  { value: 'phoneExtra', label: 'Телефон 2', group: 'contact' },
  { value: 'passportSeries', label: 'Паспорт: Серия', group: 'passport' },
  { value: 'passportNumber', label: 'Паспорт: Номер', group: 'passport' },
  { value: 'passportDate', label: 'Паспорт: Дата выдачи', group: 'passport' },
  { value: 'passportIssued', label: 'Паспорт: Кем выдан', group: 'passport' },
  { value: 'licenseSeries', label: 'ВУ: Серия', group: 'license' },
  { value: 'licenseNumber', label: 'ВУ: Номер', group: 'license' },
  { value: 'licenseDate', label: 'ВУ: Дата выдачи', group: 'license' },
  { value: 'licenseIssued', label: 'ВУ: Кем выдан', group: 'license' },
];

export const FIELD_GROUPS = [
  { value: 'personal', label: 'Личные данные' },
  { value: 'contact', label: 'Контакты' },
  { value: 'passport', label: 'Паспорт' },
  { value: 'license', label: 'Водительское удостоверение' },
];
