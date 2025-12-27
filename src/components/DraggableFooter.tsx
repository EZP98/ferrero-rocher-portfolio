import { useRef, useState, useEffect, Suspense } from 'react'
import { Canvas } from '@react-three/fiber'
import { useGLTF, Environment } from '@react-three/drei'
import { gsap } from 'gsap'
import * as THREE from 'three'

interface Ferrero {
  id: number
  x: number
  y: number
  rotation: number
  scale: number
}

// Mini 3D Ferrero component
function MiniFerrero() {
  const meshRef = useRef<THREE.Group>(null)

  let scene = null
  try {
    const gltf = useGLTF('/models/ferrero.glb')
    scene = gltf.scene
  } catch {
    return null
  }

  if (!scene) return null

  return (
    <primitive
      ref={meshRef}
      object={scene.clone()}
      scale={1.8}
    />
  )
}

export function DraggableFooter() {
  const containerRef = useRef<HTMLDivElement>(null)
  const [ferreros, setFerreros] = useState<Ferrero[]>([])
  const [dragging, setDragging] = useState<number | null>(null)
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })

  // Generate initial Ferrero positions
  useEffect(() => {
    const generateFerreros = () => {
      const count = 8
      const newFerreros: Ferrero[] = []
      const containerWidth = containerRef.current?.offsetWidth || window.innerWidth

      for (let i = 0; i < count; i++) {
        newFerreros.push({
          id: i,
          x: (containerWidth / count) * i + Math.random() * 30,
          y: 20 + Math.random() * 100,
          rotation: Math.random() * 360,
          scale: 0.9 + Math.random() * 0.2,
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
              x: Math.max(0, Math.min(containerRect.width - 80, newX)),
              y: Math.max(0, Math.min(containerRect.height - 80, newY)),
              rotation: f.rotation + (e.movementX * 2),
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
              x: Math.max(0, Math.min(containerRect.width - 80, newX)),
              y: Math.max(0, Math.min(containerRect.height - 80, newY)),
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
        className="relative h-56 overflow-hidden cursor-grab active:cursor-grabbing"
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleMouseUp}
      >
        {/* Background text */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <span className="text-white/5 text-4xl md:text-6xl font-bold uppercase tracking-widest">
            Trascina i Rocher
          </span>
        </div>

        {/* Draggable 3D Ferreros */}
        {ferreros.map((ferrero) => (
          <div
            key={ferrero.id}
            id={`ferrero-${ferrero.id}`}
            className={`absolute w-24 h-24 cursor-grab active:cursor-grabbing ${
              dragging === ferrero.id ? 'z-50' : 'z-10'
            }`}
            style={{
              left: ferrero.x,
              top: ferrero.y,
              transform: `scale(${ferrero.scale})`,
            }}
            onMouseDown={(e) => handleMouseDown(e, ferrero.id)}
            onTouchStart={(e) => handleTouchStart(e, ferrero.id)}
          >
            <Canvas
              camera={{ position: [0, 0, 4], fov: 45 }}
              style={{
                pointerEvents: 'none',
                background: 'transparent'
              }}
              gl={{ alpha: true, antialias: true }}
            >
              <ambientLight intensity={0.5} />
              <spotLight position={[5, 5, 5]} intensity={1} color="#D4A853" />
              <pointLight position={[-5, -5, 5]} intensity={0.5} color="#E8C878" />

              <Suspense fallback={null}>
                <group rotation={[0, ferrero.rotation * 0.01, 0]}>
                  <MiniFerrero />
                </group>
                <Environment preset="studio" />
              </Suspense>
            </Canvas>
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
