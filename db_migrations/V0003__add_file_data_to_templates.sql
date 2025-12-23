-- Добавление колонки для хранения бинарных данных PDF файлов
ALTER TABLE templates ADD COLUMN file_data BYTEA;

-- Комментарий для документации
COMMENT ON COLUMN templates.file_data IS 'Бинарные данные PDF файла (загружается как base64, хранится как bytea)';