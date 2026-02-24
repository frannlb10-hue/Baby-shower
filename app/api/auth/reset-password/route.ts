import { NextResponse } from "next/server"

const ADMIN_EMAIL = "jagcoccolo@gmail.com"

export async function POST(request: Request) {
  try {
    const { email } = await request.json()

    // Validar entrada
    if (!email) {
      return NextResponse.json({ error: "Email es requerido" }, { status: 400 })
    }

    // Verificar que sea el email del administrador
    if (email.toLowerCase() !== ADMIN_EMAIL.toLowerCase()) {
      return NextResponse.json({ error: "Email no autorizado para recuperación" }, { status: 403 })
    }

    // En una implementación real, aquí enviarías un email con un token de recuperación
    // Por ahora, simulamos el envío y devolvemos las credenciales por defecto

    console.log(`Password reset requested for: ${email}`)

    // Simular tiempo de procesamiento
    await new Promise((resolve) => setTimeout(resolve, 2000))

    return NextResponse.json({
      success: true,
      message: "Se han enviado las instrucciones de recuperación a tu email",
      // En desarrollo, mostramos las credenciales por defecto
      ...(process.env.NODE_ENV === "development" && {
        devInfo: {
          username: "admin",
          password: "hello",
          note: "Estas son las credenciales por defecto para desarrollo",
        },
      }),
    })
  } catch (error) {
    console.error("Error en reset password:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
