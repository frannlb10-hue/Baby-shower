import { createClient } from "@supabase/supabase-js"

export interface AdminCredentials {
  username: string
  passwordHash: string
  salt: string
}

function getAdminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !serviceRoleKey) return null

  return createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  })
}

// Credenciales guardadas en Supabase (tabla admin_credentials), si existen.
export async function getStoredAdminCredentials(): Promise<AdminCredentials | null> {
  const admin = getAdminClient()
  if (!admin) return null

  const { data, error } = await admin
    .from("admin_credentials")
    .select("username, password_hash, salt")
    .order("created_at", { ascending: false })
    .limit(1)
    .single()

  if (error || !data) return null

  return {
    username: data.username,
    passwordHash: data.password_hash,
    salt: data.salt,
  }
}

// Credenciales resueltas: prioriza la tabla admin_credentials, cae a las env vars
// ADMIN_USERNAME/ADMIN_PASSWORD_HASH/ADMIN_SALT si todavía no se cambió la contraseña nunca.
export async function resolveAdminCredentials(): Promise<AdminCredentials | null> {
  const stored = await getStoredAdminCredentials()
  if (stored) return stored

  const username = process.env.ADMIN_USERNAME || "admin"
  const passwordHash = process.env.ADMIN_PASSWORD_HASH || ""
  const salt = process.env.ADMIN_SALT || ""

  if (!passwordHash || !salt) return null

  return { username, passwordHash, salt }
}

export async function saveAdminCredentials(creds: AdminCredentials): Promise<void> {
  const admin = getAdminClient()
  if (!admin) {
    throw new Error("SUPABASE_SERVICE_ROLE_KEY no está configurada")
  }

  const { data: existing } = await admin
    .from("admin_credentials")
    .select("id")
    .order("created_at", { ascending: false })
    .limit(1)
    .single()

  const payload = {
    username: creds.username,
    password_hash: creds.passwordHash,
    salt: creds.salt,
    updated_at: new Date().toISOString(),
  }

  if (existing) {
    const { error } = await admin.from("admin_credentials").update(payload).eq("id", existing.id)
    if (error) throw error
  } else {
    const { error } = await admin
      .from("admin_credentials")
      .insert([{ ...payload, created_at: new Date().toISOString() }])
    if (error) throw error
  }
}
