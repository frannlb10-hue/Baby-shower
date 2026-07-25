"use client"

import { AuthGuard } from "@/components/auth-guard"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { AlertCircle, CheckCircle, Database, RefreshCw, XCircle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface SystemStatus {
  supabaseConfigured: boolean
  tableExists: boolean
  apiWorking: boolean
  giftsCount: number
  lastError?: string
}

function StatusContent() {
  const [status, setStatus] = useState<SystemStatus | null>(null)
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  const checkSystemStatus = async () => {
    try {
      setLoading(true)

      // Verificar variables de entorno
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
      const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
      const supabaseConfigured = !!(supabaseUrl && supabaseKey)

      // Verificar API
      let apiWorking = false
      let giftsCount = 0
      let tableExists = false
      let lastError = ""

      try {
        const token = localStorage.getItem("adminToken")
        const response = await fetch("/api/gifts", {
          method: "GET",
          cache: "no-cache",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        if (response.ok) {
          apiWorking = true
          const data = await response.json()
          giftsCount = Array.isArray(data) ? data.length : 0

          // Verificar si estamos usando datos de fallback
          const usingFallback =
            Array.isArray(data) && data.some((gift: any) => gift.id === "1" || gift.id === "2" || gift.id === "3")
          tableExists = !usingFallback
        } else {
          lastError = `API error: ${response.status}`
        }
      } catch (error) {
        lastError = error instanceof Error ? error.message : "Error desconocido"
      }

      setStatus({
        supabaseConfigured,
        tableExists,
        apiWorking,
        giftsCount,
        lastError: lastError || undefined,
      })

      toast({
        title: "Estado verificado",
        description: "Se ha actualizado el estado del sistema",
      })
    } catch (error) {
      console.error("Error checking system status:", error)
      toast({
        title: "Error",
        description: "No se pudo verificar el estado del sistema",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    checkSystemStatus()
  }, [])

  const getStatusIcon = (isOk: boolean) => {
    return isOk ? <CheckCircle className="h-5 w-5 text-green-600" /> : <XCircle className="h-5 w-5 text-red-600" />
  }

  const getStatusBadge = (isOk: boolean, okText: string, errorText: string) => {
    return (
      <Badge variant={isOk ? "default" : "destructive"} className={isOk ? "bg-green-100 text-green-800" : ""}>
        {isOk ? okText : errorText}
      </Badge>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 p-4">
      <div className="container mx-auto max-w-4xl py-8">
        <div className="text-center mb-8">
          <Database className="h-12 w-12 mx-auto mb-4 text-blue-500" />
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Estado del Sistema</h1>
          <p className="text-gray-600">Diagnóstico completo de la aplicación Primer Añito de Emi</p>
        </div>

        <div className="flex justify-center mb-8">
          <Button onClick={checkSystemStatus} disabled={loading} className="flex items-center">
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
            {loading ? "Verificando..." : "Verificar Estado"}
          </Button>
        </div>

        {status && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Configuración de Supabase</span>
                  {getStatusIcon(status.supabaseConfigured)}
                </CardTitle>
                <CardDescription>Variables de entorno y credenciales</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Estado:</span>
                    {getStatusBadge(status.supabaseConfigured, "Configurado", "No configurado")}
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">URL:</span>
                    <Badge variant="outline">{process.env.NEXT_PUBLIC_SUPABASE_URL ? "✓" : "✗"}</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">API Key:</span>
                    <Badge variant="outline">{process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? "✓" : "✗"}</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Base de Datos</span>
                  {getStatusIcon(status.tableExists)}
                </CardTitle>
                <CardDescription>Tabla de regalos y estructura</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Tabla 'gifts':</span>
                    {getStatusBadge(status.tableExists, "Existe", "No existe")}
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Regalos:</span>
                    <Badge variant="outline">{status.giftsCount} encontrados</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>API</span>
                  {getStatusIcon(status.apiWorking)}
                </CardTitle>
                <CardDescription>Endpoints y conectividad</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Estado:</span>
                    {getStatusBadge(status.apiWorking, "Funcionando", "Error")}
                  </div>
                  {status.lastError && (
                    <div className="bg-red-50 border border-red-200 rounded-md p-3">
                      <div className="flex">
                        <AlertCircle className="h-4 w-4 text-red-600 mr-2 flex-shrink-0 mt-0.5" />
                        <div>
                          <h4 className="text-sm font-medium text-red-800">Último error</h4>
                          <p className="text-sm text-red-700 mt-1">{status.lastError}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Acciones Recomendadas</CardTitle>
                <CardDescription>Pasos para solucionar problemas</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {!status.supabaseConfigured && (
                    <div className="bg-amber-50 border border-amber-200 rounded-md p-3">
                      <p className="text-sm text-amber-800">
                        <strong>1. Configurar Supabase:</strong> Visita{" "}
                        <a href="/admin/setup" className="underline">
                          /admin/setup
                        </a>{" "}
                        para configurar las credenciales.
                      </p>
                    </div>
                  )}

                  {status.supabaseConfigured && !status.tableExists && (
                    <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
                      <p className="text-sm text-blue-800">
                        <strong>2. Crear tabla:</strong> Ejecuta el script SQL en el editor de Supabase para crear la
                        tabla 'gifts'.
                      </p>
                    </div>
                  )}

                  {!status.apiWorking && (
                    <div className="bg-red-50 border border-red-200 rounded-md p-3">
                      <p className="text-sm text-red-800">
                        <strong>3. Verificar API:</strong> Revisa los logs del servidor y la consola del navegador para
                        más detalles.
                      </p>
                    </div>
                  )}

                  {status.supabaseConfigured && status.tableExists && status.apiWorking && (
                    <div className="bg-green-50 border border-green-200 rounded-md p-3">
                      <p className="text-sm text-green-800">
                        <strong>✓ Todo funcionando:</strong> El sistema está configurado correctamente.
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        <div className="text-center mt-8">
          <div className="flex justify-center space-x-4">
            <Button variant="outline" onClick={() => (window.location.href = "/")}>
              Página Principal
            </Button>
            <Button variant="outline" onClick={() => (window.location.href = "/admin")}>
              Panel Admin
            </Button>
            <Button variant="outline" onClick={() => (window.location.href = "/debug")}>
              Página Debug
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function StatusPage() {
  return (
    <AuthGuard>
      <StatusContent />
    </AuthGuard>
  )
}
