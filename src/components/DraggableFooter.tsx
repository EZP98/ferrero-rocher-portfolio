import { useRef, useState, useEffect } from 'react'
import { gsap } from 'gsap'

interface Ferrero {
  id: number
  x: number
  y: number
  rotation: number
  scale: number
}

// Pure CSS Ferrero Rocher component - no WebGL!
function CSSFerrero({ rotation, scale, isDragging }: { rotation: number; scale: number; isDragging: boolean }) {
  return (
    <div
      className="w-full h-full relative"
      style={{
        transform: `rotate(${rotation}deg) scale(${scale})`,
        transition: isDragging ? 'none' : 'transform 0.1s ease-out',
      }}
    >
      {/* Pirottino marrone (paper cup base) */}
      <div
        className="absolute bottom-0 left-1/2 -translate-x-1/2"
        style={{
          width: '44px',
          height: '16px',
          background: 'linear-gradient(180deg, #6b4423 0%, #4a2c17 50%, #2d1a0f 100%)',
          borderRadius: '0 0 50% 50% / 0 0 100% 100%',
          boxShadow: 'inset 0 -4px 8px rgba(0,0,0,0.5), inset 0 2px 3px rgba(139,105,80,0.3)',
        }}
      >
        {/* Pleats in paper cup */}
        {[...Array(14)].map((_, i) => (
          <div
            key={i}
            className="absolute bottom-0"
            style={{
              left: `${(i / 14) * 100}%`,
              width: '1px',
              height: '100%',
              background: 'linear-gradient(180deg, rgba(107,68,35,0.6) 0%, rgba(45,26,15,0.9) 100%)',
            }}
          />
        ))}
      </div>

      {/* Golden chocolate sphere */}
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2"
        style={{
          width: '42px',
          height: '42px',
          borderRadius: '50%',
          background: `
            radial-gradient(circle at 28% 28%, #ffe9a8 0%, transparent 30%),
            radial-gradient(circle at 72% 35%, #f0d78a 0%, transparent 25%),
            radial-gradient(circle at 50% 50%, #e5c45a 0%, #d4a853 30%, #b8923f 55%, #8b6914 85%, #5a4510 100%)
          `,
          boxShadow: `
            inset -7px -7px 18px rgba(0,0,0,0.4),
            inset 5px 5px 12px rgba(255,240,180,0.35),
            0 5px 15px rgba(0,0,0,0.5),
            0 0 25px rgba(212,168,83,0.2)
          `,
        }}
      >
        {/* Hazelnut pieces texture */}
        {[...Array(10)].map((_, i) => {
          const angle = (i / 10) * Math.PI * 2 + 0.3
          const radius = 13 + (i % 3) * 2
          const size = 5 + (i % 2) * 2
          return (
            <div
              key={i}
              className="absolute rounded-full"
              style={{
                width: `${size}px`,
                height: `${size}px`,
                left: `${21 + Math.cos(angle) * radius - size/2}px`,
                top: `${21 + Math.sin(angle) * radius - size/2}px`,
                background: `radial-gradient(circle at 35% 35%, #d4a853 0%, #8b6914 60%, #5a4510 100%)`,
                boxShadow: 'inset -1px -1px 3px rgba(0,0,0,0.35), inset 1px 1px 2px rgba(255,220,150,0.25)',
              }}
            />
          )
        })}

        {/* Main highlight */}
        <div
          className="absolute"
          style={{
            width: '14px',
            height: '10px',
            left: '9px',
            top: '7px',
            background: 'radial-gradient(ellipse, rgba(255,255,255,0.55) 0%, transparent 70%)',
            borderRadius: '50%',
            transform: 'rotate(-25deg)',
          }}
        />

        {/* Secondary highlight */}
        <div
          className="absolute"
          style={{
            width: '6px',
            height: '5px',
            right: '10px',
            top: '12px',
            background: 'radial-gradient(ellipse, rgba(255,255,255,0.25) 0%, transparent 70%)',
            borderRadius: '50%',
          }}
        />
      </div>
    </div>
  )
}

