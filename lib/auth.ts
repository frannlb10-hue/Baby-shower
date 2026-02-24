import crypto from "crypto"
import { NextResponse } from "next/server"
import { validateSession } from "./session-store"

export function generatePasswordHash(password: string): { hash: string; salt: string } {
  const salt = crypto.randomBytes(32).toString("hex")
  const hash = crypto
    .createHash("sha256")
    .update(password + salt)
    .digest("hex")
  return { hash, salt }
}

export function hashPassword(password: string, salt: string): { hash: string; salt: string } {
  const hash = crypto
    .createHash("sha256")
    .update(password + salt)
    .digest("hex")
  return { hash, salt }
}

export function verifyPassword(password: string, hash: string, salt: string): boolean {
  const { hash: computedHash } = hashPassword(password, salt)
  return computedHash === hash
}

export function generateSessionToken(): string {
  return crypto.randomBytes(32).toString("hex")
}

export function isAuthenticated(request: Request): boolean {
  const authHeader = request.headers.get("authorization")
  const cookieHeader = request.headers.get("cookie")

  // Check Authorization header
  if (authHeader && authHeader.startsWith("Bearer ")) {
    const token = authHeader.substring(7)
    return isValidSessionToken(token)
  }

  // Check cookies
  if (cookieHeader) {
    const cookies = parseCookies(cookieHeader)
    const sessionToken = cookies["admin-session"]
    if (sessionToken) {
      return isValidSessionToken(sessionToken)
    }
  }

  return false
}

function isValidSessionToken(token: string): boolean {
  // Verificar formato básico
  if (!token || token.length !== 64 || !/^[a-f0-9]+$/.test(token)) {
    return false
  }

  // Verificar que el token existe en el almacén de sesiones
  return validateSession(token)
}

function parseCookies(cookieHeader: string): Record<string, string> {
  const cookies: Record<string, string> = {}
  cookieHeader.split(";").forEach((cookie) => {
    const [name, value] = cookie.trim().split("=")
    if (name && value) {
      cookies[name] = decodeURIComponent(value)
    }
  })
  return cookies
}

// Función mejorada para verificar autenticación que devuelve JSON
export function requireAuth(request: Request): NextResponse | null {
  try {
    if (!isAuthenticated(request)) {
      return NextResponse.json(
        {
          error: "No autorizado",
          message: "Se requiere autenticación para acceder a este recurso",
        },
        { status: 401 },
      )
    }
    return null
  } catch (error) {
    console.error("Error in requireAuth:", error)
    return NextResponse.json(
      {
        error: "Error de autenticación",
        message: "Error interno al verificar la autenticación",
      },
      { status: 500 },
    )
  }
}
