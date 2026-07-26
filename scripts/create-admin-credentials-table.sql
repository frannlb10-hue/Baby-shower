-- Tabla para credenciales de admin editables desde la app.
-- Reemplaza gradualmente a las env vars ADMIN_USERNAME/ADMIN_PASSWORD_HASH/ADMIN_SALT:
-- si esta tabla está vacía, la app sigue usando esas env vars como fallback.
CREATE TABLE IF NOT EXISTS admin_credentials (
  id SERIAL PRIMARY KEY,
  username TEXT NOT NULL,
  password_hash TEXT NOT NULL,
  salt TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS: esta tabla solo debe ser accesible con la service_role key (nunca desde el cliente/anon key).
ALTER TABLE admin_credentials ENABLE ROW LEVEL SECURITY;
