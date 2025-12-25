CREATE TABLE IF NOT EXISTS t_p22554550_multiport_transport_.contractors (
  id SERIAL PRIMARY KEY,
  name VARCHAR(500) NOT NULL,
  inn VARCHAR(12) NOT NULL,
  kpp VARCHAR(9),
  ogrn VARCHAR(15),
  director VARCHAR(300),
  legal_address TEXT,
  actual_address TEXT,
  postal_address TEXT,
  is_seller BOOLEAN DEFAULT false,
  is_buyer BOOLEAN DEFAULT false,
  is_carrier BOOLEAN DEFAULT false,
  bank_accounts JSONB DEFAULT '[]'::jsonb,
  delivery_addresses JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_contractors_inn ON t_p22554550_multiport_transport_.contractors(inn);
CREATE INDEX IF NOT EXISTS idx_contractors_name ON t_p22554550_multiport_transport_.contractors(name);
