import { NextResponse } from "next/server"
import { hashPassword } from "@/lib/auth"

export async function POST(request: Request) {
  try {
    const { password } = await request.json()

    if (!password) {
      return NextResponse.json({ error: "Contraseña es requerida" }, { status: 400 })
    }

    // Obtener variables de entorno
    const adminUsername = process.env.ADMIN_USERNAME || ""
    const adminPasswordHash = process.env.ADMIN_PASSWORD_HASH || ""
    const adminSalt = process.env.ADMIN_SALT || ""

    // Generar hash con la contraseña proporcionada y el salt almacenado
    let generatedHash = ""
    let hashesMatch = false

    if (adminSalt) {
      const { hash } = hashPassword(password, adminSalt)
      generatedHash = hash
      hashesMatch = hash === adminPasswordHash
    }

    const debugInfo = {
      envVars: {
        hasUsername: !!adminUsername,
        hasPasswordHash: !!adminPasswordHash,
        hasSalt: !!adminSalt,
        username: adminUsername,
        saltLength: adminSalt.length,
        hashLength: adminPasswordHash.length,
      },
      generatedHash,
      storedHash: adminPasswordHash,
      hashesMatch,
      saltUsed: adminSalt,
    }

    return NextResponse.json({
      success: true,
      debug: debugInfo,
      message: "Debug completado",
    })
  } catch (error) {
    console.error("Error en debug:", error)
    return NextResponse.json(
      {
        error: "Error interno del servidor",
        details: error instanceof Error ? error.message : "Error desconocido",
      },
      { status: 500 },
    )
  }
}
