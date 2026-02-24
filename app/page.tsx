"use client"

import { useState, useEffect } from "react"
import type { Gift } from "@/types/gift"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { ExternalLink, Baby, Gift as GiftIcon, Heart, Check } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export default function GuestPage() {
  const [gifts, setGifts] = useState<Gift[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedGift, setSelectedGift] = useState<Gift | null>(null)
  const [guestName, setGuestName] = useState("")
  const [reserving, setReserving] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    fetchGifts()
  }, [])

  const fetchGifts = async () => {
    try {
      const response = await fetch("/api/gifts")

      if (!response.ok) {
        throw new Error(`Error HTTP: ${response.status}`)
      }

      const data = await response.json()

      if (Array.isArray(data)) {
        setGifts(data)
      }
    } catch (error) {
      console.error("Error fetching gifts:", error)
      toast({
        title: "Error",
        description: "No se pudieron cargar los regalos",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleReserve = async () => {
    if (!selectedGift || !guestName.trim()) {
      toast({
        title: "Nombre requerido",
        description: "Por favor ingresa tu nombre para reservar el regalo",
        variant: "destructive",
      })
      return
    }

    try {
      setReserving(true)

      const response = await fetch("/api/gifts/reserve", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          giftId: selectedGift.id,
          guestName: guestName.trim(),
        }),
      })

      if (response.ok) {
        toast({
          title: "Regalo reservado",
          description: `Has reservado "${selectedGift.name}" exitosamente`,
        })
        setSelectedGift(null)
        setGuestName("")
        await fetchGifts()
      } else {
        const errorData = await response.json()
        toast({
          title: "Error",
          description: errorData.error || "No se pudo reservar el regalo",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Ocurrió un error al reservar el regalo",
        variant: "destructive",
      })
    } finally {
      setReserving(false)
    }
  }

  const availableGifts = gifts.filter((gift) => !gift.reserved)
  const reservedGifts = gifts.filter((gift) => gift.reserved)

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <Baby className="h-12 w-12 mx-auto mb-4 text-pink-500 animate-bounce" />
          <p className="text-lg text-gray-600">Cargando lista de regalos...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-4">
            <Baby className="h-16 w-16 text-pink-500" />
          </div>
          <h1 className="text-4xl font-bold text-gray-800 mb-2">Baby Shower</h1>
          <p className="text-lg text-gray-600 mb-4">Lista de Regalos</p>
          <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
            <GiftIcon className="h-4 w-4" />
            <span>{availableGifts.length} disponibles</span>
            <span className="mx-2">|</span>
            <Check className="h-4 w-4" />
            <span>{reservedGifts.length} reservados</span>
          </div>
        </div>

        {/* Available Gifts */}
        {availableGifts.length > 0 && (
          <div className="mb-12">
            <h2 className="text-2xl font-semibold text-gray-800 mb-6 flex items-center">
              <GiftIcon className="h-6 w-6 mr-2 text-pink-500" />
              Regalos Disponibles
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {availableGifts.map((gift) => (
                <Card
                  key={gift.id}
                  className="relative overflow-hidden hover:shadow-lg transition-shadow cursor-pointer border-2 border-transparent hover:border-pink-200"
                  onClick={() => setSelectedGift(gift)}
                >
                  {gift.image_url && (
                    <div className="h-48 overflow-hidden">
                      <img
                        src={gift.image_url}
                        alt={gift.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.currentTarget.style.display = "none"
                        }}
                      />
                    </div>
                  )}
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <CardTitle className="text-lg font-semibold text-gray-800 flex-1">
                        {gift.name}
                      </CardTitle>
                      <Badge className="bg-green-100 text-green-700">Disponible</Badge>
                    </div>
                    {gift.description && (
                      <CardDescription className="text-gray-600">{gift.description}</CardDescription>
                    )}
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="space-y-3">
                      {gift.price && (
                        <p className="text-lg font-semibold text-green-600">
                          ${gift.price.toLocaleString()}
                        </p>
                      )}

                      {gift.external_link && (
                        <a
                          href={gift.external_link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center text-blue-600 hover:text-blue-800 text-sm"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <ExternalLink className="h-4 w-4 mr-1" />
                          Ver producto
                        </a>
                      )}

                      <Button
                        className="w-full bg-pink-500 hover:bg-pink-600"
                        onClick={(e) => {
                          e.stopPropagation()
                          setSelectedGift(gift)
                        }}
                      >
                        <Heart className="h-4 w-4 mr-2" />
                        Reservar este regalo
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Reserved Gifts */}
        {reservedGifts.length > 0 && (
          <div>
            <h2 className="text-2xl font-semibold text-gray-800 mb-6 flex items-center">
              <Check className="h-6 w-6 mr-2 text-gray-400" />
              Regalos Ya Reservados
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {reservedGifts.map((gift) => (
                <Card key={gift.id} className="relative overflow-hidden opacity-75">
                  {gift.image_url && (
                    <div className="h-48 overflow-hidden grayscale">
                      <img
                        src={gift.image_url}
                        alt={gift.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.currentTarget.style.display = "none"
                        }}
                      />
                    </div>
                  )}
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <CardTitle className="text-lg font-semibold text-gray-600 flex-1">
                        {gift.name}
                      </CardTitle>
                      <Badge variant="secondary" className="bg-gray-100 text-gray-600">
                        Reservado
                      </Badge>
                    </div>
                    {gift.description && (
                      <CardDescription className="text-gray-500">{gift.description}</CardDescription>
                    )}
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="bg-gray-50 p-2 rounded text-sm">
                      <p className="text-gray-600">
                        <strong>Reservado por:</strong> {gift.reserved_by}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* No gifts message */}
        {gifts.length === 0 && (
          <div className="text-center py-12">
            <Baby className="h-16 w-16 mx-auto mb-4 text-gray-400" />
            <p className="text-xl text-gray-500 mb-4">No hay regalos en la lista todavía</p>
            <p className="text-gray-400">Vuelve pronto para ver los regalos disponibles</p>
          </div>
        )}

        {/* Reserve Dialog */}
        <Dialog open={!!selectedGift} onOpenChange={(open) => !open && setSelectedGift(null)}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Reservar Regalo</DialogTitle>
              <DialogDescription>
                Vas a reservar: <strong>{selectedGift?.name}</strong>
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <Label htmlFor="guestName">Tu nombre *</Label>
                <Input
                  id="guestName"
                  value={guestName}
                  onChange={(e) => setGuestName(e.target.value)}
                  placeholder="Ingresa tu nombre"
                  className="mt-1"
                  required
                />
              </div>
              <p className="text-sm text-gray-500">
                Al reservar este regalo, te comprometes a traerlo al Baby Shower.
              </p>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setSelectedGift(null)
                  setGuestName("")
                }}
                disabled={reserving}
              >
                Cancelar
              </Button>
              <Button
                onClick={handleReserve}
                disabled={reserving || !guestName.trim()}
                className="bg-pink-500 hover:bg-pink-600"
              >
                {reserving ? "Reservando..." : "Confirmar Reserva"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
