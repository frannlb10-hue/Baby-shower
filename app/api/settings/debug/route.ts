import { NextResponse } from "next/server"
import { requireAuth } from "@/lib/auth"
import fs from "fs"
import path from "path"

// Ruta al archivo de configuraciones
const SETTINGS_FILE = path.join(process.cwd(), "settings.json")

export async function GET(request: Request) {
  try {
    // Verificar autenticación
    const authError = requireAuth(request)
    if (authError) return authError

    // Verificar si el archivo existe
    const fileExists = fs.existsSync(SETTINGS_FILE)

    // Información del sistema de archivos
    const cwd = process.cwd()
    const tmpDir = path.join(cwd, "tmp")
    let canWriteToTmp = false
    let tmpDirExists = false

    try {
      tmpDirExists = fs.existsSync(tmpDir)
      if (!tmpDirExists) {
        fs.mkdirSync(tmpDir, { recursive: true })
        tmpDirExists = true
      }

      const testFile = path.join(tmpDir, "test.txt")
      fs.writeFileSync(testFile, "test")
      canWriteToTmp = true
      fs.unlinkSync(testFile)
    } catch (err) {
      console.error("Error testing file system:", err)
    }

    // Intentar leer el archivo de configuraciones
    let fileContents = null
    let fileError = null
    if (fileExists) {
      try {
        fileContents = fs.readFileSync(SETTINGS_FILE, "utf8")
      } catch (err) {
        fileError = err instanceof Error ? err.message : "Error desconocido"
      }
    }

    // Intentar escribir un archivo de prueba en la misma ubicación
    let canWriteToSettingsDir = false
    try {
      const testFile = path.join(path.dirname(SETTINGS_FILE), "test.txt")
      fs.writeFileSync(testFile, "test")
      canWriteToSettingsDir = true
      fs.unlinkSync(testFile)
    } catch (err) {
      console.error("Error testing write permissions:", err)
    }

    return NextResponse.json({
      success: true,
      debug: {
        fileSystem: {
          cwd,
          settingsFile: SETTINGS_FILE,
          fileExists,
          canWriteToSettingsDir,
          tmpDirExists,
          canWriteToTmp,
        },
        fileContents: fileContents ? JSON.parse(fileContents) : null,
        fileError,
        env: {
          NODE_ENV: process.env.NODE_ENV,
          VERCEL_ENV: process.env.VERCEL_ENV,
        },
      },
    })
  } catch (error) {
    console.error("Error in GET /api/settings/debug:", error)
    return NextResponse.json(
      {
        error: "Error interno",
        message: "Error al obtener información de depuración",
        details: error instanceof Error ? error.message : "Error desconocido",
      },
      { status: 500 },
    )
  }
}

export async function POST(request: Request) {
  try {
    // Verificar autenticación
    const authError = requireAuth(request)
    if (authError) return authError

    let body
    try {
      body = await request.json()
    } catch (parseError) {
      return NextResponse.json(
        {
          error: "Datos inválidos",
          message: "El cuerpo de la solicitud no es JSON válido",
        },
        { status: 400 },
      )
    }

    // Guardar configuraciones directamente
    try {
      fs.writeFileSync(SETTINGS_FILE, JSON.stringify(body, null, 2), "utf8")
      return NextResponse.json({
        success: true,
        message: "Configuraciones guardadas correctamente en modo debug",
      })
    } catch (error) {
      return NextResponse.json(
        {
          error: "Error de guardado",
          message: "No se pudieron guardar las configuraciones en el archivo",
          details: error instanceof Error ? error.message : "Error desconocido",
        },
        { status: 500 },
      )
    }
  } catch (error) {
    console.error("Error in POST /api/settings/debug:", error)
    return NextResponse.json(
      {
        error: "Error interno",
        message: "Error interno del servidor",
        details: error instanceof Error ? error.message : "Error desconocido",
      },
      { status: 500 },
    )
  }
}
