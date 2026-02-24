import { createClient } from "@supabase/supabase-js"

// Cliente de Supabase con service_role key
// IMPORTANTE: Este cliente SOLO debe usarse en el servidor (API routes)
// Tiene permisos totales y bypasea RLS

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ""
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ""

if (!serviceRoleKey) {
  console.warn(
    "[Supabase Admin] SUPABASE_SERVICE_ROLE_KEY no configurada. " +
    "Las operaciones de admin fallarán."
  )
}

// Cliente admin con service_role key (bypasea RLS)
export const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
})

/**
 * Verifica si el cliente admin está configurado correctamente
 */
export function isAdminClientConfigured(): boolean {
  return !!supabaseUrl && !!serviceRoleKey
}
