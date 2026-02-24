export interface Gift {
  id: string
  name: string
  description?: string | null
  price?: number | null
  external_link?: string | null
  image_url?: string | null
  reserved: boolean
  reserved_by?: string | null
  reserved_at?: string | null
  created_at: string
  updated_at: string
}
