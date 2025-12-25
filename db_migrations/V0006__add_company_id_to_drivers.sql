-- Добавляем company_id в таблицу drivers для связи водителя с фирмой ТК
ALTER TABLE drivers ADD COLUMN company_id INTEGER;