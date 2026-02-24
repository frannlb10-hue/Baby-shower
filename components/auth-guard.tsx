"use client"

import type React from "react"

import { useState, useEffect, type ReactNode } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Shield, Eye, EyeOff, Mail, ArrowLeft } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface AuthGuardProps {
  children: ReactNode
}

export function AuthGuard({ children }: AuthGuardProps) {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [loginLoading, setLoginLoading] = useState(false)
  const [showResetForm, setShowResetForm] = useState(false)
  const [resetEmail, setResetEmail] = useState("")
  const [resetLoading, setResetLoading] = useState(false)
  const [loginError, setLoginError] = useState("")
  const { toast } = useToast()

  useEffect(() => {
    // Verificar si ya hay un token válido
    const token = localStorage.getItem("adminToken")
    if (token && token.includes(".") && token.length > 64) {
      setIsAuthenticated(true)
    }
    setIsLoading(false)
  }, [])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoginLoading(true)
    setLoginError("")

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
      })

      const data = await response.json()

      if (response.ok && data.success) {
        localStorage.setItem("adminToken", data.token)
        setIsAuthenticated(true)
        toast({
          title: "Acceso autorizado",
          description: "Bienvenido al panel de administración",
        })
      } else {
        setLoginError(data.error || "Credenciales inválidas")
        toast({
          title: "Error de autenticación",
          description: data.error || "Credenciales inválidas",
          variant: "destructive",
        })
      }
    } catch (error) {
      setLoginError("No se pudo conectar con el servidor")
      toast({
        title: "Error de conexión",
        description: "No se pudo conectar con el servidor",
        variant: "destructive",
      })
    } finally {
      setLoginLoading(false)
      setPassword("") // Limpiar contraseña por seguridad
    }
  }

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault()
    setResetLoading(true)

    try {
      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: resetEmail }),
      })

      const data = await response.json()

      if (response.ok && data.success) {
        toast({
          title: "Email enviado",
          description: data.message,
        })

        // Si estamos en desarrollo, mostrar las credenciales
        if (data.devInfo) {
          toast({
            title: "Credenciales de desarrollo",
            description: `Usuario: ${data.devInfo.username}, Contraseña: ${data.devInfo.password}`,
            duration: 10000,
          })
        }

        setShowResetForm(false)
        setResetEmail("")
      } else {
        toast({
          title: "Error",
          description: data.error || "No se pudo procesar la solicitud",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error de conexión",
        description: "No se pudo conectar con el servidor",
        variant: "destructive",
      })
    } finally {
      setResetLoading(false)
    }
  }

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" })
      localStorage.removeItem("adminToken")
      setIsAuthenticated(false)
      setUsername("")
      setPassword("")
      setLoginError("")
      toast({
        title: "Sesión cerrada",
        description: "Has cerrado sesión exitosamente",
      })
    } catch (error) {
      console.error("Error al cerrar sesión:", error)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <Shield className="h-12 w-12 mx-auto mb-4 text-blue-500 animate-pulse" />
          <p className="text-lg text-gray-600">Verificando autenticación...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    if (showResetForm) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-md">
            <CardHeader className="text-center">
              <Mail className="h-12 w-12 mx-auto mb-4 text-blue-500" />
              <CardTitle>Recuperar Contraseña</CardTitle>
              <CardDescription>Ingresa tu email para recibir las instrucciones de recuperación</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handlePasswordReset} className="space-y-4">
                <div>
                  <Label htmlFor="resetEmail">Email</Label>
                  <Input
                    id="resetEmail"
                    type="email"
                    value={resetEmail}
                    onChange={(e) => setResetEmail(e.target.value)}
                    placeholder="jagcoccolo@gmail.com"
                    required
                    autoComplete="email"
                  />
                </div>

                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setShowResetForm(false)
                      setResetEmail("")
                    }}
                    className="flex-1"
                  >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Volver
                  </Button>
                  <Button type="submit" disabled={resetLoading} className="flex-1">
                    {resetLoading ? "Enviando..." : "Enviar"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )
    }

    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <Shield className="h-12 w-12 mx-auto mb-4 text-blue-500" />
            <CardTitle>Acceso Administrativo</CardTitle>
            <CardDescription>Ingresa tus credenciales para acceder al panel de administración</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <Label htmlFor="username">Usuario</Label>
                <Input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Ingresa tu usuario"
                  required
                  autoComplete="username"
                />
              </div>
              <div>
                <Label htmlFor="password">Contraseña</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Ingresa tu contraseña"
                    required
                    autoComplete="current-password"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>

              {loginError && (
                <div className="bg-red-50 border border-red-200 rounded-md p-3">
                  <p className="text-sm text-red-800">{loginError}</p>
                </div>
              )}

              <Button type="submit" className="w-full" disabled={loginLoading}>
                {loginLoading ? "Verificando..." : "Iniciar Sesión"}
              </Button>

              <div className="text-center">
                <Button
                  type="button"
                  variant="link"
                  onClick={() => setShowResetForm(true)}
                  className="text-sm text-blue-600 hover:text-blue-800"
                >
                  ¿Olvidaste tu contraseña?
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div>
      <div className="bg-white border-b border-gray-200 px-4 py-2">
        <div className="flex justify-between items-center max-w-7xl mx-auto">
          <div className="flex items-center space-x-2">
            <Shield className="h-5 w-5 text-green-600" />
            <span className="text-sm text-gray-600">Sesión administrativa activa</span>
          </div>
          <Button variant="outline" size="sm" onClick={handleLogout}>
            Cerrar Sesión
          </Button>
        </div>
      </div>
      {children}
    </div>
  )
}
