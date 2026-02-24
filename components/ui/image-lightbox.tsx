"use client"

import { useState, useRef, useEffect } from "react"
import { X } from "lucide-react"

interface ImageLightboxProps {
  src: string
  alt: string
  className?: string
  imgClassName?: string
  onError?: (e: React.SyntheticEvent<HTMLImageElement>) => void
}

export function ImageLightbox({ src, alt, className, imgClassName, onError }: ImageLightboxProps) {
  const [open, setOpen] = useState(false)
  const [errored, setErrored] = useState(false)
  const [scale, setScale] = useState(1)
  const [offset, setOffset] = useState({ x: 0, y: 0 })

  const containerRef = useRef<HTMLDivElement>(null)
  const scaleRef = useRef(1)
  const offsetRef = useRef({ x: 0, y: 0 })
  const lastTouchDistance = useRef<number | null>(null)
  const lastSingleTouch = useRef<{ x: number; y: number } | null>(null)

  function getTouchDistance(touches: TouchList) {
    const dx = touches[0].clientX - touches[1].clientX
    const dy = touches[0].clientY - touches[1].clientY
    return Math.sqrt(dx * dx + dy * dy)
  }

  // Register non-passive touch listeners on the container so we can call preventDefault
  useEffect(() => {
    if (!open || !containerRef.current) return
    const el = containerRef.current

    function onTouchStart(e: TouchEvent) {
      if (e.touches.length === 2) {
        lastTouchDistance.current = getTouchDistance(e.touches)
        lastSingleTouch.current = null
      } else if (e.touches.length === 1) {
        lastSingleTouch.current = { x: e.touches[0].clientX, y: e.touches[0].clientY }
        lastTouchDistance.current = null
      }
    }

    function onTouchMove(e: TouchEvent) {
      e.preventDefault()
      if (e.touches.length === 2 && lastTouchDistance.current !== null) {
        const newDist = getTouchDistance(e.touches)
        const delta = newDist / lastTouchDistance.current
        const newScale = Math.min(Math.max(scaleRef.current * delta, 1), 5)
        scaleRef.current = newScale
        lastTouchDistance.current = newDist
        setScale(newScale)
      } else if (e.touches.length === 1 && lastSingleTouch.current && scaleRef.current > 1) {
        const dx = e.touches[0].clientX - lastSingleTouch.current.x
        const dy = e.touches[0].clientY - lastSingleTouch.current.y
        offsetRef.current = { x: offsetRef.current.x + dx, y: offsetRef.current.y + dy }
        lastSingleTouch.current = { x: e.touches[0].clientX, y: e.touches[0].clientY }
        setOffset({ ...offsetRef.current })
      }
    }

    function onTouchEnd() {
      if (scaleRef.current <= 1.05) {
        scaleRef.current = 1
        offsetRef.current = { x: 0, y: 0 }
        setScale(1)
        setOffset({ x: 0, y: 0 })
      }
      lastTouchDistance.current = null
      lastSingleTouch.current = null
    }

    el.addEventListener("touchstart", onTouchStart, { passive: true })
    el.addEventListener("touchmove", onTouchMove, { passive: false })
    el.addEventListener("touchend", onTouchEnd, { passive: true })

    return () => {
      el.removeEventListener("touchstart", onTouchStart)
      el.removeEventListener("touchmove", onTouchMove)
      el.removeEventListener("touchend", onTouchEnd)
    }
  }, [open])

  // Lock body scroll while open
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : ""
    return () => { document.body.style.overflow = "" }
  }, [open])

  function handleOpen(e: React.MouseEvent) {
    e.stopPropagation()
    scaleRef.current = 1
    offsetRef.current = { x: 0, y: 0 }
    setScale(1)
    setOffset({ x: 0, y: 0 })
    setOpen(true)
  }

  function handleClose() {
    setOpen(false)
  }

  if (errored) return null

  return (
    <>
      <div
        className={className}
        onClick={handleOpen}
        style={{ cursor: "zoom-in" }}
      >
        <img
          src={src}
          alt={alt}
          className={imgClassName}
          onError={(e) => {
            setErrored(true)
            onError?.(e)
          }}
        />
      </div>

      {open && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center"
          onClick={handleClose}
        >
          <button
            className="absolute top-4 right-4 z-10 text-white bg-black/50 rounded-full p-2 hover:bg-black/70 transition-colors"
            onClick={(e) => { e.stopPropagation(); handleClose() }}
            aria-label="Cerrar"
          >
            <X className="h-6 w-6" />
          </button>

          <div
            ref={containerRef}
            className="w-full h-full flex items-center justify-center overflow-hidden select-none"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={src}
              alt={alt}
              draggable={false}
              style={{
                transform: `scale(${scale}) translate(${offset.x / scale}px, ${offset.y / scale}px)`,
                transformOrigin: "center",
                maxWidth: "100vw",
                maxHeight: "100vh",
                objectFit: "contain",
                touchAction: "none",
                userSelect: "none",
                pointerEvents: "none",
              }}
            />
          </div>

          <p className="absolute bottom-6 left-0 right-0 text-center text-white/40 text-xs pointer-events-none">
            Pellizca para hacer zoom · Toca fuera para cerrar
          </p>
        </div>
      )}
    </>
  )
}
