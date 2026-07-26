import { NextResponse } from "next/server"
import { requireAuth, verifyPassword, generatePasswordHash } from "@/lib/auth"
import { resolveAdminCredentials, saveAdminCredentials } from "@/lib/admin-credentials"

export async function POST(request: Request) {
  const authError = requireAuth(request)
  if (authError) return authError

  try {
    const { currentPassword, newPassword } = await request.json()

    if (!currentPassword || !newPassword) {
      return NextResponse.json(
        { error: "La contraseña actual y la nueva son requeridas" },
        { status: 400 },
      )
    }

    if (String(newPassword).length < 8) {
      return NextResponse.json(
        { error: "La nueva contraseña debe tener al menos 8 caracteres" },
        { status: 400 },
      )
    }

    const current = await resolveAdminCredentials()
    if (!current) {
      return NextResponse.json(
        { error: "No hay credenciales de admin configuradas" },
        { status: 500 },
      )
    }

    const isValid = verifyPassword(currentPassword, current.passwordHash, current.salt)
    if (!isValid) {
      // Simular tiempo de procesamiento para evitar timing attacks
      await new Promise((resolve) => setTimeout(resolve, 1000))
      return NextResponse.json({ error: "La contraseña actual es incorrecta" }, { status: 401 })
    }

    const { hash, salt } = generatePasswordHash(String(newPassword))

    await saveAdminCredentials({
      username: current.username,
      passwordHash: hash,
      salt,
    })

    return NextResponse.json({ success: true, message: "Contraseña actualizada correctamente" })
  } catch (error) {
    console.error("Error cambiando contraseña:", error)
    return NextResponse.json(
      { error: "Error al cambiar la contraseña", message: error instanceof Error ? error.message : "Error desconocido" },
      { status: 500 },
    )
  }
}
