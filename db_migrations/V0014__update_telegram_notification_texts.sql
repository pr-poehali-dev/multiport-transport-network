-- Обновление текстов уведомлений для более информативных сообщений
UPDATE telegram_settings 
SET notification_text = 'Заказ {order_id} добавлен в работу. Маршрут: {route_from} → {route_to}. Водитель: {driver_name}' 
WHERE event_type = 'order_assigned';
