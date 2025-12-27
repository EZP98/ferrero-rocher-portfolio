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
      const count = 10
      const newFerreros: Ferrero[] = []
      const containerWidth = containerRef.current?.offsetWidth || window.innerWidth

      for (let i = 0; i < count; i++) {
        newFerreros.push({
          id: i,
          x: (containerWidth / count) * i + Math.random() * 40,
          y: 30 + Math.random() * 140,
          rotation: Math.random() * 360,
          scale: 0.9 + Math.random() * 0.3,
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
              rotation: f.rotation + (e.movementX * 2),
            }
          : f
      )
    )
  }

  const handleMouseUp = () => {
    if (dragging !== null) {
      // Add a little bounce animation when released
      const element = document.getElementById(`ferrero-${dragging}`)
      if (element) {
        gsap.to(element, {
          scale: 1.1,
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
        className="relative h-64 overflow-hidden cursor-grab active:cursor-grabbing"
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleMouseUp}
      >
        {/* Background text */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <span className="text-white/5 text-6xl md:text-8xl font-bold uppercase tracking-widest">
            Drag Me
          </span>
        </div>

        {/* Draggable Ferreros */}
        {ferreros.map((ferrero) => (
          <div
            key={ferrero.id}
            id={`ferrero-${ferrero.id}`}
            className={`absolute w-20 h-20 cursor-grab active:cursor-grabbing transition-shadow ${
              dragging === ferrero.id ? 'z-50 shadow-2xl' : 'z-10'
            }`}
            style={{
              left: ferrero.x,
              top: ferrero.y,
              transform: `rotate(${ferrero.rotation}deg) scale(${ferrero.scale})`,
            }}
            onMouseDown={(e) => handleMouseDown(e, ferrero.id)}
            onTouchStart={(e) => handleTouchStart(e, ferrero.id)}
          >
            {/* Ferrero Rocher realistic SVG */}
            <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-2xl">
              <defs>
                {/* Main gold gradient */}
                <radialGradient id={`gold-main-${ferrero.id}`} cx="35%" cy="25%" r="65%">
                  <stop offset="0%" stopColor="#FFE5A0" />
                  <stop offset="30%" stopColor="#D4A853" />
                  <stop offset="70%" stopColor="#B8923F" />
                  <stop offset="100%" stopColor="#7A5C1E" />
                </radialGradient>

                {/* Highlight */}
                <radialGradient id={`highlight-${ferrero.id}`} cx="30%" cy="25%" r="40%">
                  <stop offset="0%" stopColor="white" stopOpacity="0.7" />
                  <stop offset="100%" stopColor="white" stopOpacity="0" />
                </radialGradient>

                {/* Shadow */}
                <radialGradient id={`shadow-${ferrero.id}`} cx="50%" cy="80%" r="50%">
                  <stop offset="0%" stopColor="#3D2B0F" stopOpacity="0.5" />
                  <stop offset="100%" stopColor="#3D2B0F" stopOpacity="0" />
                </radialGradient>

                {/* Bump gradient */}
                <radialGradient id={`bump-${ferrero.id}`} cx="40%" cy="30%" r="60%">
                  <stop offset="0%" stopColor="#E8C878" />
                  <stop offset="100%" stopColor="#8B6914" />
                </radialGradient>
              </defs>

              {/* Shadow underneath */}
              <ellipse cx="50" cy="90" rx="25" ry="8" fill={`url(#shadow-${ferrero.id})`} />

              {/* Main golden sphere */}
              <circle cx="50" cy="50" r="42" fill={`url(#gold-main-${ferrero.id})`} />

              {/* Hazelnut bumps - outer ring */}
              {[...Array(12)].map((_, i) => {
                const angle = (i / 12) * Math.PI * 2
                const x = 50 + Math.cos(angle) * 30
                const y = 50 + Math.sin(angle) * 30
                return (
                  <circle
                    key={`outer-${i}`}
                    cx={x}
                    cy={y}
                    r="6"
                    fill={`url(#bump-${ferrero.id})`}
                  />
                )
              })}

              {/* Hazelnut bumps - middle ring */}
              {[...Array(8)].map((_, i) => {
                const angle = (i / 8) * Math.PI * 2 + 0.2
                const x = 50 + Math.cos(angle) * 18
                const y = 50 + Math.sin(angle) * 18
                return (
                  <circle
                    key={`middle-${i}`}
                    cx={x}
                    cy={y}
                    r="5"
                    fill={`url(#bump-${ferrero.id})`}
                  />
                )
              })}

              {/* Center bump */}
              <circle cx="50" cy="50" r="8" fill={`url(#bump-${ferrero.id})`} />

              {/* Main highlight */}
              <ellipse cx="38" cy="35" rx="18" ry="15" fill={`url(#highlight-${ferrero.id})`} />

              {/* Small sparkle highlights */}
              <circle cx="35" cy="32" r="3" fill="white" opacity="0.8" />
              <circle cx="42" cy="38" r="1.5" fill="white" opacity="0.6" />

              {/* Golden border */}
              <circle cx="50" cy="50" r="42" fill="none" stroke="#8B6914" strokeWidth="0.5" opacity="0.3" />
            </svg>
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
