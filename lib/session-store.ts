// Almacén de sesiones en memoria
// Las sesiones se pierden al reiniciar el servidor (comportamiento intencional por seguridad)

interface Session {
  token: string
  createdAt: number
  expiresAt: number
}

// Mapa de sesiones activas: token -> Session
const sessions = new Map<string, Session>()

// Duración de sesión: 24 horas en milisegundos
const SESSION_DURATION = 24 * 60 * 60 * 1000

/**
 * Crea una nueva sesión y guarda el token
 */
export function createSession(token: string): Session {
  const now = Date.now()
  const session: Session = {
    token,
    createdAt: now,
    expiresAt: now + SESSION_DURATION,
  }

  sessions.set(token, session)
  console.log(`[Session] Nueva sesión creada. Total activas: ${sessions.size}`)

  // Limpiar sesiones expiradas cada vez que se crea una nueva
  cleanExpiredSessions()

  return session
}

/**
 * Verifica si un token corresponde a una sesión válida
 */
export function validateSession(token: string): boolean {
  if (!token || token.length !== 64) {
    return false
  }

  const session = sessions.get(token)

  if (!session) {
    console.log(`[Session] Token no encontrado en el almacén`)
    return false
  }

  // Verificar si la sesión expiró
  if (Date.now() > session.expiresAt) {
    console.log(`[Session] Sesión expirada, eliminando`)
    sessions.delete(token)
    return false
  }

  return true
}

/**
 * Invalida/elimina una sesión
 */
export function invalidateSession(token: string): boolean {
  const existed = sessions.has(token)
  sessions.delete(token)

  if (existed) {
    console.log(`[Session] Sesión invalidada. Total activas: ${sessions.size}`)
  }

  return existed
}

/**
 * Limpia sesiones expiradas del almacén
 */
function cleanExpiredSessions(): void {
  const now = Date.now()
  let cleaned = 0

  for (const [token, session] of sessions.entries()) {
    if (now > session.expiresAt) {
      sessions.delete(token)
      cleaned++
    }
  }

  if (cleaned > 0) {
    console.log(`[Session] Limpiadas ${cleaned} sesiones expiradas`)
  }
}

/**
 * Obtiene el número de sesiones activas (para debugging)
 */
export function getActiveSessionCount(): number {
  cleanExpiredSessions()
  return sessions.size
}
