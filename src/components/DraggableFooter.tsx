import { useRef, useState, useEffect } from 'react'
import { gsap } from 'gsap'

interface Ferrero {
  id: number
  x: number
  y: number
  rotation: number
  scale: number
}

export function DraggableFooter() {
  const containerRef = useRef<HTMLDivElement>(null)
  const [ferreros, setFerreros] = useState<Ferrero[]>([])
  const [dragging, setDragging] = useState<number | null>(null)
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })

  // Generate initial Ferrero positions
  useEffect(() => {
    const generateFerreros = () => {
      const count = 12
      const newFerreros: Ferrero[] = []
      const containerWidth = containerRef.current?.offsetWidth || window.innerWidth

      for (let i = 0; i < count; i++) {
        newFerreros.push({
          id: i,
          x: (containerWidth / count) * i + Math.random() * 50,
          y: 30 + Math.random() * 80,
          rotation: Math.random() * 40 - 20,
          scale: 0.8 + Math.random() * 0.4,
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
    setDragOffset({
      x: e.clientX - ferrero.x,
      y: e.clientY - ferrero.y,
    })
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (dragging === null) return

    const containerRect = containerRef.current?.getBoundingClientRect()
    if (!containerRect) return

    const newX = e.clientX - dragOffset.x
    const newY = e.clientY - dragOffset.y

    setFerreros(prev =>
      prev.map(f =>
        f.id === dragging
          ? {
              ...f,
              x: Math.max(0, Math.min(containerRect.width - 60, newX)),
              y: Math.max(0, Math.min(containerRect.height - 60, newY)),
              rotation: f.rotation + (e.movementX * 0.5),
            }
          : f
      )
    )
  }

  const handleMouseUp = () => {
    if (dragging !== null) {
      const element = document.getElementById(`ferrero-${dragging}`)
      if (element) {
        gsap.to(element, {
          scale: 1.15,
          duration: 0.1,
          yoyo: true,
          repeat: 1,
          ease: 'power2.out',
        })
      }
    }
    setDragging(null)
  }

  const handleTouchStart = (e: React.TouchEvent, id: number) => {
    const touch = e.touches[0]
    const ferrero = ferreros.find(f => f.id === id)
    if (!ferrero) return

    setDragging(id)
    setDragOffset({
      x: touch.clientX - ferrero.x,
      y: touch.clientY - ferrero.y,
    })
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    if (dragging === null) return

    const touch = e.touches[0]
    const containerRect = containerRef.current?.getBoundingClientRect()
    if (!containerRect) return

    const newX = touch.clientX - dragOffset.x
    const newY = touch.clientY - dragOffset.y

    setFerreros(prev =>
      prev.map(f =>
        f.id === dragging
          ? {
              ...f,
              x: Math.max(0, Math.min(containerRect.width - 60, newX)),
              y: Math.max(0, Math.min(containerRect.height - 60, newY)),
            }
          : f
      )
    )
  }

  return (
    <footer className="relative bg-[#0d0906] py-8">
      {/* Draggable Ferrero area */}
      <div
        ref={containerRef}
        className="relative h-48 overflow-hidden cursor-grab active:cursor-grabbing"
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleMouseUp}
      >
        {/* Background text */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <span className="text-white/5 text-3xl md:text-5xl font-bold uppercase tracking-widest">
            Trascina i Rocher
          </span>
        </div>

        {/* Draggable Ferreros as CSS spheres */}
        {ferreros.map((ferrero) => (
          <div
            key={ferrero.id}
            id={`ferrero-${ferrero.id}`}
            className={`absolute cursor-grab active:cursor-grabbing transition-shadow duration-200 ${
              dragging === ferrero.id ? 'z-50 shadow-2xl' : 'z-10'
            }`}
            style={{
              left: ferrero.x,
              top: ferrero.y,
              transform: `scale(${ferrero.scale}) rotate(${ferrero.rotation}deg)`,
              width: '60px',
              height: '60px',
            }}
            onMouseDown={(e) => handleMouseDown(e, ferrero.id)}
            onTouchStart={(e) => handleTouchStart(e, ferrero.id)}
          >
            {/* Ferrero Rocher sphere with CSS */}
            <div
              className="w-full h-full rounded-full relative"
              style={{
                background: `
                  radial-gradient(circle at 30% 30%, #E8C878 0%, transparent 40%),
                  radial-gradient(circle at 70% 60%, #8B6914 0%, transparent 30%),
                  radial-gradient(circle at 50% 50%, #D4A853 0%, #A67C00 50%, #5A3A1A 100%)
                `,
                boxShadow: `
                  inset -8px -8px 20px rgba(0,0,0,0.4),
                  inset 5px 5px 15px rgba(255,215,0,0.3),
                  0 8px 20px rgba(0,0,0,0.5),
                  0 0 30px rgba(212,168,83,0.2)
                `,
              }}
            >
              {/* Texture dots for hazelnut effect */}
              {[...Array(8)].map((_, i) => (
                <div
                  key={i}
                  className="absolute rounded-full"
                  style={{
                    width: '8px',
                    height: '8px',
                    background: 'radial-gradient(circle, #C4983F 0%, #8B6914 100%)',
                    boxShadow: 'inset -1px -1px 2px rgba(0,0,0,0.3)',
                    left: `${20 + Math.cos(i * Math.PI / 4) * 18}px`,
                    top: `${20 + Math.sin(i * Math.PI / 4) * 18}px`,
                  }}
                />
              ))}
              {/* Center highlight */}
              <div
                className="absolute rounded-full"
                style={{
                  width: '15px',
                  height: '15px',
                  background: 'radial-gradient(circle, rgba(255,255,255,0.4) 0%, transparent 70%)',
                  left: '15px',
                  top: '12px',
                }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Footer content */}
      <div className="max-w-7xl mx-auto px-6 lg:px-12 pt-8 border-t border-white/10">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
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
