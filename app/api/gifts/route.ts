import { NextResponse } from "next/server"
import { requireAuth } from "@/lib/auth"
import { getAllGifts, createGift } from "@/lib/supabase"

export async function GET() {
  try {
    const gifts = await getAllGifts()
    return NextResponse.json(gifts)
  } catch (error) {
    console.error("Error fetching gifts:", error)
    return NextResponse.json(
      { error: "Error al obtener los regalos" },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const authError = requireAuth(request)
    if (authError) return authError

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

    return NextResponse.json(newGift, { status: 201 })
  } catch (error) {
    console.error("Error creating gift:", error)
    return NextResponse.json(
      { error: "Error al crear el regalo" },
      { status: 500 }
    )
  }
}
