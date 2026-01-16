-- Создаём таблицу для связи users и telegram
CREATE TABLE IF NOT EXISTS user_telegram_links (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id),
    telegram_id BIGINT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id),
    UNIQUE(telegram_id)
);