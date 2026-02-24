-- Verificar si la columna image_url existe, si no, agregarla
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'gifts'
        AND column_name = 'image_url'
    ) THEN
        ALTER TABLE gifts ADD COLUMN image_url TEXT;
    END IF;
END $$;

-- Crear tabla de configuraciones si no existe
CREATE TABLE IF NOT EXISTS app_settings (
    id SERIAL PRIMARY KEY,
    title TEXT NOT NULL DEFAULT 'Lista de regalos',
    subtitle TEXT NOT NULL DEFAULT '¡Bienvenido al Baby Shower! Elige un regalo para reservar',
    background_image TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insertar configuración por defecto si no existe
INSERT INTO app_settings (title, subtitle)
SELECT 'Lista de regalos', '¡Bienvenido al Baby Shower! Elige un regalo para reservar'
WHERE NOT EXISTS (SELECT 1 FROM app_settings);

-- Mostrar mensaje de éxito
SELECT 'Tablas actualizadas correctamente' AS message;
