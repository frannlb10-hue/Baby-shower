import type { Gift } from "@/types/gift"

// Datos de ejemplo para usar cuando no hay conexión a la base de datos
export const FALLBACK_GIFTS: Gift[] = [
  {
    id: "1",
    name: "Cuna de madera",
    description: "Cuna de madera natural para bebé",
    price: 299.99,
    external_link: "https://ejemplo.com/cuna",
    image_url: "https://via.placeholder.com/300x200?text=Cuna+de+madera",
    reserved: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "2",
    name: "Set de biberones",
    description: "Set de 3 biberones anti-cólicos",
    price: 49.99,
    external_link: "https://ejemplo.com/biberones",
    image_url: "https://via.placeholder.com/300x200?text=Set+de+biberones",
    reserved: true,
    reserved_by: "Ana García",
    reserved_at: new Date().toISOString(),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "3",
    name: "Cambiador portátil",
    description: "Cambiador portátil con bolsillos para pañales y toallitas",
    price: 39.99,
    external_link: "https://ejemplo.com/cambiador",
    image_url: "https://via.placeholder.com/300x200?text=Cambiador+portátil",
    reserved: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
]
