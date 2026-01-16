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
  
  // Реквизиты заказчика (customer)
  { value: 'customer.inn', label: 'Заказчик: ИНН' },
  { value: 'customer.kpp', label: 'Заказчик: КПП' },
  { value: 'customer.ogrn', label: 'Заказчик: ОГРН' },
  { value: 'customer.legalAddress', label: 'Заказчик: Юр. адрес' },
  { value: 'customer.actualAddress', label: 'Заказчик: Факт. адрес' },
  { value: 'customer.directorName', label: 'Заказчик: Директор' },
  { value: 'customer.accountantName', label: 'Заказчик: Бухгалтер' },
  { value: 'customer.phone', label: 'Заказчик: Телефон' },
  { value: 'customer.email', label: 'Заказчик: Email' },
  
  // Реквизиты перевозчика (carrier)
  { value: 'carrier.inn', label: 'Перевозчик: ИНН' },
  { value: 'carrier.kpp', label: 'Перевозчик: КПП' },
  { value: 'carrier.ogrn', label: 'Перевозчик: ОГРН' },
  { value: 'carrier.legalAddress', label: 'Перевозчик: Юр. адрес' },
  { value: 'carrier.actualAddress', label: 'Перевозчик: Факт. адрес' },
  { value: 'carrier.directorName', label: 'Перевозчик: Директор' },
  { value: 'carrier.accountantName', label: 'Перевозчик: Бухгалтер' },
  { value: 'carrier.phone', label: 'Перевозчик: Телефон' },
  { value: 'carrier.email', label: 'Перевозчик: Email' },
  
  // Реквизиты грузоотправителя (loadingSeller)
  { value: 'loadingSeller.inn', label: 'Грузоотправитель: ИНН' },
  { value: 'loadingSeller.kpp', label: 'Грузоотправитель: КПП' },
  { value: 'loadingSeller.ogrn', label: 'Грузоотправитель: ОГРН' },
  { value: 'loadingSeller.legalAddress', label: 'Грузоотправитель: Юр. адрес' },
  { value: 'loadingSeller.actualAddress', label: 'Грузоотправитель: Факт. адрес' },
  { value: 'loadingSeller.directorName', label: 'Грузоотправитель: Директор' },
  { value: 'loadingSeller.phone', label: 'Грузоотправитель: Телефон' },
  
  // Реквизиты грузополучателя (unloadingBuyer)
  { value: 'unloadingBuyer.inn', label: 'Грузополучатель: ИНН' },
  { value: 'unloadingBuyer.kpp', label: 'Грузополучатель: КПП' },
  { value: 'unloadingBuyer.ogrn', label: 'Грузополучатель: ОГРН' },
  { value: 'unloadingBuyer.legalAddress', label: 'Грузополучатель: Юр. адрес' },
  { value: 'unloadingBuyer.actualAddress', label: 'Грузополучатель: Факт. адрес' },
  { value: 'unloadingBuyer.directorName', label: 'Грузополучатель: Директор' },
  { value: 'unloadingBuyer.phone', label: 'Грузополучатель: Телефон' },
];

export const TABLE_OPTIONS = [
  { value: 'contracts', label: 'Договор-Заявка', fields: CONTRACT_FIELDS },
  { value: 'drivers', label: 'Водители', fields: DRIVER_FIELDS },
  { value: 'vehicles', label: 'Автомобили', fields: VEHICLE_FIELDS },
  { value: 'contractors', label: 'Контрагенты', fields: CONTRACTOR_FIELDS },
];