-- Таблица ролей
CREATE TABLE IF NOT EXISTS roles (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  display_name VARCHAR(255) NOT NULL,
  description TEXT,
  is_system BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Таблица прав доступа для ролей
CREATE TABLE IF NOT EXISTS role_permissions (
  id SERIAL PRIMARY KEY,
  role_id INTEGER NOT NULL REFERENCES roles(id),
  resource VARCHAR(100) NOT NULL,
  can_create BOOLEAN DEFAULT FALSE,
  can_read BOOLEAN DEFAULT FALSE,
  can_update BOOLEAN DEFAULT FALSE,
  can_remove BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(role_id, resource)
);

-- Связь пользователей с ролями
CREATE TABLE IF NOT EXISTS user_roles (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL,
  role_id INTEGER NOT NULL REFERENCES roles(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, role_id)
);

-- Создаем системную роль Администратор с полными правами
INSERT INTO roles (name, display_name, description, is_system) 
VALUES ('admin', 'Администратор', 'Полный доступ ко всем функциям системы', TRUE)
ON CONFLICT (name) DO NOTHING;

-- Даем администратору все права на все ресурсы
INSERT INTO role_permissions (role_id, resource, can_create, can_read, can_update, can_remove)
SELECT 
  r.id,
  resource,
  TRUE,
  TRUE,
  TRUE,
  TRUE
FROM roles r
CROSS JOIN (
  VALUES 
    ('contracts'),
    ('contractors'),
    ('drivers'),
    ('vehicles'),
    ('roles'),
    ('users')
) AS resources(resource)
WHERE r.name = 'admin'
ON CONFLICT (role_id, resource) DO NOTHING;

-- Создаем индексы для быстрого поиска
CREATE INDEX IF NOT EXISTS idx_role_permissions_role_id ON role_permissions(role_id);
CREATE INDEX IF NOT EXISTS idx_role_permissions_resource ON role_permissions(resource);
CREATE INDEX IF NOT EXISTS idx_user_roles_user_id ON user_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_role_id ON user_roles(role_id);