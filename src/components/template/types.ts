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
  align?: 'left' | 'center' | 'right';
  wordWrap?: boolean;
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
  { value: 'lastName', label: 'Фамилия' },
  { value: 'firstName', label: 'Имя' },
  { value: 'middleName', label: 'Отчество' },
  { value: 'phone', label: 'Телефон 1' },
  { value: 'phoneExtra', label: 'Телефон 2' },
  { value: 'passportSeries', label: 'Паспорт: Серия' },
  { value: 'passportNumber', label: 'Паспорт: Номер' },
  { value: 'passportDate', label: 'Паспорт: Дата выдачи' },
  { value: 'passportIssued', label: 'Паспорт: Кем выдан' },
  { value: 'licenseSeries', label: 'ВУ: Серия' },
  { value: 'licenseNumber', label: 'ВУ: Номер' },
  { value: 'licenseDate', label: 'ВУ: Дата выдачи' },
  { value: 'licenseIssued', label: 'ВУ: Кем выдан' },
];

export const VEHICLE_FIELDS = [
  { value: 'registrationNumber', label: 'Гос. номер тягача' },
  { value: 'trailerNumber', label: 'Гос. номер прицепа' },
  { value: 'brand', label: 'Марка' },
  { value: 'model', label: 'Модель' },
  { value: 'yearOfManufacture', label: 'Год выпуска' },
  { value: 'technicalCertificate', label: 'ПТС/СТС' },
];

export const CONTRACTOR_FIELDS = [
  { value: 'name', label: 'Название' },
  { value: 'inn', label: 'ИНН' },
  { value: 'kpp', label: 'КПП' },
  { value: 'ogrn', label: 'ОГРН' },
  { value: 'legalAddress', label: 'Юридический адрес' },
  { value: 'actualAddress', label: 'Фактический адрес' },
  { value: 'directorName', label: 'Директор ФИО' },
  { value: 'accountantName', label: 'Бухгалтер ФИО' },
  { value: 'phone', label: 'Телефон' },
  { value: 'email', label: 'Email' },
];

export const CONTRACT_FIELDS = [
  { value: 'contractNumber', label: 'Номер договора' },
  { value: 'contractDate', label: 'Дата договора' },
  { value: 'customerName', label: 'Заказчик' },
  { value: 'carrierName', label: 'Перевозчик' },
  { value: 'vehicleType', label: 'Тип кузова' },
  { value: 'vehicleCapacityTons', label: 'Грузоподъемность (т)' },
  { value: 'vehicleCapacityM3', label: 'Объем (м³)' },
  { value: 'temperatureMode', label: 'Температурный режим' },
  { value: 'additionalConditions', label: 'Доп. условия' },
  { value: 'cargo', label: 'Груз' },
  { value: 'loadingSellerName', label: 'Грузоотправитель' },
  { value: 'loadingAddresses', label: 'Адреса погрузки' },
  { value: 'loadingDate', label: 'Дата погрузки' },
  { value: 'unloadingBuyerName', label: 'Грузополучатель' },
  { value: 'unloadingAddresses', label: 'Адреса разгрузки' },
  { value: 'unloadingDate', label: 'Дата разгрузки' },
  { value: 'paymentAmount', label: 'Сумма (руб.)' },
  { value: 'taxationType', label: 'Налогообложение' },
  { value: 'paymentTerms', label: 'Условия оплаты' },
  { value: 'driverFullName', label: 'Водитель ФИО' },
  { value: 'driverPhone', label: 'Водитель телефон' },
  { value: 'driverPassport', label: 'Водитель паспорт' },
  { value: 'driverLicense', label: 'Водитель ВУ' },
  { value: 'vehicleRegistrationNumber', label: 'ТС: Номер тягача' },
  { value: 'vehicleTrailerNumber', label: 'ТС: Номер прицепа' },
  { value: 'vehicleBrand', label: 'ТС: Марка' },
];

export const TABLE_OPTIONS = [
  { value: 'contracts', label: 'Договор-Заявка', fields: CONTRACT_FIELDS },
  { value: 'drivers', label: 'Водители', fields: DRIVER_FIELDS },
  { value: 'vehicles', label: 'Автомобили', fields: VEHICLE_FIELDS },
  { value: 'contractors', label: 'Контрагенты', fields: CONTRACTOR_FIELDS },
];