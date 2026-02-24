import { NextResponse } from "next/server"
import { requireAuth } from "@/lib/auth"
import { getAllGifts, createGift } from "@/lib/supabase"

export async function GET() {
  console.log("[GET /api/gifts] called")
  try {
    const gifts = await getAllGifts()
    console.log(`[GET /api/gifts] returning ${gifts.length} gifts`)
    return NextResponse.json(gifts)
  } catch (error) {
    console.error("[GET /api/gifts] error:", error)
    return NextResponse.json(
      { error: "Error al obtener los regalos" },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  console.log("[POST /api/gifts] called")
  try {
    const authError = requireAuth(request)
    if (authError) {
      console.warn("[POST /api/gifts] Auth failed — returning 401")
      return authError
    }

    const body = await request.json()
    const { name, description, price, external_link, image_url } = body

    if (!name || !name.trim()) {
      return NextResponse.json(
        { error: "El nombre del regalo es requerido" },
        { status: 400 }
      )
    }

    const newGift = await createGift({
      name: name.trim(),
      description: description?.trim() || null,
      price: price ? Number.parseFloat(price) : null,
      external_link: external_link?.trim() || null,
      image_url: image_url || null,
    })

    console.log("[POST /api/gifts] Created:", newGift.name)
    return NextResponse.json(newGift, { status: 201 })
  } catch (error) {
    console.error("[POST /api/gifts] error:", error)
    return NextResponse.json(
      { error: "Error al crear el regalo", message: error instanceof Error ? error.message : "Error desconocido" },
      { status: 500 }
    )
  }
}
