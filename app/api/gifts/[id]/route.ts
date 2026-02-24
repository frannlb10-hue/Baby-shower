import { NextResponse } from "next/server"
import { requireAuth } from "@/lib/auth"

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    console.log("PUT /api/gifts/[id] called for id:", params.id)

    // Verificar autenticación
    const authError = requireAuth(request)
    if (authError) return authError

    let body
    try {
      body = await request.json()
    } catch (parseError) {
      console.error("Error parsing request body:", parseError)
      return NextResponse.json(
        {
          error: "Datos inválidos",
          message: "El cuerpo de la solicitud no es JSON válido",
        },
        { status: 400 },
      )
    }

    const { name, description, price, external_link, image_url } = body
    const giftId = params.id

    console.log("Update data received:", {
      name,
      description,
      price,
      external_link,
      image_url: image_url ? `base64 data (${image_url.length} chars)` : null,
    })

    if (!name || !name.trim()) {
      return NextResponse.json(
        {
          error: "Datos requeridos",
          message: "El nombre del regalo es requerido",
        },
        { status: 400 },
      )
    }

    // Verificar variables de entorno
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!supabaseUrl || !supabaseKey) {
      console.warn("Variables de entorno de Supabase no configuradas, simulando actualización")

      // Simular actualización exitosa
      const updatedGift = {
        id: giftId,
        name: name.trim(),
        description: description?.trim() || null,
        price: price ? Number.parseFloat(price) : null,
        external_link: external_link?.trim() || null,
        image_url: image_url || null,
        reserved: false,
        reserved_by: null,
        reserved_at: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }

      console.log("Simulated update successful")
      return NextResponse.json(updatedGift)
    }

    try {
      const { getGiftById, updateGift } = await import("@/lib/supabase")

      // Verificar que el regalo existe
      const gift = await getGiftById(giftId)
      if (!gift) {
        return NextResponse.json(
          {
            error: "Regalo no encontrado",
            message: `No se encontró un regalo con ID: ${giftId}`,
          },
          { status: 404 },
        )
      }

      // Preparar datos de actualización
      const updateData = {
        name: name.trim(),
        description: description?.trim() || null,
        price: price ? Number.parseFloat(price) : null,
        external_link: external_link?.trim() || null,
        image_url: image_url || gift.image_url, // Mantener imagen existente si no hay nueva
      }

      console.log("Updating gift with data:", {
        ...updateData,
        image_url: updateData.image_url ? `base64 data (${updateData.image_url.length} chars)` : null,
      })

      const updatedGift = await updateGift(giftId, updateData)

      console.log("Updated gift successfully:", updatedGift.name)
      return NextResponse.json(updatedGift)
    } catch (supabaseError) {
      console.error("Error updating gift in Supabase:", supabaseError)
      return NextResponse.json(
        {
          error: "Error de base de datos",
          message: "Error al actualizar el regalo en la base de datos",
          details: supabaseError instanceof Error ? supabaseError.message : "Error desconocido",
        },
        { status: 500 },
      )
    }
  } catch (error) {
    console.error("Error in PUT /api/gifts/[id]:", error)
    return NextResponse.json(
      {
        error: "Error interno",
        message: "Error interno del servidor al actualizar el regalo",
        details: error instanceof Error ? error.message : "Error desconocido",
      },
      { status: 500 },
    )
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    console.log("DELETE /api/gifts/[id] called for id:", params.id)

    // Verificar autenticación
    const authError = requireAuth(request)
    if (authError) return authError

    const giftId = params.id

    // Verificar variables de entorno
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!supabaseUrl || !supabaseKey) {
      console.warn("Variables de entorno de Supabase no configuradas, simulando eliminación")
      return NextResponse.json({
        success: true,
        message: "Regalo eliminado correctamente (modo demostración)",
      })
    }

    try {
      const { getGiftById, deleteGift } = await import("@/lib/supabase")

      const gift = await getGiftById(giftId)
      if (!gift) {
        return NextResponse.json(
          {
            error: "Regalo no encontrado",
            message: `No se encontró un regalo con ID: ${giftId}`,
          },
          { status: 404 },
        )
      }

      await deleteGift(giftId)
      console.log("Deleted gift:", gift.name)

      return NextResponse.json({
        success: true,
        message: "Regalo eliminado correctamente",
      })
    } catch (supabaseError) {
      console.error("Error deleting gift in Supabase:", supabaseError)
      return NextResponse.json(
        {
          error: "Error de base de datos",
          message: "Error al eliminar el regalo de la base de datos",
          details: supabaseError instanceof Error ? supabaseError.message : "Error desconocido",
        },
        { status: 500 },
      )
    }
  } catch (error) {
    console.error("Error in DELETE /api/gifts/[id]:", error)
    return NextResponse.json(
      {
        error: "Error interno",
        message: "Error interno del servidor al eliminar el regalo",
        details: error instanceof Error ? error.message : "Error desconocido",
      },
      { status: 500 },
    )
  }
}
