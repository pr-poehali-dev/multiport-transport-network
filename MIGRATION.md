# 🚀 Инструкция по миграции на другой хостинг

## Текущая архитектура
- **Frontend**: React + Vite (статические файлы)
- **Backend**: Cloud Functions на poehali.dev
- **Database**: PostgreSQL на poehali.dev

## Миграция на jino.ru или другой хостинг

### Шаг 1: Перенос базы данных
1. Экспортировать данные из PostgreSQL:
   ```bash
   pg_dump -h old_host -U username dbname > backup.sql
   ```
2. Импортировать на новый хостинг:
   ```bash
   psql -h new_host -U username new_dbname < backup.sql
   ```

### Шаг 2: Перенос backend функций
Скопировать файлы из `/backend/drivers/index.py` на новый сервер.

**Для jino.ru (PHP хостинг):**
Создать `api/drivers.php`:
```php
<?php
header('Access-Control-Allow-Origin: *');
header('Content-Type: application/json');

$dsn = "pgsql:host=localhost;dbname=your_db";
$pdo = new PDO($dsn, 'username', 'password');

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $data = json_decode(file_get_contents('php://input'), true);
    
    $stmt = $pdo->prepare("INSERT INTO drivers (last_name, first_name, phone) VALUES (?, ?, ?)");
    $stmt->execute([$data['lastName'], $data['firstName'], $data['phone']]);
    
    echo json_encode(['id' => $pdo->lastInsertId(), 'message' => 'Успешно']);
}
?>
```

### Шаг 3: Обновить API конфигурацию
Открыть `src/api/config.ts` и изменить:

```typescript
export const API_CONFIG = {
  BASE_URL: 'https://your-domain.jino.ru/api',  // Новый URL
  
  ENDPOINTS: {
    drivers: `${BASE_URL}/drivers.php`,  // Или /drivers если используешь Python
  }
};
```

### Шаг 4: Собрать frontend
```bash
npm run build
# или
bun run build
```

### Шаг 5: Загрузить на хостинг
Загрузить содержимое папки `dist/` на jino.ru через FTP/SFTP.

---

## Что НЕ нужно менять
- ✅ Весь код в `src/pages/` - без изменений
- ✅ Компоненты - без изменений
- ✅ Логика приложения - без изменений

## Что нужно изменить
- ⚠️ Только `src/api/config.ts` - URL к новому API
- ⚠️ Backend функции - перенести на новый сервер
- ⚠️ DATABASE_URL - обновить строку подключения к новой БД

---

**Итого:** Изменения в 1 файле (`config.ts`) + перенос backend + миграция БД = готово! 🎉
