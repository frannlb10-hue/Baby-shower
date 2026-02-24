import { NextResponse } from "next/server"
import { requireAuth } from "@/lib/auth"
import { getGiftById, updateGift, deleteGift } from "@/lib/supabase"

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

  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!serviceRoleKey) {
    console.error("[PUT /api/gifts/:id] SUPABASE_SERVICE_ROLE_KEY no configurada")
    return NextResponse.json(
      { error: "Configuración incompleta", message: "SUPABASE_SERVICE_ROLE_KEY no está configurada en el servidor" },
      { status: 500 }
    )
  }

  try {
    const existing = await getGiftById(params.id)
    if (!existing) {
      return NextResponse.json({ error: "Regalo no encontrado" }, { status: 404 })
    }

    const updated = await updateGift(params.id, {
      name: String(name).trim(),
      description: description ? String(description).trim() || null : null,
      price: price ? parseFloat(String(price)) : null,
      external_link: external_link ? String(external_link).trim() || null : null,
      image_url: image_url ? String(image_url).trim() || existing.image_url : existing.image_url,
    })

    console.log("[PUT /api/gifts/:id] Updated successfully:", updated.name)
    return NextResponse.json(updated)
  } catch (error) {
    console.error("[PUT /api/gifts/:id] Supabase error:", error)
    return NextResponse.json(
      { error: "Error de base de datos", message: error instanceof Error ? error.message : "Error desconocido" },
      { status: 500 }
    )
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  console.log("[DELETE /api/gifts/:id] called for id:", params.id)

  const authError = requireAuth(request)
  if (authError) {
    console.warn("[DELETE /api/gifts/:id] Auth failed — returning 401")
    return authError
  }

  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!serviceRoleKey) {
    console.error("[DELETE /api/gifts/:id] SUPABASE_SERVICE_ROLE_KEY no configurada")
    return NextResponse.json(
      { error: "Configuración incompleta", message: "SUPABASE_SERVICE_ROLE_KEY no está configurada en el servidor" },
      { status: 500 }
    )
  }

  try {
    const existing = await getGiftById(params.id)
    if (!existing) {
      return NextResponse.json({ error: "Regalo no encontrado" }, { status: 404 })
    }

    await deleteGift(params.id)
    console.log("[DELETE /api/gifts/:id] Deleted:", existing.name)
    return NextResponse.json({ success: true, message: "Regalo eliminado correctamente" })
  } catch (error) {
    console.error("[DELETE /api/gifts/:id] Supabase error:", error)
    return NextResponse.json(
      { error: "Error de base de datos", message: error instanceof Error ? error.message : "Error desconocido" },
      { status: 500 }
    )
  }
}
