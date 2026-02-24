import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    console.log("POST /api/gifts/reserve called")
    const body = await request.json()
    const { giftId, guestName } = body

    console.log("Reserving gift:", giftId, "for:", guestName)

    if (!guestName || !guestName.trim()) {
      return NextResponse.json({ message: "El nombre del invitado es requerido" }, { status: 400 })
    }

    // Verificar variables de entorno
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!supabaseUrl || !supabaseKey) {
      console.warn("Variables de entorno de Supabase no configuradas, simulando reserva")
      return NextResponse.json({ message: "Regalo reservado exitosamente (modo demostración)" })
    }

    try {
      const { reserveGift } = await import("@/lib/supabase")
      await reserveGift(giftId, guestName.trim())
      console.log("Successfully reserved gift for:", guestName)
      return NextResponse.json({ message: "Regalo reservado exitosamente" })
    } catch (error) {
      if (error instanceof Error) {
        return NextResponse.json({ message: error.message }, { status: 400 })
      }
      throw error
    }
  } catch (error) {
    console.error("Error in POST /api/gifts/reserve:", error)
    return NextResponse.json({ message: "Error al reservar el regalo" }, { status: 500 })
  }
}
