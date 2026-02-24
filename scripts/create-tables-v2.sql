-- Crear la tabla de regalos con nombres de columnas snake_case (estándar PostgreSQL)
CREATE TABLE IF NOT EXISTS gifts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10, 2),
  external_link TEXT,
  reserved BOOLEAN DEFAULT FALSE,
  reserved_by TEXT,
  reserved_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insertar algunos datos de ejemplo
INSERT INTO gifts (name, description, price, external_link, reserved, created_at, updated_at)
VALUES 
  ('Cuna de madera', 'Cuna convertible de madera natural con colchón incluido', 25000, 'https://example.com/cuna', false, NOW(), NOW()),
  ('Cochecito de bebé', 'Cochecito 3 en 1 con silla para auto', 45000, null, false, NOW(), NOW()),
  ('Ropa de bebé (0-6 meses)', 'Set de bodys, pijamas y conjuntos para recién nacido', 8000, null, false, NOW(), NOW()),
  ('Monitor de bebé', 'Monitor con video y audio para vigilar al bebé', 15000, null, false, NOW(), NOW()),
  ('Bañera para bebé', 'Bañera ergonómica con soporte antideslizante', 5000, null, false, NOW(), NOW());
