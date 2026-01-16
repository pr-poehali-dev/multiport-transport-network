-- Добавляем поля telegram_id и invite_code прямо в users
ALTER TABLE t_p22554550_multiport_transport_.users 
ADD COLUMN telegram_id BIGINT NULL UNIQUE,
ADD COLUMN invite_code VARCHAR(100) NULL UNIQUE,
ADD COLUMN invite_created_at TIMESTAMP NULL,
ADD COLUMN invite_used_at TIMESTAMP NULL;

-- Переносим данные из user_telegram_links в users
UPDATE t_p22554550_multiport_transport_.users u
SET telegram_id = utl.telegram_id
FROM t_p22554550_multiport_transport_.user_telegram_links utl
WHERE u.id = utl.user_id;

-- Переносим данные из invite_links в users
UPDATE t_p22554550_multiport_transport_.users u
SET 
  invite_code = il.code,
  invite_created_at = il.created_at,
  invite_used_at = CASE WHEN il.current_uses > 0 THEN il.created_at ELSE NULL END
FROM t_p22554550_multiport_transport_.invite_links il
WHERE u.id = il.created_by;