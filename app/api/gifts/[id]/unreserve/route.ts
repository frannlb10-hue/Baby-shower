import { NextResponse } from "next/server"
import { requireAuth } from "@/lib/auth"

export async function POST(request: Request, { params }: { params: { id: string } }) {
  try {
    console.log("POST /api/gifts/[id]/unreserve called for id:", params.id)

    // Verificar autenticación
    const authError = requireAuth(request)
    if (authError) return authError

    const giftId = params.id

    // Verificar variables de entorno
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!supabaseUrl || !supabaseKey) {
      console.warn("Variables de entorno de Supabase no configuradas, simulando desreserva")
      return NextResponse.json({ message: "Regalo desreservado exitosamente (modo demostración)" })
    }

    try {
      const { unreserveGift } = await import("@/lib/supabase")
      await unreserveGift(giftId)
      console.log("Successfully unreserved gift:", giftId)
      return NextResponse.json({ message: "Regalo desreservado exitosamente" })
    } catch (error) {
      if (error instanceof Error) {
        return NextResponse.json({ message: error.message }, { status: 400 })
      }
      throw error
    }
  } catch (error) {
    console.error("Error in POST /api/gifts/[id]/unreserve:", error)
    return NextResponse.json({ message: "Error al desreservar el regalo" }, { status: 500 })
  }
}
