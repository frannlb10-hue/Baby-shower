import { NextResponse } from "next/server"
import { requireAuth } from "@/lib/auth"
import { updateGift, deleteGift } from "@/lib/supabase"

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  console.log("[PUT /api/gifts/:id] called for id:", params.id)

  const authError = requireAuth(request)
  if (authError) {
    console.warn("[PUT /api/gifts/:id] Auth failed — returning 401")
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

  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    console.error("[PUT /api/gifts/:id] SUPABASE_SERVICE_ROLE_KEY no configurada")
    return NextResponse.json(
      { error: "Configuración incompleta", message: "SUPABASE_SERVICE_ROLE_KEY no configurada" },
      { status: 500 }
    )
  }

  const payload = {
    name: String(name).trim(),
    description: description ? String(description).trim() || null : null,
    price: price ? parseFloat(String(price)) : null,
    external_link: external_link ? String(external_link).trim() || null : null,
    image_url: image_url ? String(image_url).trim() || null : null,
  }

  console.log("[PUT /api/gifts/:id] --- PRE-PATCH ---")
  console.log("[PUT /api/gifts/:id] gift id:", params.id)
  console.log("[PUT /api/gifts/:id] payload:", JSON.stringify(payload))
  console.log("[PUT /api/gifts/:id] client: supabaseAdmin (SUPABASE_SERVICE_ROLE_KEY)")
  console.log("[PUT /api/gifts/:id] SERVICE_ROLE_KEY present:", !!process.env.SUPABASE_SERVICE_ROLE_KEY)
  console.log("[PUT /api/gifts/:id] SUPABASE_URL present:", !!process.env.NEXT_PUBLIC_SUPABASE_URL)

  try {
    // updateGift usa supabaseAdmin (service_role) — no depende de RLS ni anon key
    const updated = await updateGift(params.id, payload)

    console.log("[PUT /api/gifts/:id] Updated successfully:", updated.name)
    return NextResponse.json(updated)
  } catch (error) {
    console.error("[PUT /api/gifts/:id] Supabase error:", error)
    const message = error instanceof Error ? error.message : "Error desconocido"
    const status = message.includes("No se pudo actualizar") ? 404 : 500
    return NextResponse.json({ error: "Error al actualizar", message }, { status })
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  console.log("[DELETE /api/gifts/:id] called for id:", params.id)

  const authError = requireAuth(request)
  if (authError) {
    console.warn("[DELETE /api/gifts/:id] Auth failed — returning 401")
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
    // deleteGift usa supabaseAdmin (service_role) — no depende de RLS ni anon key
    await deleteGift(params.id)
    console.log("[DELETE /api/gifts/:id] Deleted id:", params.id)
    return NextResponse.json({ success: true, message: "Regalo eliminado correctamente" })
  } catch (error) {
    console.error("[DELETE /api/gifts/:id] Supabase error:", error)
    return NextResponse.json(
      { error: "Error al eliminar", message: error instanceof Error ? error.message : "Error desconocido" },
      { status: 500 }
    )
  }
}
