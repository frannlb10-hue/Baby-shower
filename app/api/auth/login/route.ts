import { NextResponse } from "next/server"
import { verifyPassword, generateSessionToken } from "@/lib/auth"
import { createSession } from "@/lib/session-store"

export async function POST(request: Request) {
  try {
    const { username, password } = await request.json()

    // Obtener credenciales de las variables de entorno
    const adminUsername = process.env.ADMIN_USERNAME || "admin"
    const adminPasswordHash = process.env.ADMIN_PASSWORD_HASH || ""
    const adminSalt = process.env.ADMIN_SALT || ""

    console.log("Login attempt:", { username, hasPassword: !!password })

    // Verificar credenciales
    if (username !== adminUsername) {
      // Simular tiempo de procesamiento para evitar timing attacks
      await new Promise((resolve) => setTimeout(resolve, 1000))
      return NextResponse.json({ error: "Credenciales inválidas" }, { status: 401 })
    }

    if (!adminPasswordHash || !adminSalt) {
      console.log("Missing environment variables")
      return NextResponse.json({ error: "Configuración de autenticación incompleta" }, { status: 500 })
    }

    const isValidPassword = verifyPassword(password, adminPasswordHash, adminSalt)

    if (!isValidPassword) {
      // Simular tiempo de procesamiento para evitar timing attacks
      await new Promise((resolve) => setTimeout(resolve, 1000))
      return NextResponse.json({ error: "Credenciales inválidas" }, { status: 401 })
    }

    // Generar token de sesión y guardarlo en el almacén
    const sessionToken = generateSessionToken()
    createSession(sessionToken)

    // Crear respuesta con cookie de sesión
    const response = NextResponse.json({
      success: true,
      message: "Login exitoso",
      token: sessionToken,
    })

    // Establecer cookie de sesión
    response.cookies.set("admin-session", sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 60 * 60 * 24, // 24 horas
      path: "/",
    })

    return response
  } catch (error) {
    console.error("Error en login:", error)
    return NextResponse.json(
      {
        error: "Error interno del servidor",
        details: error instanceof Error ? error.message : "Error desconocido",
      },
      { status: 500 },
    )
  }
}
