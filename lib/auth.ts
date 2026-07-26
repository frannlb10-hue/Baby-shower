import crypto from "crypto"
import { NextResponse } from "next/server"
import { validateSession } from "./session-store"

const SCRYPT_PREFIX = "scrypt$"
const SCRYPT_KEYLEN = 64

// Genera hash+salt para una contraseña nueva, siempre con scrypt (memory-hard).
export function generatePasswordHash(password: string): { hash: string; salt: string } {
  const salt = crypto.randomBytes(16).toString("hex")
  const derivedKey = crypto.scryptSync(password, salt, SCRYPT_KEYLEN)
  return { hash: `${SCRYPT_PREFIX}${derivedKey.toString("hex")}`, salt }
}

export function verifyPassword(password: string, hash: string, salt: string): boolean {
  if (hash.startsWith(SCRYPT_PREFIX)) {
    const stored = Buffer.from(hash.slice(SCRYPT_PREFIX.length), "hex")
    const derived = crypto.scryptSync(password, salt, SCRYPT_KEYLEN)
    if (stored.length !== derived.length) return false
    return crypto.timingSafeEqual(stored, derived)
  }

  // Formato legado (sha256 simple) — sigue soportado en login hasta que se use "cambiar contraseña".
  const legacyHash = crypto.createHash("sha256").update(password + salt).digest("hex")
  const storedBuf = Buffer.from(hash, "hex")
  const legacyBuf = Buffer.from(legacyHash, "hex")
  if (storedBuf.length !== legacyBuf.length) return false
  return crypto.timingSafeEqual(storedBuf, legacyBuf)
}

export function generateSessionToken(): string {
  const expiresAt = Date.now() + 24 * 60 * 60 * 1000
  const secret = process.env.SESSION_SECRET || "insecure-default-secret"
  const signature = crypto
    .createHmac("sha256", secret)
    .update(String(expiresAt))
    .digest("hex")
  return `${expiresAt}.${signature}`
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
  if (!token || !token.includes(".")) return false
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
