import { NextResponse } from "next/server"
import { requireAuth } from "@/lib/auth"
import * as XLSX from "xlsx"

export async function POST(request: Request) {
  try {
    console.log("POST /api/gifts/import called")

    // Verificar autenticación
    const authError = requireAuth(request)
    if (authError) return authError

    const formData = await request.formData()
    const file = formData.get("file") as File

    if (!file) {
      return NextResponse.json({ error: "No se encontró archivo" }, { status: 400 })
    }

    // Validar tipo de archivo
    if (!file.name.match(/\.(xlsx|xls)$/i)) {
      return NextResponse.json({ error: "El archivo debe ser un Excel (.xlsx o .xls)" }, { status: 400 })
    }

    // Validar tamaño (máximo 10MB)
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json({ error: "El archivo es demasiado grande (máximo 10MB)" }, { status: 400 })
    }

    try {
      // Leer el archivo Excel
      const bytes = await file.arrayBuffer()
      const workbook = XLSX.read(bytes, { type: "array" })

      // Obtener la primera hoja
      const sheetName = workbook.SheetNames[0]
      const worksheet = workbook.Sheets[sheetName]

      // Convertir a JSON
      const data = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as any[][]

      if (data.length < 2) {
        return NextResponse.json(
          { error: "El archivo debe tener al menos una fila de encabezados y una fila de datos" },
          { status: 400 },
        )
      }

      // Procesar los datos
      const headers = data[0].map((h: any) => String(h).toLowerCase().trim())
      const rows = data.slice(1)

      // Mapear columnas esperadas
      const columnMap = {
        name: findColumn(headers, ["nombre", "name", "regalo", "producto"]),
        description: findColumn(headers, ["descripcion", "description", "desc"]),
        price: findColumn(headers, ["precio", "price", "valor", "costo"]),
        external_link: findColumn(headers, ["enlace", "link", "url", "external_link"]),
      }

      if (columnMap.name === -1) {
        return NextResponse.json(
          {
            error:
              "No se encontró la columna 'nombre' o 'name'. Asegúrate de que el archivo tenga una columna con el nombre del regalo.",
          },
          { status: 400 },
        )
      }

      const gifts = []
      const errors = []

      for (let i = 0; i < rows.length; i++) {
        const row = rows[i]
        const rowNumber = i + 2 // +2 porque empezamos desde la fila 2 (después de headers)

        try {
          const name = row[columnMap.name]?.toString().trim()

          if (!name) {
            errors.push(`Fila ${rowNumber}: El nombre del regalo es requerido`)
            continue
          }

          const gift = {
            name,
            description: columnMap.description !== -1 ? row[columnMap.description]?.toString().trim() || null : null,
            price: columnMap.price !== -1 ? Number.parseFloat(row[columnMap.price]) || null : null,
            external_link:
              columnMap.external_link !== -1 ? row[columnMap.external_link]?.toString().trim() || null : null,
          }

          gifts.push(gift)
        } catch (error) {
          errors.push(
            `Fila ${rowNumber}: Error al procesar - ${error instanceof Error ? error.message : "Error desconocido"}`,
          )
        }
      }

      if (gifts.length === 0) {
        return NextResponse.json(
          {
            error: "No se pudieron procesar regalos válidos del archivo",
            details: errors,
          },
          { status: 400 },
        )
      }

      // Verificar variables de entorno
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
      const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

      if (!supabaseUrl || !supabaseKey) {
        return NextResponse.json(
          {
            error: "Configuración incompleta",
            message: "Modo demostración: No se pueden importar regalos sin configurar Supabase",
          },
          { status: 400 },
        )
      }

      try {
        const { createMultipleGifts } = await import("@/lib/supabase")
        const results = await createMultipleGifts(gifts)

        console.log(`Successfully imported ${results.length} gifts`)

        return NextResponse.json({
          success: true,
          message: `Se importaron ${results.length} regalos exitosamente`,
          imported: results.length,
          errors: errors.length > 0 ? errors : undefined,
        })
      } catch (supabaseError) {
        console.error("Error importing gifts to Supabase:", supabaseError)
        return NextResponse.json(
          {
            error: "Error de base de datos",
            message: "Error al importar los regalos a la base de datos",
            details: supabaseError instanceof Error ? supabaseError.message : "Error desconocido",
          },
          { status: 500 },
        )
      }
    } catch (error) {
      console.error("Error processing Excel file:", error)
      return NextResponse.json(
        {
          error: "Error al procesar archivo",
          message: "No se pudo leer el archivo Excel",
          details: error instanceof Error ? error.message : "Error desconocido",
        },
        { status: 400 },
      )
    }
  } catch (error) {
    console.error("Error in POST /api/gifts/import:", error)
    return NextResponse.json(
      {
        error: "Error interno",
        message: "Error interno del servidor al importar regalos",
      },
      { status: 500 },
    )
  }
}

// Función auxiliar para encontrar columnas
function findColumn(headers: string[], possibleNames: string[]): number {
  for (const name of possibleNames) {
    const index = headers.findIndex((h) => h.includes(name))
    if (index !== -1) return index
  }
  return -1
}
