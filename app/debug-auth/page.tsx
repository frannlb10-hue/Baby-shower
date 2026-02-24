"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Copy, Key, Bug, CheckCircle, XCircle, AlertTriangle } from "lucide-react"

interface DebugInfo {
  envVars: {
    hasUsername: boolean
    hasPasswordHash: boolean
    hasSalt: boolean
    username: string
    saltLength: number
    hashLength: number
  }
  generatedHash: string
  storedHash: string
  hashesMatch: boolean
  saltUsed: string
}

interface NewCredentials {
  success: boolean
  credentials: {
    username: string
    passwordHash: string
    salt: string
    sessionSecret: string
  }
  envVars: string[]
  message: string
}

export default function DebugAuthPage() {
  const [password, setPassword] = useState("")
  const [debugInfo, setDebugInfo] = useState<DebugInfo | null>(null)
  const [newCredentials, setNewCredentials] = useState<NewCredentials | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const showAlert = (message: string) => {
    alert(message)
  }

  const handleDebug = async () => {
    if (!password.trim()) {
      showAlert("Por favor ingresa una contraseña para debuggear")
      return
    }

    setLoading(true)
    setError(null)
    setDebugInfo(null)

    try {
      const response = await fetch("/api/auth/debug", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: password.trim() }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || `HTTP ${response.status}`)
      }

      if (data.success && data.debug) {
        setDebugInfo(data.debug)
        showAlert("Debug completado. Revisa los resultados abajo.")
      } else {
        throw new Error(data.error || "Respuesta inválida del servidor")
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Error desconocido"
      console.error("Error en debug:", error)
      setError(`Error al debuggear: ${errorMessage}`)
      showAlert(`Error: ${errorMessage}`)
    } finally {
      setLoading(false)
    }
  }

  const handleGenerateNew = async () => {
    if (!password.trim()) {
      showAlert("Por favor ingresa una contraseña para generar credenciales")
      return
    }

    setLoading(true)
    setError(null)
    setNewCredentials(null)

    try {
      const response = await fetch("/api/auth/generate-hash", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: password.trim() }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || `HTTP ${response.status}`)
      }

      if (data.success && data.envVars) {
        setNewCredentials(data)
        showAlert("Credenciales generadas exitosamente. Cópialas y configúralas en Vercel.")
      } else {
        throw new Error(data.error || "Respuesta inválida del servidor")
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Error desconocido"
      console.error("Error generando credenciales:", error)
      setError(`Error al generar credenciales: ${errorMessage}`)
      showAlert(`Error: ${errorMessage}`)
    } finally {
      setLoading(false)
    }
  }

  const copyToClipboard = async (text: string) => {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text)
        showAlert("Texto copiado al portapapeles")
      } else {
        // Fallback para contextos no seguros
        const textArea = document.createElement("textarea")
        textArea.value = text
        textArea.style.position = "fixed"
        textArea.style.left = "-999999px"
        textArea.style.top = "-999999px"
        document.body.appendChild(textArea)
        textArea.focus()
        textArea.select()

        try {
          document.execCommand("copy")
          showAlert("Texto copiado al portapapeles")
        } catch (err) {
          console.error("Error copiando:", err)
          showAlert("No se pudo copiar automáticamente. Selecciona y copia manualmente.")
        } finally {
          document.body.removeChild(textArea)
        }
      }
    } catch (err) {
      console.error("Error en copyToClipboard:", err)
      showAlert("Error al copiar. Selecciona y copia manualmente.")
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bug className="h-5 w-5" />
              Debug de Autenticación
            </CardTitle>
            <CardDescription>
              Herramienta para diagnosticar y solucionar problemas de autenticación del panel de administración
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="password">Contraseña a verificar</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Ingresa la contraseña que quieres usar"
                className="mt-1"
              />
              <p className="text-sm text-gray-600 mt-1">
                Esta será la contraseña que uses para acceder al panel de administración
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-2">
              <Button onClick={handleDebug} disabled={loading || !password.trim()} variant="outline" className="flex-1">
                <Bug className="h-4 w-4 mr-2" />
                {loading ? "Debuggeando..." : "1. Debuggear Problema Actual"}
              </Button>
              <Button onClick={handleGenerateNew} disabled={loading || !password.trim()} className="flex-1">
                <Key className="h-4 w-4 mr-2" />
                {loading ? "Generando..." : "2. Generar Credenciales Nuevas"}
              </Button>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-md p-4">
                <div className="flex items-center gap-2 mb-2">
                  <XCircle className="h-4 w-4 text-red-600" />
                  <h4 className="font-medium text-red-800">Error:</h4>
                </div>
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Debug Results */}
        {debugInfo && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {debugInfo.hashesMatch ? (
                  <CheckCircle className="h-5 w-5 text-green-600" />
                ) : (
                  <XCircle className="h-5 w-5 text-red-600" />
                )}
                Resultado del Debug
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-base font-medium">Variables de Entorno</Label>
                  <div className="space-y-2 mt-2">
                    <div className="flex items-center gap-2">
                      <span
                        className={`px-2 py-1 rounded text-xs font-medium ${
                          debugInfo.envVars.hasUsername ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                        }`}
                      >
                        ADMIN_USERNAME
                      </span>
                      <span className="text-sm">{debugInfo.envVars.username || "❌ No configurado"}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span
                        className={`px-2 py-1 rounded text-xs font-medium ${
                          debugInfo.envVars.hasPasswordHash ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                        }`}
                      >
                        ADMIN_PASSWORD_HASH
                      </span>
                      <span className="text-sm">
                        {debugInfo.envVars.hasPasswordHash
                          ? `✅ ${debugInfo.envVars.hashLength} caracteres`
                          : "❌ No configurado"}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span
                        className={`px-2 py-1 rounded text-xs font-medium ${
                          debugInfo.envVars.hasSalt ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                        }`}
                      >
                        ADMIN_SALT
                      </span>
                      <span className="text-sm">
                        {debugInfo.envVars.hasSalt
                          ? `✅ ${debugInfo.envVars.saltLength} caracteres`
                          : "❌ No configurado"}
                      </span>
                    </div>
                  </div>
                </div>

                <div>
                  <Label className="text-base font-medium">Verificación de Contraseña</Label>
                  <div className="space-y-2 mt-2">
                    <div className="flex items-center gap-2">
                      <span
                        className={`px-2 py-1 rounded text-xs font-medium ${
                          debugInfo.hashesMatch ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                        }`}
                      >
                        {debugInfo.hashesMatch ? "✅ Contraseña Correcta" : "❌ Contraseña Incorrecta"}
                      </span>
                    </div>
                    <div className="text-xs text-gray-600 space-y-1">
                      <p>Hash generado: {debugInfo.generatedHash?.substring(0, 16) || "N/A"}...</p>
                      <p>Hash almacenado: {debugInfo.storedHash?.substring(0, 16) || "N/A"}...</p>
                    </div>
                  </div>
                </div>
              </div>

              {!debugInfo.hashesMatch && (
                <div className="bg-red-50 border border-red-200 rounded-md p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertTriangle className="h-4 w-4 text-red-600" />
                    <h4 className="font-medium text-red-800">Problema Detectado:</h4>
                  </div>
                  <p className="text-sm text-red-700 mb-2">
                    La contraseña que ingresaste no coincide con las credenciales almacenadas en Vercel.
                  </p>
                  <p className="text-sm text-red-700">
                    <strong>Solución:</strong> Usa el botón "Generar Credenciales Nuevas" para crear las variables
                    correctas.
                  </p>
                </div>
              )}

              {debugInfo.hashesMatch && (
                <div className="bg-green-50 border border-green-200 rounded-md p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <h4 className="font-medium text-green-800">¡Todo Correcto!</h4>
                  </div>
                  <p className="text-sm text-green-700">
                    Tu contraseña coincide con las credenciales almacenadas. Deberías poder hacer login normalmente.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* New Credentials */}
        {newCredentials && newCredentials.envVars && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Key className="h-5 w-5 text-green-600" />
                Nuevas Credenciales Generadas
              </CardTitle>
              <CardDescription>
                Copia estas variables de entorno exactamente como aparecen a tu configuración de Vercel
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label className="text-base font-medium">Variables de Entorno para Vercel</Label>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => copyToClipboard(newCredentials.envVars.join("\n"))}
                  >
                    <Copy className="h-4 w-4 mr-2" />
                    Copiar Todo
                  </Button>
                </div>
                <Textarea
                  value={newCredentials.envVars.join("\n")}
                  readOnly
                  rows={5}
                  className="font-mono text-sm bg-gray-50"
                />
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
                <h4 className="font-medium text-blue-800 mb-3">📋 Instrucciones paso a paso:</h4>
                <ol className="text-sm text-blue-700 space-y-2">
                  <li>
                    <strong>1.</strong> Ve a tu proyecto en{" "}
                    <a href="https://vercel.com" target="_blank" rel="noopener noreferrer" className="underline">
                      Vercel
                    </a>
                  </li>
                  <li>
                    <strong>2.</strong> Haz clic en <strong>Settings</strong> → <strong>Environment Variables</strong>
                  </li>
                  <li>
                    <strong>3.</strong> Borra las variables existentes: ADMIN_USERNAME, ADMIN_PASSWORD_HASH, ADMIN_SALT,
                    SESSION_SECRET
                  </li>
                  <li>
                    <strong>4.</strong> Agrega cada variable nueva una por una (copia exactamente como aparece arriba)
                  </li>
                  <li>
                    <strong>5.</strong> Haz clic en <strong>Redeploy</strong> para aplicar los cambios
                  </li>
                  <li>
                    <strong>6.</strong> Prueba el login en <strong>/admin</strong> con tu contraseña
                  </li>
                </ol>
              </div>

              {newCredentials.credentials && (
                <div className="bg-green-50 border border-green-200 rounded-md p-4">
                  <h4 className="font-medium text-green-800 mb-2">✅ Credenciales para el login:</h4>
                  <div className="text-sm text-green-700 space-y-1">
                    <p>
                      <strong>Usuario:</strong> {newCredentials.credentials.username}
                    </p>
                    <p>
                      <strong>Contraseña:</strong> {password} (la que ingresaste arriba)
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
