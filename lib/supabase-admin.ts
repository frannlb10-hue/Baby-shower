import { createClient } from "@supabase/supabase-js"

// Cliente de Supabase con service_role key
// IMPORTANTE: Este cliente SOLO debe usarse en el servidor (API routes)
// Tiene permisos totales y bypasea RLS

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ""
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ""

if (!supabaseUrl || !serviceRoleKey) {
  console.warn(
    "[Supabase Admin] NEXT_PUBLIC_SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY no configuradas. " +
    "Las operaciones de admin no estarán disponibles."
  )
}

// Cliente admin con service_role key (bypasea RLS)
// Solo se crea si las variables de entorno están disponibles
export const supabaseAdmin = supabaseUrl && serviceRoleKey
  ? createClient(supabaseUrl, serviceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })
  : null

/**
 * Verifica si el cliente admin está configurado correctamente
 */
export function isAdminClientConfigured(): boolean {
  return !!supabaseUrl && !!serviceRoleKey
}
