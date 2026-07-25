import { NextResponse } from "next/server"
import { requireAuth } from "@/lib/auth"
import * as XLSX from "xlsx"

export async function GET(request: Request) {
  // Verificar autenticación
  const authError = requireAuth(request)
  if (authError) return authError

  try {
    console.log("GET /api/gifts/export called")

    // Verificar variables de entorno
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    let gifts = []

    if (!supabaseUrl || !supabaseKey) {
      console.warn("Variables de entorno de Supabase no configuradas, usando datos de fallback")
      const { FALLBACK_GIFTS } = await import("@/lib/fallback-data")
      gifts = FALLBACK_GIFTS
    } else {
      const { getAllGifts } = await import("@/lib/supabase")
      gifts = await getAllGifts()
    }

    // Preparar datos para Excel con las columnas solicitadas
    const excelData = gifts.map((gift: any) => ({
      "Nombre regalo": gift.name || "",
      "Descripción regalo": gift.description || "",
      Precio: gift.price ? `$${gift.price.toLocaleString()}` : "",
      Link: gift.external_link || "",
      "Reservado por": gift.reserved_by || (gift.reserved ? "Reservado" : ""),
      "Fecha y hora reserva": gift.reserved_at
        ? new Date(gift.reserved_at).toLocaleString("es-ES", {
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
          })
        : "",
    }))

    // Crear libro de Excel
    const workbook = XLSX.utils.book_new()
    const worksheet = XLSX.utils.json_to_sheet(excelData)

    // Configurar ancho de columnas
    const columnWidths = [
      { wch: 25 }, // Nombre regalo
      { wch: 40 }, // Descripción regalo
      { wch: 15 }, // Precio
      { wch: 30 }, // Link
      { wch: 20 }, // Reservado por
      { wch: 20 }, // Fecha y hora reserva
    ]
    worksheet["!cols"] = columnWidths

    // Agregar hoja al libro
    XLSX.utils.book_append_sheet(workbook, worksheet, "Lista de Regalos")

    // Generar buffer del archivo Excel
    const excelBuffer = XLSX.write(workbook, {
      type: "buffer",
      bookType: "xlsx",
      compression: true,
    })

    // Crear nombre de archivo con fecha
    const fileName = `lista-regalos-primer-anito-emi-${new Date().toISOString().split("T")[0]}.xlsx`

    console.log("Export successful, returning Excel with", gifts.length, "gifts")

    return new NextResponse(excelBuffer, {
      status: 200,
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="${fileName}"`,
        "Content-Length": excelBuffer.length.toString(),
      },
    })
  } catch (error) {
    console.error("Export error:", error)
    return NextResponse.json({ message: "Error al exportar la lista de regalos" }, { status: 500 })
  }
}
