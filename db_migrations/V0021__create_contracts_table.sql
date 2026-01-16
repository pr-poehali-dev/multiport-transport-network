-- Создание таблицы для договоров-заявок
CREATE TABLE contracts (
    id SERIAL PRIMARY KEY,
    
    -- Основная информация
    contract_number VARCHAR(100) NOT NULL UNIQUE,
    contract_date DATE NOT NULL,
    
    -- Стороны договора
    customer_id INTEGER REFERENCES contractors(id),
    carrier_id INTEGER REFERENCES contractors(id),
    
    -- Требуемый тип ТС
    vehicle_type VARCHAR(100),
    vehicle_capacity_tons DECIMAL(10,2),
    vehicle_capacity_m3 DECIMAL(10,2),
    
    -- Особые условия
    temperature_mode VARCHAR(200),
    additional_conditions TEXT,
    
    -- Груз
    cargo VARCHAR(500) NOT NULL,
    
    -- Погрузка
    loading_seller_id INTEGER REFERENCES contractors(id),
    loading_addresses JSONB DEFAULT '[]'::jsonb,
    loading_date VARCHAR(100),
    
    -- Разгрузка
    unloading_buyer_id INTEGER REFERENCES contractors(id),
    unloading_addresses JSONB DEFAULT '[]'::jsonb,
    unloading_date VARCHAR(100),
    
    -- Оплата
    payment_amount DECIMAL(12,2),
    taxation_type VARCHAR(50),
    payment_terms VARCHAR(200),
    
    -- Данные водителя (копируются при назначении)
    driver_id INTEGER REFERENCES drivers(id),
    driver_full_name VARCHAR(300),
    driver_phone VARCHAR(20),
    driver_phone_extra VARCHAR(20),
    driver_passport VARCHAR(200),
    driver_license VARCHAR(200),
    
    -- Данные автомобиля (копируются при назначении)
    vehicle_id INTEGER REFERENCES vehicles(id),
    vehicle_registration_number VARCHAR(100),
    vehicle_trailer_number VARCHAR(100),
    vehicle_brand VARCHAR(255),
    
    -- Метаданные
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Индексы для быстрого поиска
CREATE INDEX idx_contracts_contract_number ON contracts(contract_number);
CREATE INDEX idx_contracts_contract_date ON contracts(contract_date);
CREATE INDEX idx_contracts_customer_id ON contracts(customer_id);
CREATE INDEX idx_contracts_carrier_id ON contracts(carrier_id);
CREATE INDEX idx_contracts_driver_id ON contracts(driver_id);
CREATE INDEX idx_contracts_vehicle_id ON contracts(vehicle_id);

-- Комментарии к таблице и полям
COMMENT ON TABLE contracts IS 'Договоры-заявки на перевозку';
COMMENT ON COLUMN contracts.loading_addresses IS 'Массив адресов погрузки в формате JSON';
COMMENT ON COLUMN contracts.unloading_addresses IS 'Массив адресов разгрузки в формате JSON';
COMMENT ON COLUMN contracts.driver_full_name IS 'Копия ФИО водителя на момент создания договора';
COMMENT ON COLUMN contracts.vehicle_registration_number IS 'Копия номера ТС на момент создания договора';
