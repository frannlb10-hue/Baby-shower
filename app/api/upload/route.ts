import { type NextRequest, NextResponse } from "next/server"
import { requireAuth } from "@/lib/auth"

export async function POST(request: NextRequest) {
  // Verificar autenticación
  const authError = requireAuth(request)
  if (authError) return authError

  try {
    const formData = await request.formData()
    const file = formData.get("file") as File

    if (!file) {
      return NextResponse.json({ error: "No se encontró archivo" }, { status: 400 })
    }

    // Validar tipo de archivo
    if (!file.type.startsWith("image/")) {
      return NextResponse.json({ error: "El archivo debe ser una imagen" }, { status: 400 })
    }

    // Validar tamaño (máximo 5MB)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: "La imagen es demasiado grande (máximo 5MB)" }, { status: 400 })
    }

    // Convertir archivo a base64 para almacenamiento temporal
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    const base64 = buffer.toString("base64")
    const mimeType = file.type
    const dataUrl = `data:${mimeType};base64,${base64}`

    // En un entorno de producción, aquí subirías a un servicio como:
    // - Vercel Blob
    // - Supabase Storage
    // - Cloudinary
    // - AWS S3

    // Por ahora, devolvemos la imagen como data URL
    // Esto funciona pero no es ideal para producción
    console.log("Imagen procesada:", file.name, "Tamaño:", file.size, "bytes")

    return NextResponse.json({
      url: dataUrl,
      filename: file.name,
      size: file.size,
      type: file.type,
    })
  } catch (error) {
    console.error("Error uploading file:", error)
    return NextResponse.json({ error: "Error al procesar la imagen" }, { status: 500 })
  }
}
