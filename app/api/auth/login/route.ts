import { NextResponse } from "next/server"
import { verifyPassword, generateSessionToken } from "@/lib/auth"
import { createSession } from "@/lib/session-store"
import { resolveAdminCredentials } from "@/lib/admin-credentials"

export async function POST(request: Request) {
  try {
    const { username, password } = await request.json()

    const adminCredentials = await resolveAdminCredentials()

    console.log("Login attempt:", { username, hasPassword: !!password })

    if (!adminCredentials) {
      console.log("Missing admin credentials (neither admin_credentials table nor env vars)")
      return NextResponse.json({ error: "Configuración de autenticación incompleta" }, { status: 500 })
    }

    // Verificar credenciales
    if (username !== adminCredentials.username) {
      // Simular tiempo de procesamiento para evitar timing attacks
      await new Promise((resolve) => setTimeout(resolve, 1000))
      return NextResponse.json({ error: "Credenciales inválidas" }, { status: 401 })
    }

    const isValidPassword = verifyPassword(password, adminCredentials.passwordHash, adminCredentials.salt)

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
