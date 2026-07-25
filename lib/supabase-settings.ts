import { supabaseServer } from "@/lib/supabase"
import type { AppSettings } from "@/lib/settings"

// Función para obtener configuraciones desde Supabase
export async function getAppSettings(): Promise<AppSettings | null> {
  try {
    const { data, error } = await supabaseServer
      .from("app_settings")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(1)
      .single()

    if (error) {
      if (error.code === "PGRST116") {
        // No hay registros, devolver null para usar configuración por defecto
        console.log("No settings found in database")
        return null
      }
      throw error
    }

    // Convertir los datos de la base de datos al formato de AppSettings
    return {
      title: data.title || "Lista de Regalos",
      subtitle: data.subtitle || "¡Bienvenido al Primer Añito de Emi! Elige un regalo para reservar",
      welcomeMessage: data.welcome_message || "Gracias por acompañarnos en este momento especial",
      primaryColor: data.primary_color || "#3b82f6",
      backgroundColor: data.background_color || "#f8fafc",
      showPrices: data.show_prices ?? true,
      showImages: data.show_images ?? true,
      allowReservations: data.allow_reservations ?? true,
      requireGuestName: data.require_guest_name ?? true,
      showReservedBy: data.show_reserved_by ?? true,
      enableNotifications: data.enable_notifications ?? true,
      adminUrl: data.admin_url || "/admin",
      sessionTimeout: data.session_timeout || 24,
      enableLogging: data.enable_logging ?? true,
    }
  } catch (error) {
    console.error("Error getting app settings:", error)
    return null
  }
}

// Función para guardar configuraciones en Supabase
export async function saveAppSettings(settings: AppSettings): Promise<void> {
  try {
    // Convertir AppSettings al formato de la base de datos
    const dbSettings = {
      title: settings.title,
      subtitle: settings.subtitle,
      welcome_message: settings.welcomeMessage,
      primary_color: settings.primaryColor,
      background_color: settings.backgroundColor,
      show_prices: settings.showPrices,
      show_images: settings.showImages,
      allow_reservations: settings.allowReservations,
      require_guest_name: settings.requireGuestName,
      show_reserved_by: settings.showReservedBy,
      enable_notifications: settings.enableNotifications,
      admin_url: settings.adminUrl,
      session_timeout: settings.sessionTimeout,
      enable_logging: settings.enableLogging,
      updated_at: new Date().toISOString(),
    }

    // Primero intentamos actualizar el registro existente
    const { data: existingData } = await supabaseServer
      .from("app_settings")
      .select("id")
      .order("created_at", { ascending: false })
      .limit(1)
      .single()

    if (existingData) {
      // Actualizar registro existente
      const { error } = await supabaseServer.from("app_settings").update(dbSettings).eq("id", existingData.id)

      if (error) {
        throw error
      }
    } else {
      // Crear nuevo registro
      const { error } = await supabaseServer
        .from("app_settings")
        .insert([{ ...dbSettings, created_at: new Date().toISOString() }])

      if (error) {
        throw error
      }
    }

    console.log("Settings saved to Supabase successfully")
  } catch (error) {
    console.error("Error saving app settings:", error)
    throw error
  }
}
