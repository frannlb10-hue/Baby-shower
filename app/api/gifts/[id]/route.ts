import { NextResponse } from "next/server"
import { requireAuth } from "@/lib/auth"
import { createClient } from "@supabase/supabase-js"
import { deleteGift } from "@/lib/supabase"

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  console.log("[PUT /api/gifts/:id] called, id:", params.id)

  const authError = requireAuth(request)
  if (authError) {
    console.warn("[PUT /api/gifts/:id] auth failed — 401")
    return authError
  }

  let body: Record<string, unknown>
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: "Cuerpo de solicitud inválido" }, { status: 400 })
  }

  const { name, description, price, external_link, image_url } = body as Record<string, string>

  if (!name || !String(name).trim()) {
    return NextResponse.json({ error: "El nombre del regalo es requerido" }, { status: 400 })
  }

  // Verificar variables de entorno con detalle
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  console.log("[PUT /api/gifts/:id] NEXT_PUBLIC_SUPABASE_URL present:", !!supabaseUrl)
  console.log("[PUT /api/gifts/:id] SUPABASE_SERVICE_ROLE_KEY present:", !!serviceRoleKey)
  if (serviceRoleKey) {
    console.log("[PUT /api/gifts/:id] SUPABASE_SERVICE_ROLE_KEY first 10 chars:", serviceRoleKey.slice(0, 10))
  }

  if (!supabaseUrl || !serviceRoleKey) {
    console.error("[PUT /api/gifts/:id] missing env vars — cannot proceed")
    return NextResponse.json(
      { error: "Configuración incompleta", message: "NEXT_PUBLIC_SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY no configuradas" },
      { status: 500 }
    )
  }

  // Crear cliente admin directamente con service_role key
  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  })

  const updatePayload = {
    name: String(name).trim(),
    description: description ? String(description).trim() || null : null,
    price: price ? parseFloat(String(price)) : null,
    external_link: external_link ? String(external_link).trim() || null : null,
    image_url: image_url ? String(image_url).trim() || null : null,
    updated_at: new Date().toISOString(),
  }

  console.log("[PUT /api/gifts/:id] update payload:", JSON.stringify(updatePayload))

  const { data, error } = await supabase
    .from("gifts")
    .update(updatePayload)
    .eq("id", params.id)
    .select()

  console.log("Supabase response data:", JSON.stringify(data))
  console.log("Supabase response error:", JSON.stringify(error))

  if (error) {
    return NextResponse.json(
      { error: "Error de Supabase", message: error.message, code: (error as any).code, details: (error as any).details, hint: (error as any).hint },
      { status: 500 }
    )
  }

  if (!data || data.length === 0) {
    console.warn("[PUT /api/gifts/:id] no rows updated — id not found:", params.id)
    return NextResponse.json({ error: "Regalo no encontrado", message: `No existe un regalo con id: ${params.id}` }, { status: 404 })
  }

  console.log("[PUT /api/gifts/:id] success, updated:", data[0].name)
  return NextResponse.json(data[0])
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  console.log("[DELETE /api/gifts/:id] called, id:", params.id)

  const authError = requireAuth(request)
  if (authError) {
    console.warn("[DELETE /api/gifts/:id] auth failed — 401")
    return authError
  }

  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    console.error("[DELETE /api/gifts/:id] SUPABASE_SERVICE_ROLE_KEY no configurada")
    return NextResponse.json(
      { error: "Configuración incompleta", message: "SUPABASE_SERVICE_ROLE_KEY no configurada" },
      { status: 500 }
    )
  }

  try {
    await deleteGift(params.id)
    console.log("[DELETE /api/gifts/:id] deleted id:", params.id)
    return NextResponse.json({ success: true, message: "Regalo eliminado correctamente" })
  } catch (error) {
    console.error("[DELETE /api/gifts/:id] error:", error)
    return NextResponse.json(
      { error: "Error al eliminar", message: error instanceof Error ? error.message : "Error desconocido" },
      { status: 500 }
    )
  }
}
