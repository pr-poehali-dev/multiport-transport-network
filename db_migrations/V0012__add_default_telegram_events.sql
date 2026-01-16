-- Добавляем базовые события для уведомлений
INSERT INTO telegram_settings (event_type, notification_text, is_enabled, role_ids) VALUES
('order_created', 'Новый заказ #{order_id} создан', true, ARRAY[1,2,3]),
('order_assigned', 'Заказ #{order_id} назначен на маршрут. Водитель: {driver_name}', true, ARRAY[1,2]),
('order_completed', 'Заказ #{order_id} завершён. Статус: {status}', true, ARRAY[1,2]),
('contract_created', 'Создан новый договор-заявка #{contract_id}', true, ARRAY[1,2]),
('driver_assigned', 'Водитель {driver_name} назначен на заказ #{order_id}', true, ARRAY[1,2]),
('delay_detected', '⚠️ Обнаружена задержка в заказе #{order_id}. Время задержки: {delay_time}', true, ARRAY[1,2])
ON CONFLICT (event_type) DO NOTHING;