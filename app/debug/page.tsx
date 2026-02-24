"use client"

import { AuthGuard } from "@/components/auth-guard"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { AlertCircle, Database, RefreshCw } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

function DebugContent() {
  const [apiResponse, setApiResponse] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()

  const fetchGifts = async () => {
    try {
      setLoading(true)
      setError(null)

      console.log("Fetching gifts for debug...")
      const token = localStorage.getItem("adminToken")
      const response = await fetch("/api/gifts", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        cache: "no-cache",
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      console.log("Debug data received:", data)
      setApiResponse(data)

      toast({
        title: "Datos obtenidos",
        description: `Se encontraron ${Array.isArray(data) ? data.length : 0} regalos`,
      })
    } catch (error) {
      console.error("Error fetching gifts for debug:", error)
      setError(error instanceof Error ? error.message : "Error desconocido")

      toast({
        title: "Error",
        description: "No se pudieron cargar los datos",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchGifts()
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 p-4">
      <div className="container mx-auto max-w-4xl py-8">
        <div className="text-center mb-8">
          <Database className="h-12 w-12 mx-auto mb-4 text-blue-500" />
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Página de Depuración</h1>
          <p className="text-gray-600">Verifica la conexión con la base de datos y los datos recibidos</p>
        </div>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Estado de la API</span>
              <Button variant="outline" size="sm" onClick={fetchGifts} disabled={loading} className="flex items-center">
                <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
                Actualizar
              </Button>
            </CardTitle>
            <CardDescription>Respuesta de la API de regalos</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8">
                <RefreshCw className="h-8 w-8 mx-auto mb-4 text-blue-500 animate-spin" />
                <p className="text-gray-600">Cargando datos...</p>
              </div>
            ) : error ? (
              <div className="bg-red-50 border border-red-200 rounded-md p-4">
                <div className="flex">
                  <AlertCircle className="h-5 w-5 text-red-600 mr-2 flex-shrink-0" />
                  <div>
                    <h4 className="text-sm font-medium text-red-800">Error al obtener datos</h4>
                    <div className="mt-1 text-sm text-red-700">
                      <p>{error}</p>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div>
                <div className="mb-4">
                  <Badge variant="outline" className="mb-2">
                    {Array.isArray(apiResponse)
                      ? `${apiResponse.length} regalos encontrados`
                      : "Formato de respuesta inválido"}
                  </Badge>
                </div>

                <div className="bg-gray-50 p-4 rounded-md overflow-auto max-h-96">
                  <pre className="text-xs text-gray-800">{JSON.stringify(apiResponse, null, 2)}</pre>
                </div>
              </div>
            )}
          </CardContent>
          <CardFooter className="text-sm text-gray-500">
            Esta página muestra los datos exactos que recibe la aplicación desde la API.
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Información de Supabase</CardTitle>
            <CardDescription>Estado de la conexión con la base de datos</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-1">URL de Supabase</h3>
                <p className="text-sm text-gray-600 bg-gray-50 p-2 rounded">
                  {process.env.NEXT_PUBLIC_SUPABASE_URL
                    ? `${process.env.NEXT_PUBLIC_SUPABASE_URL.substring(0, 12)}...`
                    : "No configurada"}
                </p>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-1">Estado de la API Key</h3>
                <p className="text-sm text-gray-600 bg-gray-50 p-2 rounded">
                  {process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? "Configurada correctamente" : "No configurada"}
                </p>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
                <div className="flex">
                  <AlertCircle className="h-5 w-5 text-blue-600 mr-2 flex-shrink-0" />
                  <div>
                    <h4 className="text-sm font-medium text-blue-800">Solución de problemas</h4>
                    <div className="mt-1 text-sm text-blue-700">
                      <p>Si no ves tus regalos, verifica que:</p>
                      <ul className="list-disc pl-5 mt-2 space-y-1">
                        <li>Las variables de entorno de Supabase estén configuradas correctamente</li>
                        <li>La tabla "gifts" exista en tu base de datos</li>
                        <li>El script SQL se haya ejecutado correctamente</li>
                        <li>No haya errores en la consola del navegador</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default function DebugPage() {
  return (
    <AuthGuard>
      <DebugContent />
    </AuthGuard>
  )
}
