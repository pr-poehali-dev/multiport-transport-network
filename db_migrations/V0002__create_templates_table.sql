-- Создание таблицы templates для хранения настроек PDF шаблонов
CREATE TABLE IF NOT EXISTS templates (
    id SERIAL PRIMARY KEY,
    
    -- Основная информация
    name VARCHAR(255) NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    file_url TEXT,
    
    -- Настройки полей (JSON с маппингами)
    field_mappings JSONB NOT NULL DEFAULT '[]'::jsonb,
    
    -- Служебные поля
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Индексы для быстрого поиска
CREATE INDEX idx_templates_name ON templates(name);
CREATE INDEX idx_templates_created_at ON templates(created_at DESC);
CREATE INDEX idx_templates_field_mappings ON templates USING gin(field_mappings);
