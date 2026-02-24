"use client"

import { AuthGuard } from "@/components/auth-guard"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Separator } from "@/components/ui/separator"
import {
  Settings,
  Save,
  RefreshCw,
  ArrowLeft,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Bug,
  FileJson,
  HardDrive,
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useSettings, invalidateSettingsCache } from "@/lib/settings"

function SettingsDebugContent() {
  const { settings: loadedSettings } = useSettings()
  const [debugInfo, setDebugInfo] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [settingsJson, setSettingsJson] = useState("")
  const [saving, setSaving] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    loadDebugInfo()
    setSettingsJson(JSON.stringify(loadedSettings, null, 2))
  }, [loadedSettings])

  const loadDebugInfo = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem("adminToken")

      const response = await fetch("/api/settings/debug", {
        headers: {
          Authorization: `Bearer ${token || ""}`,
        },
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      setDebugInfo(data.debug)
    } catch (error) {
      console.error("Error loading debug info:", error)
      toast({
        title: "Error",
        description: "No se pudo cargar la información de depuración",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSaveManual = async () => {
    try {
      setSaving(true)

      let settingsObj
      try {
        settingsObj = JSON.parse(settingsJson)
      } catch (err) {
        toast({
          title: "Error de formato",
          description: "El JSON no es válido",
          variant: "destructive",
        })
        return
      }

      const token = localStorage.getItem("adminToken")
      const response = await fetch("/api/settings/debug", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token || ""}`,
        },
        body: settingsJson,
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      invalidateSettingsCache()
      toast({
        title: "Configuraciones guardadas",
        description: "Las configuraciones se han guardado manualmente",
      })

      // Recargar información de depuración
      await loadDebugInfo()
    } catch (error) {
      console.error("Error saving settings manually:", error)
      toast({
        title: "Error",
        description: "No se pudieron guardar las configuraciones",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center">
            <Button variant="outline" size="sm" onClick={() => (window.location.href = "/admin")} className="mr-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-gray-800 flex items-center">
                <Bug className="h-8 w-8 mr-3 text-blue-500" />
                Depuración de Configuraciones
              </h1>
              <p className="text-gray-600">Herramientas para diagnosticar problemas con las configuraciones</p>
            </div>
          </div>

          <Button onClick={loadDebugInfo} disabled={loading} variant="outline">
            {loading ? <RefreshCw className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
            {loading ? "Cargando..." : "Actualizar"}
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <FileJson className="h-5 w-5 mr-2" />
                  Editor Manual de Configuraciones
                </CardTitle>
                <CardDescription>Edita directamente el JSON de configuraciones y guárdalo manualmente</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Textarea
                  value={settingsJson}
                  onChange={(e) => setSettingsJson(e.target.value)}
                  rows={15}
                  className="font-mono text-sm"
                />
                <Button onClick={handleSaveManual} disabled={saving} className="bg-blue-500 hover:bg-blue-600">
                  {saving ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      Guardando...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Guardar Manualmente
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            {debugInfo && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <HardDrive className="h-5 w-5 mr-2" />
                    Información del Sistema de Archivos
                  </CardTitle>
                  <CardDescription>Diagnóstico del sistema de archivos para guardar configuraciones</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Directorio de trabajo:</span>
                      <span className="text-sm font-mono bg-gray-100 px-2 py-1 rounded">
                        {debugInfo.fileSystem.cwd}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Archivo de configuraciones:</span>
                      <span className="text-sm font-mono bg-gray-100 px-2 py-1 rounded">
                        {debugInfo.fileSystem.settingsFile}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Archivo existe:</span>
                      {debugInfo.fileSystem.fileExists ? (
                        <Badge variant="outline" className="bg-green-50 text-green-700">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Sí
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="bg-amber-50 text-amber-700">
                          <AlertTriangle className="h-3 w-3 mr-1" />
                          No
                        </Badge>
                      )}
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Permisos de escritura:</span>
                      {debugInfo.fileSystem.canWriteToSettingsDir ? (
                        <Badge variant="outline" className="bg-green-50 text-green-700">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Sí
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="bg-red-50 text-red-700">
                          <XCircle className="h-3 w-3 mr-1" />
                          No
                        </Badge>
                      )}
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Directorio temporal:</span>
                      {debugInfo.fileSystem.tmpDirExists ? (
                        <Badge variant="outline" className="bg-green-50 text-green-700">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Existe
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="bg-amber-50 text-amber-700">
                          <AlertTriangle className="h-3 w-3 mr-1" />
                          No existe
                        </Badge>
                      )}
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Escritura en directorio temporal:</span>
                      {debugInfo.fileSystem.canWriteToTmp ? (
                        <Badge variant="outline" className="bg-green-50 text-green-700">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Sí
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="bg-red-50 text-red-700">
                          <XCircle className="h-3 w-3 mr-1" />
                          No
                        </Badge>
                      )}
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-2">
                    <h3 className="text-sm font-medium">Variables de entorno:</h3>
                    <div className="bg-gray-50 p-3 rounded text-sm">
                      <div>
                        <strong>NODE_ENV:</strong> {debugInfo.env.NODE_ENV}
                      </div>
                      <div>
                        <strong>VERCEL_ENV:</strong> {debugInfo.env.VERCEL_ENV || "No definido"}
                      </div>
                    </div>
                  </div>

                  {debugInfo.fileError && (
                    <div className="bg-red-50 border border-red-200 rounded-md p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <XCircle className="h-4 w-4 text-red-600" />
                        <h4 className="font-medium text-red-800">Error al leer el archivo:</h4>
                      </div>
                      <p className="text-sm text-red-700">{debugInfo.fileError}</p>
                    </div>
                  )}

                  {!debugInfo.fileSystem.canWriteToSettingsDir && (
                    <div className="bg-amber-50 border border-amber-200 rounded-md p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <AlertTriangle className="h-4 w-4 text-amber-600" />
                        <h4 className="font-medium text-amber-800">Problema detectado:</h4>
                      </div>
                      <p className="text-sm text-amber-700 mb-2">
                        No hay permisos de escritura en el directorio de configuraciones. Esto puede impedir que se
                        guarden los cambios.
                      </p>
                      <p className="text-sm text-amber-700">
                        <strong>Solución:</strong> Usa el editor manual para guardar las configuraciones o utiliza el
                        almacenamiento en localStorage.
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Configuraciones Actuales</CardTitle>
                <CardDescription>Configuraciones cargadas en la aplicación</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="bg-gray-50 p-3 rounded overflow-auto max-h-96">
                  <pre className="text-xs text-gray-800">{JSON.stringify(loadedSettings, null, 2)}</pre>
                </div>
              </CardContent>
            </Card>

            {debugInfo && debugInfo.fileContents && (
              <Card>
                <CardHeader>
                  <CardTitle>Configuraciones en Archivo</CardTitle>
                  <CardDescription>Contenido del archivo settings.json</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="bg-gray-50 p-3 rounded overflow-auto max-h-96">
                    <pre className="text-xs text-gray-800">{JSON.stringify(debugInfo.fileContents, null, 2)}</pre>
                  </div>
                </CardContent>
              </Card>
            )}

            <Card>
              <CardHeader>
                <CardTitle>Acciones</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    invalidateSettingsCache()
                    window.location.reload()
                  }}
                  className="w-full justify-start"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Recargar configuraciones
                </Button>

                <Button
                  variant="outline"
                  onClick={() => {
                    localStorage.removeItem("appSettings")
                    toast({
                      title: "Cache limpiado",
                      description: "Se ha eliminado la caché de configuraciones",
                    })
                  }}
                  className="w-full justify-start"
                >
                  <Bug className="h-4 w-4 mr-2" />
                  Limpiar caché local
                </Button>

                <Button
                  variant="outline"
                  onClick={() => (window.location.href = "/admin/settings")}
                  className="w-full justify-start"
                >
                  <Settings className="h-4 w-4 mr-2" />
                  Volver a configuraciones
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function SettingsDebugPage() {
  return (
    <AuthGuard>
      <SettingsDebugContent />
    </AuthGuard>
  )
}
