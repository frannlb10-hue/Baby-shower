import { NextResponse } from "next/server"
import { generatePasswordHash } from "@/lib/auth"
import crypto from "crypto"

export async function POST(request: Request) {
  try {
    const { password } = await request.json()

    if (!password) {
      return NextResponse.json({ error: "Contraseña es requerida" }, { status: 400 })
    }

    // Generar nuevo hash y salt
    const { hash, salt } = generatePasswordHash(password)
    const sessionSecret = crypto.randomBytes(32).toString("hex")

    return NextResponse.json({
      success: true,
      credentials: {
        username: "admin",
        passwordHash: hash,
        salt: salt,
        sessionSecret: sessionSecret,
      },
      envVars: [
        `ADMIN_USERNAME=admin`,
        `ADMIN_PASSWORD_HASH=${hash}`,
        `ADMIN_SALT=${salt}`,
        `SESSION_SECRET=${sessionSecret}`,
      ],
      message: "Hash generado exitosamente",
    })
  } catch (error) {
    console.error("Error generando hash:", error)
    return NextResponse.json(
      {
        error: "Error interno del servidor",
        details: error instanceof Error ? error.message : "Error desconocido",
      },
      { status: 500 },
    )
  }
}
