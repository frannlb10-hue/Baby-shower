import { createClient } from "@supabase/supabase-js"
import type { Gift } from "@/types/gift"
import { FALLBACK_GIFTS } from "@/lib/fallback-data"

// ============================================
// CLIENTE PÚBLICO (anon key) - Solo lectura
// ============================================
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ""
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""

// Cliente público con anon key (respeta RLS)
// Solo se crea si las variables de entorno están disponibles
export const supabasePublic = supabaseUrl && supabaseAnonKey
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: { persistSession: false },
    })
  : null

// ============================================
// CLIENTE ADMIN (service_role key) - Escritura
// ============================================
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ""

// Cliente admin con service_role key (bypasea RLS)
// IMPORTANTE: Solo usar en el servidor, nunca exponer al cliente
const supabaseAdmin = supabaseUrl && serviceRoleKey
  ? createClient(supabaseUrl, serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    })
  : null

// Variable para rastrear si la tabla existe
let tableExists = true

// ============================================
// FUNCIONES PÚBLICAS (usan anon key)
// ============================================

/**
 * Obtiene todos los regalos (público)
 */
export async function getAllGifts(): Promise<Gift[]> {
  try {
    if (!supabasePublic) {
      console.log("Variables de entorno no configuradas, usando datos de fallback")
      return FALLBACK_GIFTS
    }

    const { data, error } = await supabasePublic
      .from("gifts")
      .select("*")
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Error fetching gifts:", error.message)
      if (error.message.includes("does not exist")) {
        tableExists = false
      }
      return FALLBACK_GIFTS
    }

    tableExists = true
    return data.map(processGift)
  } catch (error) {
    console.error("Error en getAllGifts:", error)
    return FALLBACK_GIFTS
  }
}

/**
 * Obtiene un regalo por ID (público)
 */
export async function getGiftById(id: string): Promise<Gift | null> {
  try {
    if (!supabasePublic || !tableExists) {
      return FALLBACK_GIFTS.find((gift) => gift.id === id) || null
    }

    const { data, error } = await supabasePublic
      .from("gifts")
      .select("*")
      .eq("id", id)
      .single()

    if (error) {
      console.error("Error fetching gift:", error.message)
      return null
    }

    return processGift(data)
  } catch (error) {
    console.error("Error en getGiftById:", error)
    return null
  }
}

/**
 * Reserva un regalo (público - solo actualiza campos de reserva)
 */
