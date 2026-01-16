-- Создаём таблицу для связи пользователей и ролей
CREATE TABLE IF NOT EXISTS t_p22554550_multiport_transport_.user_roles (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES t_p22554550_multiport_transport_.users(id),
    role_id INTEGER NOT NULL REFERENCES t_p22554550_multiport_transport_.roles(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, role_id)
);