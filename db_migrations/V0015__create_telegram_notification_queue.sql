-- Создаем таблицу очереди уведомлений
CREATE TABLE IF NOT EXISTS telegram_notification_queue (
    id SERIAL PRIMARY KEY,
    event_type VARCHAR(100) NOT NULL,
    variables JSONB NOT NULL,
    status VARCHAR(20) DEFAULT 'pending',
    attempts INTEGER DEFAULT 0,
    last_error TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    sent_at TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_queue_status ON telegram_notification_queue(status, created_at);