export async function reserveGift(id: string, guestName: string): Promise<Gift> {
  if (!supabasePublic) {
    throw new Error("Supabase no está configurado")
  }

  try {
    // Primero verificamos si el regalo ya está reservado
    const { data: gift, error: fetchError } = await supabasePublic
      .from("gifts")
      .select("reserved")
      .eq("id", id)
      .single()

    if (fetchError) {
      throw new Error("Regalo no encontrado")
    }

    if (gift.reserved) {
      throw new Error("Este regalo ya está reservado")
    }

    // Actualizar solo los campos de reserva (permitido por RLS)
    const { data, error } = await supabasePublic
      .from("gifts")
      .update({
        reserved: true,
        reserved_by: guestName,
        reserved_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()

    if (error) {
      console.error("Error reserving gift:", error)
      throw new Error("Error al reservar el regalo")
    }

    return data[0]
  } catch (error) {
    console.error("Error en reserveGift:", error)
    if (error instanceof Error) throw error
    throw new Error("Error al reservar el regalo")
  }
}

// ============================================
// FUNCIONES DE ADMIN (usan service_role key)
// ============================================

/**
 * Verifica si el cliente admin está disponible
 */
function requireAdminClient() {
  if (!supabaseAdmin) {
    throw new Error(
      "SUPABASE_SERVICE_ROLE_KEY no está configurada. " +
      "Las operaciones de admin no están disponibles."
    )
  }
  return supabaseAdmin
}

/**
 * Crea un nuevo regalo (requiere admin)
 */
export async function createGift(
  gift: Omit<Gift, "id" | "created_at" | "updated_at" | "reserved">
): Promise<Gift> {
  const admin = requireAdminClient()

  const newGift = {
    ...gift,
    reserved: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }

  const { data, error } = await admin.from("gifts").insert([newGift]).select()

  if (error) {
    console.error("Error creating gift:", error)
    throw new Error(`Error al crear el regalo: ${error.message}`)
  }

  return data[0]
}

/**
 * Crea múltiples regalos (requiere admin)
 */
export async function createMultipleGifts(
  gifts: Omit<Gift, "id" | "created_at" | "updated_at" | "reserved">[]
): Promise<Gift[]> {
  const admin = requireAdminClient()

  const newGifts = gifts.map((gift) => ({
    ...gift,
    reserved: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }))

  const { data, error } = await admin.from("gifts").insert(newGifts).select()

  if (error) {
    console.error("Error creating multiple gifts:", error)
    throw new Error(`Error al crear los regalos: ${error.message}`)
  }

  return data
}

/**
 * Actualiza un regalo (requiere admin)
 */
export async function updateGift(id: string, updates: Partial<Gift>): Promise<Gift> {
  const admin = requireAdminClient()

  const updatedData: Record<string, unknown> = {
    updated_at: new Date().toISOString(),
  }

  // Solo incluir campos que se están actualizando
  if (updates.name !== undefined) updatedData.name = updates.name
  if (updates.description !== undefined) updatedData.description = updates.description
  if (updates.price !== undefined) updatedData.price = updates.price
  if (updates.external_link !== undefined) updatedData.external_link = updates.external_link
  if (updates.image_url !== undefined) updatedData.image_url = updates.image_url

  console.log("[updateGift] PATCH gifts id:", id)
  console.log("[updateGift] data to PATCH:", JSON.stringify(updatedData))
  console.log("[updateGift] using client: supabaseAdmin (service_role)")

  const { data, error } = await admin
    .from("gifts")
    .update(updatedData)
    .eq("id", id)
    .select()

  if (error) {
    console.error("[updateGift] Supabase error — full details:")
    console.error("  message:", error.message)
    console.error("  code:", (error as any).code)
    console.error("  details:", (error as any).details)
    console.error("  hint:", (error as any).hint)
    console.error("  full object:", JSON.stringify(error))
    throw new Error(`Error al actualizar el regalo: ${error.message}`)
  }

  console.log("[updateGift] PATCH result rows:", data?.length ?? 0)

  if (!data || data.length === 0) {
    console.warn("[updateGift] No rows returned — ID may not exist:", id)
    throw new Error("No se pudo actualizar el regalo")
  }

  return data[0]
}

/**
 * Elimina un regalo (requiere admin)
 */
export async function deleteGift(id: string): Promise<boolean> {
  const admin = requireAdminClient()

  const { error } = await admin.from("gifts").delete().eq("id", id)

  if (error) {
    console.error("Error deleting gift:", error)
    throw new Error("Error al eliminar el regalo")
  }

  return true
}

/**
 * Desreserva un regalo (requiere admin)
 */
export async function unreserveGift(id: string): Promise<Gift> {
  const admin = requireAdminClient()

  const { data, error } = await admin
    .from("gifts")
    .update({
      reserved: false,
      reserved_by: null,
      reserved_at: null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .select()

  if (error) {
    console.error("Error unreserving gift:", error)
    throw new Error("Error al desreservar el regalo")
  }

  return data[0]
}

// ============================================
// UTILIDADES
// ============================================

function processGift(data: Record<string, unknown>): Gift {
  return {
    id: (data.id as string) || "",
    name: (data.name as string) || "",
    description: (data.description as string) || null,
    price: (data.price as number) || null,
    external_link: (data.external_link as string) || null,
    image_url: (data.image_url as string) || null,
    reserved: (data.reserved as boolean) || false,
    reserved_by: (data.reserved_by as string) || null,
    reserved_at: (data.reserved_at as string) || null,
    created_at: (data.created_at as string) || new Date().toISOString(),
    updated_at: (data.updated_at as string) || new Date().toISOString(),
  }
}

// Exportar también el nombre antiguo para compatibilidad
export const supabaseServer = supabasePublic
