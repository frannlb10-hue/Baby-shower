-- Crear tabla de configuraciones de la aplicación
CREATE TABLE IF NOT EXISTS app_settings (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL DEFAULT 'Lista de Regalos',
  subtitle TEXT NOT NULL DEFAULT '¡Bienvenido al Baby Shower! Elige un regalo para reservar',
  welcome_message TEXT DEFAULT 'Gracias por acompañarnos en este momento especial',
  primary_color TEXT DEFAULT '#3b82f6',
  background_color TEXT DEFAULT '#f8fafc',
  show_prices BOOLEAN DEFAULT true,
  show_images BOOLEAN DEFAULT true,
  allow_reservations BOOLEAN DEFAULT true,
  require_guest_name BOOLEAN DEFAULT true,
  show_reserved_by BOOLEAN DEFAULT true,
  enable_notifications BOOLEAN DEFAULT true,
  admin_url TEXT DEFAULT '/admin',
  session_timeout INTEGER DEFAULT 24,
  enable_logging BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insertar configuración por defecto si no existe
INSERT INTO app_settings (
  title, 
  subtitle, 
  welcome_message,
  primary_color,
  background_color,
  show_prices,
  show_images,
  allow_reservations,
  require_guest_name,
  show_reserved_by,
  enable_notifications,
  admin_url,
  session_timeout,
  enable_logging
)
SELECT 
  'Lista de Regalos',
  '¡Bienvenido al Baby Shower! Elige un regalo para reservar',
  'Gracias por acompañarnos en este momento especial',
  '#3b82f6',
  '#f8fafc',
  true,
  true,
  true,
  true,
  true,
  true,
  '/admin',
  24,
  true
WHERE NOT EXISTS (SELECT 1 FROM app_settings);
