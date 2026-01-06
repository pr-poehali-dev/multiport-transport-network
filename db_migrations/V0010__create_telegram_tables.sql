CREATE TABLE IF NOT EXISTS telegram_settings (
    id SERIAL PRIMARY KEY,
    event_type VARCHAR(50) NOT NULL,
    notification_text TEXT,
    is_enabled BOOLEAN DEFAULT TRUE,
    role_ids INTEGER[],
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(event_type)
);

CREATE TABLE IF NOT EXISTS invite_links (
    id SERIAL PRIMARY KEY,
    code VARCHAR(100) UNIQUE NOT NULL,
    created_by INTEGER REFERENCES users(id),
    expires_at TIMESTAMP,
    max_uses INTEGER DEFAULT 1,
    current_uses INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS telegram_users (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    telegram_id BIGINT UNIQUE NOT NULL,
    telegram_username VARCHAR(255),
    invite_code VARCHAR(100) REFERENCES invite_links(code),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO telegram_settings (event_type, notification_text, role_ids) VALUES
('order_created', 'Создан новый заказ #{order_id}', ARRAY[1]),
('order_assigned', 'Заказ #{order_id} назначен на маршрут', ARRAY[1]),
('order_completed', 'Заказ #{order_id} завершён', ARRAY[1])
ON CONFLICT (event_type) DO NOTHING;

CREATE INDEX idx_telegram_users_telegram_id ON telegram_users(telegram_id);
CREATE INDEX idx_invite_links_code ON invite_links(code);