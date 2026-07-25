"use client"

import { AuthGuard } from "@/components/auth-guard"
import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {
  Baby,
  Plus,
  Pencil,
  Trash2,
  Download,
  RefreshCw,
  Users,
  Settings,
  Gift as GiftIcon,
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import type { Gift } from "@/types/gift"
import { ImageLightbox } from "@/components/ui/image-lightbox"

function AdminContent() {
  const [gifts, setGifts] = useState<Gift[]>([])
  const [loading, setLoading] = useState(true)
  const [exporting, setExporting] = useState(false)

  // Add/Edit dialog
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingGift, setEditingGift] = useState<Gift | null>(null)
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    external_link: "",
    image_url: "",
  })

  // Delete dialog
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [deletingGift, setDeletingGift] = useState<Gift | null>(null)
  const [deleting, setDeleting] = useState(false)

  const { toast } = useToast()

  useEffect(() => {
    fetchGifts()
  }, [])

  const getToken = () => localStorage.getItem("adminToken") || ""

  const fetchGifts = async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/gifts")
      if (!response.ok) throw new Error(`HTTP ${response.status}`)
      const data = await response.json()
      if (Array.isArray(data)) setGifts(data)
    } catch (error) {
      toast({ title: "Error", description: "No se pudieron cargar los regalos", variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }

  const openAddDialog = () => {
    setEditingGift(null)
    setFormData({ name: "", description: "", price: "", external_link: "", image_url: "" })
    setDialogOpen(true)
  }

  const openEditDialog = (gift: Gift) => {
    setEditingGift(gift)
    setFormData({
      name: gift.name,
      description: gift.description || "",
      price: gift.price?.toString() || "",
      external_link: gift.external_link || "",
      image_url: gift.image_url || "",
    })
    setDialogOpen(true)
  }

  const handleSave = async () => {
    if (!formData.name.trim()) {
      toast({ title: "Campo requerido", description: "El nombre del regalo es obligatorio", variant: "destructive" })
      return
    }
    try {
      setSaving(true)
      const url = editingGift ? `/api/gifts/${editingGift.id}` : "/api/gifts"
      const method = editingGift ? "PUT" : "POST"
      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify({
          name: formData.name.trim(),
          description: formData.description.trim() || null,
          price: formData.price ? parseFloat(formData.price) : null,
          external_link: formData.external_link.trim() || null,
          image_url: formData.image_url.trim() || null,
        }),
      })
      if (!response.ok) {
        const err = await response.json()
        throw new Error(err.error || `HTTP ${response.status}`)
      }
      toast({
        title: editingGift ? "Regalo actualizado" : "Regalo agregado",
        description: editingGift ? "Los cambios se guardaron correctamente" : "El regalo fue agregado a la lista",
      })
      setDialogOpen(false)
      await fetchGifts()
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "No se pudo guardar el regalo",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  const openDeleteDialog = (gift: Gift) => {
    setDeletingGift(gift)
    setDeleteDialogOpen(true)
  }

  const handleDelete = async () => {
    if (!deletingGift) return
    try {
      setDeleting(true)
      const response = await fetch(`/api/gifts/${deletingGift.id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${getToken()}` },
      })
      if (!response.ok) {
        const err = await response.json()
        throw new Error(err.error || `HTTP ${response.status}`)
      }
      toast({ title: "Regalo eliminado", description: `"${deletingGift.name}" fue eliminado correctamente` })
      setDeleteDialogOpen(false)
      setDeletingGift(null)
      await fetchGifts()
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "No se pudo eliminar el regalo",
        variant: "destructive",
      })
    } finally {
      setDeleting(false)
    }
  }

  const handleExport = async () => {
    try {
      setExporting(true)
      const response = await fetch("/api/gifts/export", {
        headers: { Authorization: `Bearer ${getToken()}` },
      })
      if (!response.ok) throw new Error(`HTTP ${response.status}`)
      const blob = await response.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `lista-regalos-${new Date().toISOString().split("T")[0]}.xlsx`
      a.click()
      URL.revokeObjectURL(url)
      toast({ title: "Exportado", description: "La lista se descargó correctamente" })
    } catch (error) {
      toast({ title: "Error", description: "No se pudo exportar la lista", variant: "destructive" })
    } finally {
      setExporting(false)
    }
  }

  const available = gifts.filter((g) => !g.reserved).length
  const reserved = gifts.filter((g) => g.reserved).length

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-rose-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
          <div className="flex items-center gap-3">
            <Baby className="h-8 w-8 text-pink-600" />
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Panel de Administración</h1>
              <p className="text-sm text-gray-500">Gestión de lista de regalos</p>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <Button variant="outline" size="sm" onClick={() => (window.location.href = "/")}>
              <Users className="h-4 w-4 mr-2" />
              Vista invitados
            </Button>
            <Button variant="outline" size="sm" onClick={() => (window.location.href = "/admin/settings/debug")}>
              <Settings className="h-4 w-4 mr-2" />
              Configuraciones
            </Button>
            <Button variant="outline" size="sm" onClick={handleExport} disabled={exporting}>
              {exporting ? <RefreshCw className="h-4 w-4 mr-2 animate-spin" /> : <Download className="h-4 w-4 mr-2" />}
              Exportar Excel
            </Button>
            <Button onClick={openAddDialog} className="bg-pink-600 hover:bg-pink-700">
              <Plus className="h-4 w-4 mr-2" />
              Agregar regalo
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <Card>
            <CardContent className="pt-6 text-center">
              <p className="text-3xl font-bold text-gray-800">{gifts.length}</p>
              <p className="text-sm text-gray-500 mt-1">Total regalos</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6 text-center">
              <p className="text-3xl font-bold text-pink-600">{available}</p>
              <p className="text-sm text-gray-500 mt-1">Disponibles</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6 text-center">
              <p className="text-3xl font-bold text-pink-600">{reserved}</p>
              <p className="text-sm text-gray-500 mt-1">Reservados</p>
            </CardContent>
          </Card>
        </div>

        {/* Gift list */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <GiftIcon className="h-5 w-5 text-pink-600" />
              Lista de Regalos
            </CardTitle>
            <Button variant="ghost" size="sm" onClick={fetchGifts} disabled={loading}>
              <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            </Button>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-12 text-gray-400">
                <RefreshCw className="h-8 w-8 mx-auto mb-3 animate-spin" />
                <p>Cargando regalos...</p>
              </div>
            ) : gifts.length === 0 ? (
              <div className="text-center py-12 text-gray-400">
                <GiftIcon className="h-12 w-12 mx-auto mb-3 opacity-30" />
                <p className="text-lg mb-4">No hay regalos todavía</p>
                <Button onClick={openAddDialog} className="bg-pink-600 hover:bg-pink-700">
                  <Plus className="h-4 w-4 mr-2" />
                  Agregar el primer regalo
                </Button>
              </div>
            ) : (
              <div className="space-y-2">
                {gifts.map((gift) => (
                  <div
                    key={gift.id}
                    className="flex items-center justify-between p-3 rounded-lg border bg-white hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      {gift.image_url && (
                        <ImageLightbox
                          src={gift.image_url}
                          alt={gift.name}
                          className="h-10 w-10 rounded overflow-hidden flex-shrink-0"
                          imgClassName="h-full w-full object-cover"
                        />
                      )}
                      <div className="min-w-0">
                        <p className="font-medium text-gray-800 truncate">{gift.name}</p>
                        <div className="flex items-center gap-2 flex-wrap">
                          {gift.price && (
                            <span className="text-sm text-pink-600">${gift.price.toLocaleString()}</span>
                          )}
                          {gift.description && (
                            <span className="text-xs text-gray-400 truncate max-w-xs">{gift.description}</span>
                          )}
                        </div>
                        {gift.reserved && (
                          <p className="text-xs text-pink-600 mt-0.5">Reservado por: {gift.reserved_by}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0 ml-3">
                      <Badge
                        variant="outline"
                        className={gift.reserved ? "bg-pink-50 text-pink-700" : "bg-pink-50 text-pink-600"}
                      >
                        {gift.reserved ? "Reservado" : "Disponible"}
                      </Badge>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openEditDialog(gift)}
                        className="text-gray-500 hover:text-blue-600"
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openDeleteDialog(gift)}
                        className="text-gray-500 hover:text-red-600"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editingGift ? "Editar Regalo" : "Agregar Regalo"}</DialogTitle>
            <DialogDescription>
              {editingGift ? "Modificá los datos del regalo" : "Completá los datos del nuevo regalo"}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <Label htmlFor="name">Nombre *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData((f) => ({ ...f, name: e.target.value }))}
                placeholder="Ej: Cochecito de paseo"
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="description">Descripción</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData((f) => ({ ...f, description: e.target.value }))}
                placeholder="Descripción opcional"
                rows={2}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="price">Precio</Label>
              <Input
                id="price"
                type="number"
                value={formData.price}
                onChange={(e) => setFormData((f) => ({ ...f, price: e.target.value }))}
                placeholder="Ej: 15000"
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="external_link">Link del producto</Label>
              <Input
                id="external_link"
                type="url"
                value={formData.external_link}
                onChange={(e) => setFormData((f) => ({ ...f, external_link: e.target.value }))}
                placeholder="https://..."
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="image_url">URL de imagen</Label>
              <Input
                id="image_url"
                type="url"
                value={formData.image_url}
                onChange={(e) => setFormData((f) => ({ ...f, image_url: e.target.value }))}
                placeholder="https://..."
                className="mt-1"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)} disabled={saving}>
              Cancelar
            </Button>
            <Button onClick={handleSave} disabled={saving} className="bg-pink-600 hover:bg-pink-700">
              {saving ? (
                <><RefreshCw className="h-4 w-4 mr-2 animate-spin" />Guardando...</>
              ) : (
                editingGift ? "Guardar cambios" : "Agregar regalo"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar regalo?</AlertDialogTitle>
            <AlertDialogDescription>
              Vas a eliminar <strong>{deletingGift?.name}</strong>. Esta acción no se puede deshacer.
              {deletingGift?.reserved && (
                <span className="block mt-2 text-amber-600 font-medium">
                  Este regalo tiene una reserva activa de {deletingGift.reserved_by}.
                </span>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleting}
              className="bg-red-500 hover:bg-red-600"
            >
              {deleting ? "Eliminando..." : "Eliminar"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

export default function AdminPage() {
  return (
    <AuthGuard>
      <AdminContent />
    </AuthGuard>
  )
}
