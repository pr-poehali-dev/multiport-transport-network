CREATE TABLE IF NOT EXISTS telegram_config (
    id SERIAL PRIMARY KEY,
    bot_token VARCHAR(255),
    bot_username VARCHAR(100),
    admin_telegram_id BIGINT,
    is_connected BOOLEAN DEFAULT FALSE,
    last_check TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO telegram_config (id) VALUES (1) ON CONFLICT (id) DO NOTHING;