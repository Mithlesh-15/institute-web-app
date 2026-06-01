import { useState, useRef, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { ZoomIn, ZoomOut, RotateCcw, X } from 'lucide-react'

export default function ImageLightbox({ open, src, onClose }) {
  const [scale, setScale] = useState(1)
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const dragStart = useRef({ x: 0, y: 0 })
  const imgRef = useRef(null)

  useEffect(() => {
    if (!open) return
    // Reset values when a new image is loaded or lightbox opens
    setScale(1)
    setPosition({ x: 0, y: 0 })
  }, [open, src])

  // Prevent scroll on body when lightbox is active
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [open])

  if (!open || !src) return null

  const handleZoomIn = () => {
    setScale((prev) => Math.min(prev + 0.25, 4))
  }

  const handleZoomOut = () => {
    setScale((prev) => {
      const next = Math.max(prev - 0.25, 1)
      if (next === 1) {
        setPosition({ x: 0, y: 0 }) // Reset panning when zoomed out to 1x
      }
      return next
    })
  }

  const handleReset = () => {
    setScale(1)
    setPosition({ x: 0, y: 0 })
  }

  const handleMouseDown = (e) => {
    if (scale <= 1) return
    e.preventDefault()
    setIsDragging(true)
    dragStart.current = { x: e.clientX - position.x, y: e.clientY - position.y }
  }

  const handleMouseMove = (e) => {
    if (!isDragging || scale <= 1) return
    e.preventDefault()
    const newX = e.clientX - dragStart.current.x
    const newY = e.clientY - dragStart.current.y
    setPosition({ x: newX, y: newY })
  }

  const handleMouseUp = () => {
    setIsDragging(false)
  }

  // Touch drag support for mobile
  const handleTouchStart = (e) => {
    if (scale <= 1 || e.touches.length !== 1) return
    const touch = e.touches[0]
    setIsDragging(true)
    dragStart.current = { x: touch.clientX - position.x, y: touch.clientY - position.y }
  }

  const handleTouchMove = (e) => {
    if (!isDragging || scale <= 1 || e.touches.length !== 1) return
    const touch = e.touches[0]
    const newX = touch.clientX - dragStart.current.x
    const newY = touch.clientY - dragStart.current.y
    setPosition({ x: newX, y: newY })
  }

  const lightboxContent = (
    <div
      className="fixed inset-0 flex flex-col items-center justify-center bg-black/95 backdrop-blur-md transition-all duration-300"
      style={{ zIndex: 99999 }}
    >
      {/* Controls Header */}
      <div
        className="absolute top-0 left-0 right-0 flex items-center justify-between p-4 bg-gradient-to-b from-black/80 to-transparent select-none"
        style={{ zIndex: 100000 }}
      >
        <span className="text-sm font-semibold text-slate-300">
          Zoom: {Math.round(scale * 100)}%
        </span>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleZoomOut}
            disabled={scale <= 1}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 disabled:opacity-30 transition-all duration-200"
            title="Zoom Out"
          >
            <ZoomOut className="h-5 w-5" />
          </button>
          <button
            type="button"
            onClick={handleZoomIn}
            disabled={scale >= 4}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 disabled:opacity-30 transition-all duration-200"
            title="Zoom In"
          >
            <ZoomIn className="h-5 w-5" />
          </button>
          <button
            type="button"
            onClick={handleReset}
            disabled={scale === 1 && position.x === 0 && position.y === 0}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 disabled:opacity-30 transition-all duration-200"
            title="Reset Zoom"
          >
            <RotateCcw className="h-5 w-5" />
          </button>
          <button
            type="button"
            onClick={onClose}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-red-500 text-white hover:bg-red-600 transition-all duration-200 shadow-md"
            title="Close Lightbox"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Interactive Drag & Drop / Pan Viewport */}
      <div
        className={`relative h-full w-full overflow-hidden flex items-center justify-center select-none ${
          scale > 1 ? 'cursor-grab active:cursor-grabbing' : 'cursor-default'
        }`}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleMouseUp}
      >
        <img
          ref={imgRef}
          src={src}
          alt="Lightbox preview"
          style={{
            transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
            transition: isDragging ? 'none' : 'transform 0.15s ease-out',
            maxHeight: '85vh',
            maxWidth: '90vw',
            objectFit: 'contain',
            userSelect: 'none',
            pointerEvents: 'auto',
          }}
          draggable="false"
        />
      </div>
    </div>
  )

  return createPortal(lightboxContent, document.body)
}
