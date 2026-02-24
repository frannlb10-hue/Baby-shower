// Validación de sesiones stateless via HMAC
// Compatible con entornos serverless (Vercel) donde las lambdas no comparten memoria

import crypto from "crypto"

const SESSION_DURATION = 24 * 60 * 60 * 1000 // 24 horas

function getSecret(): string {
  return process.env.SESSION_SECRET || "insecure-default-secret"
}

/**
 * Crea un token de sesión auto-validable (HMAC-signed).
 * Formato: `${expiresAt}.${hmac_sha256(SESSION_SECRET, expiresAt)}`
 * No requiere almacenamiento — el token se verifica criptográficamente.
 */
export function createSession(_token: string): void {
  // No-op: los tokens HMAC son auto-validables, no necesitan almacenamiento
}

/**
 * Verifica un token de sesión HMAC.
 * Comprueba firma y expiración sin acceder a estado compartido.
 */
export function validateSession(token: string): boolean {
  try {
    const dotIdx = token.indexOf(".")
    if (dotIdx === -1) return false

    const expiresAtStr = token.slice(0, dotIdx)
    const signature = token.slice(dotIdx + 1)

    const expiresAt = parseInt(expiresAtStr, 10)
    if (isNaN(expiresAt) || Date.now() > expiresAt) {
      console.log("[Session] Token expirado o formato inválido")
      return false
    }

    const expected = crypto
      .createHmac("sha256", getSecret())
      .update(expiresAtStr)
      .digest("hex")

    // Comparación en tiempo constante para evitar timing attacks
    const sigBuffer = Buffer.from(signature.padEnd(64, "0").slice(0, 64), "hex")
    const expBuffer = Buffer.from(expected, "hex")

    if (sigBuffer.length !== expBuffer.length) return false
    return crypto.timingSafeEqual(sigBuffer, expBuffer)
  } catch (err) {
    console.error("[Session] Error validando token:", err)
    return false
  }
}

/**
 * "Invalida" una sesión. Con tokens HMAC stateless el logout
 * funciona limpiando el token en el cliente (localStorage + cookie).
 */
export function invalidateSession(_token: string): boolean {
  return true
}

export function getActiveSessionCount(): number {
  return 0
}
