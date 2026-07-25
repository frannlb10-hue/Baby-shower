"use client"

// Hook para manejar configuraciones
import { useState, useEffect } from "react"

export interface AppSettings {
  title: string
  subtitle: string
  welcomeMessage: string
  primaryColor: string
  backgroundColor: string
  showPrices: boolean
  showImages: boolean
  allowReservations: boolean
  requireGuestName: boolean
  showReservedBy: boolean
  enableNotifications: boolean
  adminUrl: string
  sessionTimeout: number
  enableLogging: boolean
}

const DEFAULT_SETTINGS: AppSettings = {
  title: "Lista de Regalos",
  subtitle: "¡Bienvenido al Primer Añito de Emi! Elige un regalo para reservar",
  welcomeMessage: "Gracias por acompañarnos en este momento especial",
  primaryColor: "#3b82f6",
  backgroundColor: "#f8fafc",
  showPrices: true,
  showImages: true,
  allowReservations: true,
  requireGuestName: true,
  showReservedBy: true,
  enableNotifications: true,
  adminUrl: "/admin",
  sessionTimeout: 24,
  enableLogging: true,
}

// Cache de configuraciones en el cliente
let settingsCache: AppSettings | null = null
let cacheTimestamp = 0
const CACHE_DURATION = 5 * 60 * 1000 // 5 minutos

export async function getSettings(): Promise<AppSettings> {
  try {
    // Verificar cache
    const now = Date.now()
    if (settingsCache && now - cacheTimestamp < CACHE_DURATION) {
      return settingsCache
    }

    // Intentar cargar desde localStorage primero como respaldo
    try {
      const localSettings = localStorage.getItem("appSettings")
      if (localSettings) {
        const parsedSettings = JSON.parse(localSettings)
        console.log("Loaded settings from localStorage")
        settingsCache = parsedSettings
        cacheTimestamp = now
        return parsedSettings
      }
    } catch (err) {
      console.warn("Could not load settings from localStorage:", err)
    }

    console.log("Loading settings from API...")
    const response = await fetch("/api/settings", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      cache: "no-cache",
    })

    console.log("Get settings response status:", response.status)

    if (!response.ok) {
      console.error("Error loading settings:", response.status)
      return DEFAULT_SETTINGS
    }

    const settings = await response.json()
    console.log("Loaded settings from API:", settings)

    // Actualizar cache
    settingsCache = settings
    cacheTimestamp = now

    // También guardar en localStorage como respaldo
    try {
      localStorage.setItem("appSettings", JSON.stringify(settingsCache))
    } catch (err) {
      console.warn("Could not save settings to localStorage:", err)
    }

    return settings
  } catch (error) {
    console.error("Error loading settings:", error)

    // Intentar cargar desde localStorage como último recurso
    try {
      const localSettings = localStorage.getItem("appSettings")
      if (localSettings) {
        return JSON.parse(localSettings)
      }
    } catch (err) {
      console.warn("Could not load settings from localStorage as fallback:", err)
    }

    return DEFAULT_SETTINGS
  }
}

export async function saveSettings(settings: AppSettings): Promise<boolean> {
  try {
    console.log("Saving settings to API...", settings)
    const token = localStorage.getItem("adminToken")

    const response = await fetch("/api/settings", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token || ""}`,
      },
      body: JSON.stringify(settings),
    })

    console.log("Save settings response status:", response.status)

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      console.error("Error saving settings:", response.status, errorData)

      // Aunque la API falle, guardamos en localStorage
      try {
        localStorage.setItem("appSettings", JSON.stringify(settings))
        console.log("Settings saved to localStorage as fallback")
        return true
      } catch (err) {
        console.error("Could not save to localStorage either:", err)
        return false
      }
    }

    const result = await response.json()
    console.log("Save settings response:", result)

    // Actualizar cache
    settingsCache = result.settings || settings
    cacheTimestamp = Date.now()

    // Siempre guardar en localStorage como respaldo
    try {
      localStorage.setItem("appSettings", JSON.stringify(settingsCache))
    } catch (err) {
      console.warn("Could not save settings to localStorage:", err)
    }

    console.log("Settings saved successfully")
    return true
  } catch (error) {
    console.error("Error saving settings:", error)

    // Como último recurso, guardar en localStorage
    try {
      localStorage.setItem("appSettings", JSON.stringify(settings))
      console.log("Settings saved to localStorage as emergency fallback")
      return true
    } catch (err) {
      console.error("Could not save to localStorage either:", err)
      return false
    }
  }
}

// Hook para usar configuraciones en componentes React
export function useSettings() {
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadSettings = async () => {
    try {
      setLoading(true)
      setError(null)
      const loadedSettings = await getSettings()
      setSettings(loadedSettings)
    } catch (err) {
      console.error("Error in useSettings:", err)
      setError("Error al cargar configuraciones")
      setSettings(DEFAULT_SETTINGS)
    } finally {
      setLoading(false)
    }
  }

  const updateSettings = async (newSettings: AppSettings) => {
    try {
      const success = await saveSettings(newSettings)
      if (success) {
        setSettings(newSettings)
        return true
      }
      return false
    } catch (err) {
      console.error("Error updating settings:", err)
      return false
    }
  }

  useEffect(() => {
    loadSettings()
  }, [])

  return {
    settings,
    loading,
    error,
    updateSettings,
    reloadSettings: loadSettings,
  }
}

// Función para invalidar cache (útil después de guardar)
export function invalidateSettingsCache() {
  settingsCache = null
  cacheTimestamp = 0
}
