-- Добавляем простое поле is_admin в таблицу users
ALTER TABLE t_p22554550_multiport_transport_.users 
ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT FALSE;

-- Мигрируем существующих админов из user_roles (если есть)
UPDATE t_p22554550_multiport_transport_.users u
SET is_admin = TRUE
FROM t_p22554550_multiport_transport_.user_roles ur
JOIN t_p22554550_multiport_transport_.roles r ON ur.role_id = r.id
WHERE u.id = ur.user_id AND r.name = 'admin';