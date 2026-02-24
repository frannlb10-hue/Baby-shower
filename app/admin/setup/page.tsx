"use client"

import { AuthGuard } from "@/components/auth-guard"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { AlertCircle, Check, Copy, Database } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

function SetupContent() {
  const [supabaseUrl, setSupabaseUrl] = useState("")
  const [supabaseKey, setSupabaseKey] = useState("")
  const [copied, setCopied] = useState<string | null>(null)
  const { toast } = useToast()

  const handleCopy = (text: string, type: string) => {
    navigator.clipboard.writeText(text)
    setCopied(type)
    setTimeout(() => setCopied(null), 2000)
    toast({
      title: "Copiado al portapapeles",
      description: "El texto ha sido copiado",
    })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 p-4">
      <div className="container mx-auto max-w-3xl py-8">
        <div className="text-center mb-8">
          <Database className="h-12 w-12 mx-auto mb-4 text-blue-500" />
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Configuración de Supabase</h1>
          <p className="text-gray-600">Sigue estos pasos para configurar la base de datos para tu aplicación</p>
        </div>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Paso 1: Crear una cuenta en Supabase</CardTitle>
            <CardDescription>Primero necesitas crear una cuenta y un nuevo proyecto en Supabase</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <ol className="list-decimal pl-5 space-y-3">
              <li>
                Ve a{" "}
                <a
                  href="https://supabase.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  supabase.com
                </a>{" "}
                y crea una cuenta o inicia sesión
              </li>
              <li>Haz clic en "New Project" y sigue los pasos para crear un nuevo proyecto</li>
              <li>Elige un nombre para tu proyecto, por ejemplo "baby-shower-gifts"</li>
              <li>Establece una contraseña segura para la base de datos</li>
              <li>Selecciona la región más cercana a ti</li>
              <li>Haz clic en "Create new project"</li>
            </ol>
          </CardContent>
        </Card>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Paso 2: Obtener las credenciales de API</CardTitle>
            <CardDescription>Necesitas obtener la URL y la clave anónima de tu proyecto de Supabase</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <ol className="list-decimal pl-5 space-y-3">
              <li>En el panel de Supabase, ve a "Settings" en el menú lateral</li>
              <li>Selecciona "API" en el submenú</li>
              <li>En la sección "Project URL", copia la URL del proyecto</li>
              <li>En la sección "Project API keys", copia la "anon public" key</li>
            </ol>
          </CardContent>
        </Card>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Paso 3: Configurar las variables de entorno</CardTitle>
            <CardDescription>Agrega estas variables de entorno a tu proyecto de Vercel</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="supabaseUrl">URL de Supabase</Label>
              <div className="flex mt-1">
                <Input
                  id="supabaseUrl"
                  value={supabaseUrl}
                  onChange={(e) => setSupabaseUrl(e.target.value)}
                  placeholder="https://xxxxxxxxxxxx.supabase.co"
                  className="flex-1"
                />
                <Button
                  variant="outline"
                  size="icon"
                  className="ml-2"
                  onClick={() => handleCopy("NEXT_PUBLIC_SUPABASE_URL=" + supabaseUrl, "url")}
                >
                  {copied === "url" ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>
            </div>

            <div>
              <Label htmlFor="supabaseKey">Clave anónima de Supabase</Label>
              <div className="flex mt-1">
                <Input
                  id="supabaseKey"
                  value={supabaseKey}
                  onChange={(e) => setSupabaseKey(e.target.value)}
                  placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                  className="flex-1"
                  type="password"
                />
                <Button
                  variant="outline"
                  size="icon"
                  className="ml-2"
                  onClick={() => handleCopy("NEXT_PUBLIC_SUPABASE_ANON_KEY=" + supabaseKey, "key")}
                >
                  {copied === "key" ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-md p-4 mt-4">
              <div className="flex">
                <AlertCircle className="h-5 w-5 text-amber-600 mr-2 flex-shrink-0" />
                <div>
                  <h4 className="text-sm font-medium text-amber-800">Importante</h4>
                  <div className="mt-1 text-sm text-amber-700">
                    <p>
                      Agrega estas variables de entorno a tu proyecto de Vercel en la sección "Environment Variables".
                      Para desarrollo local, crea un archivo <code className="bg-amber-100 px-1">.env.local</code> con
                      estas variables.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Paso 4: Crear las tablas en la base de datos</CardTitle>
            <CardDescription>Ejecuta el script SQL para crear las tablas necesarias</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <ol className="list-decimal pl-5 space-y-3">
              <li>En el panel de Supabase, ve a "SQL Editor" en el menú lateral</li>
              <li>Haz clic en "New Query"</li>
              <li>Copia y pega el siguiente SQL:</li>
            </ol>

            <div className="bg-gray-800 text-gray-100 p-4 rounded-md overflow-x-auto text-sm">
              <pre>{`-- Habilitar la extensión UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Crear la tabla de regalos con nombres de columnas snake_case (estándar PostgreSQL)
CREATE TABLE IF NOT EXISTS gifts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10, 2),
  external_link TEXT,
  reserved BOOLEAN DEFAULT FALSE,
  reserved_by TEXT,
  reserved_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insertar algunos datos de ejemplo
INSERT INTO gifts (name, description, price, external_link, reserved, created_at, updated_at)
VALUES 
  ('Cuna de madera', 'Cuna convertible de madera natural con colchón incluido', 25000, 'https://example.com/cuna', false, NOW(), NOW()),
  ('Cochecito de bebé', 'Cochecito 3 en 1 con silla para auto', 45000, null, false, NOW(), NOW()),
  ('Ropa de bebé (0-6 meses)', 'Set de bodys, pijamas y conjuntos para recién nacido', 8000, null, false, NOW(), NOW()),
  ('Monitor de bebé', 'Monitor con video y audio para vigilar al bebé', 15000, null, false, NOW(), NOW()),
  ('Bañera para bebé', 'Bañera ergonómica con soporte antideslizante', 5000, null, false, NOW(), NOW());`}</pre>
            </div>

            <Button
              onClick={() =>
                handleCopy(
                  `-- Habilitar la extensión UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Crear la tabla de regalos con nombres de columnas snake_case (estándar PostgreSQL)
CREATE TABLE IF NOT EXISTS gifts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10, 2),
  external_link TEXT,
  reserved BOOLEAN DEFAULT FALSE,
  reserved_by TEXT,
  reserved_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insertar algunos datos de ejemplo
INSERT INTO gifts (name, description, price, external_link, reserved, created_at, updated_at)
VALUES 
  ('Cuna de madera', 'Cuna convertible de madera natural con colchón incluido', 25000, 'https://example.com/cuna', false, NOW(), NOW()),
  ('Cochecito de bebé', 'Cochecito 3 en 1 con silla para auto', 45000, null, false, NOW(), NOW()),
  ('Ropa de bebé (0-6 meses)', 'Set de bodys, pijamas y conjuntos para recién nacido', 8000, null, false, NOW(), NOW()),
  ('Monitor de bebé', 'Monitor con video y audio para vigilar al bebé', 15000, null, false, NOW(), NOW()),
  ('Bañera para bebé', 'Bañera ergonómica con soporte antideslizante', 5000, null, false, NOW(), NOW());`,
                  "sql",
                )
              }
              className="w-full"
            >
              {copied === "sql" ? (
                <>
                  <Check className="mr-2 h-4 w-4" /> Copiado
                </>
              ) : (
                <>
                  <Copy className="mr-2 h-4 w-4" /> Copiar SQL
                </>
              )}
            </Button>

            <div className="mt-4">
              <ol className="list-decimal pl-5 space-y-3" start={4}>
                <li>Haz clic en "Run" para ejecutar el script</li>
                <li>Verifica que las tablas se hayan creado correctamente en la sección "Table Editor"</li>
              </ol>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Paso 5: ¡Listo!</CardTitle>
            <CardDescription>Tu aplicación ahora está conectada a la base de datos de Supabase</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600">
              Ahora puedes usar la aplicación con persistencia de datos. Los regalos y las reservas se guardarán en la
              base de datos y estarán disponibles incluso después de reiniciar la aplicación.
            </p>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="outline" onClick={() => (window.location.href = "/admin")}>
              Volver al panel de administración
            </Button>
            <Button onClick={() => (window.location.href = "/")}>Ir a la página principal</Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}

export default function SetupPage() {
  return (
    <AuthGuard>
      <SetupContent />
    </AuthGuard>
  )
}
