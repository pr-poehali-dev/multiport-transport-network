CREATE TABLE IF NOT EXISTS vehicles (
    id SERIAL PRIMARY KEY,
    brand VARCHAR(255) NOT NULL,
    registration_number VARCHAR(100) NOT NULL,
    capacity DECIMAL(10, 2),
    trailer_number VARCHAR(100),
    trailer_type VARCHAR(255),
    company_id INTEGER,
    driver_id INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_vehicles_driver_id ON vehicles(driver_id);
CREATE INDEX IF NOT EXISTS idx_vehicles_company_id ON vehicles(company_id);