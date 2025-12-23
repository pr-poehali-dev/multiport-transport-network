-- Создание таблицы drivers для хранения данных водителей
CREATE TABLE IF NOT EXISTS drivers (
    id SERIAL PRIMARY KEY,
    
    -- Основная информация (обязательные поля)
    last_name VARCHAR(100) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    middle_name VARCHAR(100),
    phone VARCHAR(20) NOT NULL,
    phone_extra VARCHAR(20),
    
    -- Паспорт (опциональные поля)
    passport_series VARCHAR(10),
    passport_number VARCHAR(20),
    passport_date DATE,
    passport_issued TEXT,
    
    -- Водительское удостоверение (опциональные поля)
    license_series VARCHAR(10),
    license_number VARCHAR(20),
    license_date DATE,
    license_issued TEXT,
    
    -- Служебные поля
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Индексы для быстрого поиска
CREATE INDEX idx_drivers_last_name ON drivers(last_name);
CREATE INDEX idx_drivers_phone ON drivers(phone);
CREATE INDEX idx_drivers_created_at ON drivers(created_at DESC);