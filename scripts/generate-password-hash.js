const crypto = require("crypto")

// Función para generar hash de contraseña (scrypt, memory-hard)
function generatePasswordHash(password) {
  const salt = crypto.randomBytes(16).toString("hex")
  const derivedKey = crypto.scryptSync(password, salt, 64)
  return { hash: `scrypt$${derivedKey.toString("hex")}`, salt }
}

// Ejemplo de uso - cambia 'tu_contraseña_segura' por tu contraseña real
const password = "tu_contraseña_segura"
const result = generatePasswordHash(password)

console.log("=== CONFIGURACIÓN DE VARIABLES DE ENTORNO ===")
console.log("")
console.log("Agrega estas variables a tu archivo .env.local o en Vercel:")
console.log("")
console.log(`ADMIN_USERNAME=admin`)
console.log(`ADMIN_PASSWORD_HASH=${result.hash}`)
console.log(`ADMIN_SALT=${result.salt}`)
console.log(`SESSION_SECRET=${crypto.randomBytes(32).toString("hex")}`)
console.log("")
console.log("=== INSTRUCCIONES ===")
console.log('1. Cambia "tu_contraseña_segura" por tu contraseña real en este script')
console.log("2. Ejecuta el script nuevamente para generar el hash")
console.log("3. Copia las variables de entorno generadas")
console.log("4. Configúralas en tu proyecto")