export function DraggableFooter() {
  const containerRef = useRef<HTMLDivElement>(null)
  const [ferreros, setFerreros] = useState<Ferrero[]>([])
  const [dragging, setDragging] = useState<number | null>(null)
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })

  useEffect(() => {
    const generateFerreros = () => {
      const count = 18
      const newFerreros: Ferrero[] = []
      const containerWidth = containerRef.current?.offsetWidth || window.innerWidth

      for (let i = 0; i < count; i++) {
        newFerreros.push({
          id: i,
          x: Math.random() * (containerWidth - 80) + 40,
          y: 25 + Math.random() * 110,
          rotation: Math.random() * 30 - 15,
          scale: 0.7 + Math.random() * 0.4,
        })
      }
      setFerreros(newFerreros)
    }

    generateFerreros()
    window.addEventListener('resize', generateFerreros)
    return () => window.removeEventListener('resize', generateFerreros)
  }, [])

  const handleMouseDown = (e: React.MouseEvent, id: number) => {
    const ferrero = ferreros.find(f => f.id === id)
    if (!ferrero) return
    setDragging(id)
    setDragOffset({ x: e.clientX - ferrero.x, y: e.clientY - ferrero.y })
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (dragging === null) return
    const containerRect = containerRef.current?.getBoundingClientRect()
    if (!containerRect) return

    setFerreros(prev =>
      prev.map(f =>
        f.id === dragging
          ? {
              ...f,
              x: Math.max(30, Math.min(containerRect.width - 30, e.clientX - dragOffset.x)),
              y: Math.max(25, Math.min(containerRect.height - 25, e.clientY - dragOffset.y)),
              rotation: f.rotation + e.movementX * 1.5,
            }
          : f
      )
    )
  }

  const handleMouseUp = () => {
    if (dragging !== null) {
      const el = document.getElementById(`ferrero-${dragging}`)
      if (el) {
        gsap.to(el, { scale: 1.15, duration: 0.12, yoyo: true, repeat: 1, ease: 'power2.out' })
      }
    }
    setDragging(null)
  }

  const handleTouchStart = (e: React.TouchEvent, id: number) => {
    const touch = e.touches[0]
    const ferrero = ferreros.find(f => f.id === id)
    if (!ferrero) return
    setDragging(id)
    setDragOffset({ x: touch.clientX - ferrero.x, y: touch.clientY - ferrero.y })
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    if (dragging === null) return
    const touch = e.touches[0]
    const containerRect = containerRef.current?.getBoundingClientRect()
    if (!containerRect) return

    setFerreros(prev =>
      prev.map(f =>
        f.id === dragging
          ? {
              ...f,
              x: Math.max(30, Math.min(containerRect.width - 30, touch.clientX - dragOffset.x)),
              y: Math.max(25, Math.min(containerRect.height - 25, touch.clientY - dragOffset.y)),
            }
          : f
      )
    )
  }

  return (
    <footer className="relative z-30 bg-[#0d0906] py-6">
      <div
        ref={containerRef}
        className="relative h-44 overflow-hidden cursor-grab active:cursor-grabbing"
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleMouseUp}
      >
        {/* Background text */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <span className="text-white/[0.03] text-2xl md:text-4xl font-bold uppercase tracking-widest">
            Trascina i Rocher
          </span>
        </div>

        {/* Draggable CSS Ferreros */}
        {ferreros.map((ferrero) => (
          <div
            key={ferrero.id}
            id={`ferrero-${ferrero.id}`}
            className={`absolute cursor-grab active:cursor-grabbing select-none ${
              dragging === ferrero.id ? 'z-50' : 'z-10'
            }`}
            style={{
              left: ferrero.x,
              top: ferrero.y,
              width: '55px',
              height: '55px',
              transform: 'translate(-50%, -50%)',
            }}
            onMouseDown={(e) => handleMouseDown(e, ferrero.id)}
            onTouchStart={(e) => handleTouchStart(e, ferrero.id)}
          >
            <CSSFerrero
              rotation={ferrero.rotation}
              scale={ferrero.scale}
              isDragging={dragging === ferrero.id}
            />
          </div>
        ))}
      </div>

      {/* Footer content */}
      <div className="max-w-7xl mx-auto px-6 lg:px-12 pt-6 border-t border-white/10">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="text-center md:text-left">
            <p className="text-[var(--color-gold)] font-semibold mb-1">Ferrero Rocher</p>
            <p className="text-white/40 text-sm">
              © {new Date().getFullYear()} Ferrero SpA. Tutti i diritti riservati.
            </p>
          </div>
          <div className="flex items-center gap-4 text-white/40 text-sm">
            <span>Alba, Piemonte</span>
            <span className="text-[var(--color-gold)]">•</span>
            <span>Dal 1982</span>
            <span className="text-[var(--color-gold)]">•</span>
            <span>Made in Italy</span>
          </div>
        </div>
      </div>
    </footer>
  )
}
