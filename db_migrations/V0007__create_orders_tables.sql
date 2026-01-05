-- Таблица заказов (orders)
CREATE TABLE IF NOT EXISTS orders (
    id SERIAL PRIMARY KEY,
    prefix VARCHAR(10) NOT NULL,
    order_date DATE NOT NULL,
    route_number VARCHAR(50),
    invoice VARCHAR(100),
    trak VARCHAR(100),
    weight DECIMAL(10, 2),
    full_route TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Таблица грузополучателей в заказе (order_consignees)
CREATE TABLE IF NOT EXISTS order_consignees (
    id SERIAL PRIMARY KEY,
    order_id INTEGER NOT NULL REFERENCES orders(id),
    contractor_id INTEGER REFERENCES contractors(id),
    name VARCHAR(255) NOT NULL,
    note TEXT,
    position INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Таблица маршрутов (order_routes)
CREATE TABLE IF NOT EXISTS order_routes (
    id SERIAL PRIMARY KEY,
    order_id INTEGER NOT NULL REFERENCES orders(id),
    from_address VARCHAR(500) NOT NULL,
    to_address VARCHAR(500) NOT NULL,
    vehicle_id INTEGER REFERENCES vehicles(id),
    driver_name VARCHAR(255),
    loading_date DATE,
    position INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Таблица дополнительных остановок (route_stops)
CREATE TABLE IF NOT EXISTS route_stops (
    id SERIAL PRIMARY KEY,
    route_id INTEGER NOT NULL REFERENCES order_routes(id),
    stop_type VARCHAR(20) NOT NULL CHECK (stop_type IN ('loading', 'unloading', 'customs')),
    address VARCHAR(500) NOT NULL,
    note TEXT,
    position INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Индексы для производительности
CREATE INDEX IF NOT EXISTS idx_orders_date ON orders(order_date);
CREATE INDEX IF NOT EXISTS idx_orders_route_number ON orders(route_number);
CREATE INDEX IF NOT EXISTS idx_order_consignees_order_id ON order_consignees(order_id);
CREATE INDEX IF NOT EXISTS idx_order_routes_order_id ON order_routes(order_id);
CREATE INDEX IF NOT EXISTS idx_route_stops_route_id ON route_stops(route_id);

COMMENT ON TABLE orders IS 'Основная таблица заказов';
COMMENT ON TABLE order_consignees IS 'Грузополучатели по каждому заказу';
COMMENT ON TABLE order_routes IS 'Маршруты в рамках заказа';
COMMENT ON TABLE route_stops IS 'Дополнительные остановки в маршруте (погрузка, разгрузка, таможня)';