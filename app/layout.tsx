import type React from "react"
import type { Metadata } from "next"
import { Nunito } from "next/font/google"
import "./globals.css"
import { Toaster } from "@/components/ui/toaster"

const nunito = Nunito({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-nunito",
})

export const metadata: Metadata = {
  title: "Primer Añito de Emi - Lista de Regalos",
  description: "Aplicación para gestionar la lista de regalos del Primer Añito de Emi",
  generator: "v0.dev",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="es" className={nunito.variable}>
      <body className="font-nunito">
        {children}
        <Toaster />
      </body>
    </html>
  )
}
