import { NextResponse } from "next/server"
import { invalidateSession } from "@/lib/session-store"

export async function POST(request: Request) {
  try {
    // Obtener el token del header o cookie
    const authHeader = request.headers.get("authorization")
    const cookieHeader = request.headers.get("cookie")

    let token: string | null = null

    if (authHeader && authHeader.startsWith("Bearer ")) {
      token = authHeader.substring(7)
    } else if (cookieHeader) {
      const cookies = cookieHeader.split(";")
      for (const cookie of cookies) {
        const [name, value] = cookie.trim().split("=")
        if (name === "admin-session") {
          token = decodeURIComponent(value)
          break
        }
      }
    }

    // Invalidar el token en el almacén de sesiones
    if (token) {
      invalidateSession(token)
    }

    // Crear respuesta y limpiar la cookie
    const response = NextResponse.json({
      success: true,
      message: "Sesión cerrada exitosamente",
    })

    // Eliminar la cookie de sesión
    response.cookies.set("admin-session", "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 0, // Expira inmediatamente
      path: "/",
    })

    return response
  } catch (error) {
    console.error("Error en logout:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
