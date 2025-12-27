import { useRef, useState, useEffect, Suspense, useMemo } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { useGLTF, Environment, Merged } from '@react-three/drei'
import * as THREE from 'three'

interface FerreroPiece {
  id: number
  x: number
  y: number
  rotation: number
  scale: number
}

// Merged Ferreros - much more efficient than individual clones
function MergedFerreros({
  ferreros,
  containerWidth,
  containerHeight,
  draggingId
}: {
  ferreros: FerreroPiece[]
  containerWidth: number
  containerHeight: number
  draggingId: number | null
}) {
  const { scene } = useGLTF('/models/ferrero.glb')
  const groupRef = useRef<THREE.Group>(null)

  // Extract meshes from the scene
  const meshes = useMemo(() => {
    const result: { [key: string]: THREE.Mesh } = {}
    scene.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        result[child.name || 'main'] = child as THREE.Mesh
      }
    })
    return result
  }, [scene])

  // Convert screen to world coords
  const screenToWorld = (x: number, y: number): [number, number, number] => {
    const worldX = ((x / containerWidth) - 0.5) * 16
    const worldY = -((y / containerHeight) - 0.5) * 6
    return [worldX, worldY, 0]
  }

  useFrame(() => {
    if (groupRef.current) {
      groupRef.current.children.forEach((child, idx) => {
        if (child instanceof THREE.Group) {
          child.rotation.y += 0.008
          if (draggingId === idx) {
            child.rotation.y += 0.03
          }
        }
      })
    }
  })

  return (
    <Merged meshes={meshes}>
      {(models: { [key: string]: React.FC<JSX.IntrinsicElements['mesh']> }) => (
        <group ref={groupRef}>
          {ferreros.map((ferrero) => {
            const [x, y, z] = screenToWorld(ferrero.x, ferrero.y)
            const scale = ferrero.scale * 0.55
            return (
              <group
                key={ferrero.id}
                position={[x, y, z]}
                rotation={[0, ferrero.rotation, 0]}
                scale={[scale, scale, scale]}
              >
                {Object.entries(models).map(([name, Model]) => (
                  <Model key={name} />
                ))}
              </group>
            )
          })}
        </group>
      )}
    </Merged>
  )
}

export function DraggableFooter() {
  const containerRef = useRef<HTMLDivElement>(null)
  const [ferreros, setFerreros] = useState<FerreroPiece[]>([])
  const [dragging, setDragging] = useState<number | null>(null)
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })
  const [containerSize, setContainerSize] = useState({ width: 1000, height: 200 })

  // Generate initial Ferrero positions
  useEffect(() => {
    const generateFerreros = () => {
      const count = 15
      const newFerreros: FerreroPiece[] = []
      const width = containerRef.current?.offsetWidth || window.innerWidth
      const height = containerRef.current?.offsetHeight || 200

      setContainerSize({ width, height })

      for (let i = 0; i < count; i++) {
        newFerreros.push({
          id: i,
          x: Math.random() * (width - 100) + 50,
          y: 30 + Math.random() * 140,
          rotation: Math.random() * Math.PI * 2,
          scale: 0.8 + Math.random() * 0.4,
        })
      }
      setFerreros(newFerreros)
    }

    generateFerreros()
    window.addEventListener('resize', generateFerreros)
    return () => window.removeEventListener('resize', generateFerreros)
  }, [])

  const handleMouseDown = (e: React.MouseEvent) => {
    const rect = containerRef.current?.getBoundingClientRect()
    if (!rect) return

    const mouseX = e.clientX - rect.left
    const mouseY = e.clientY - rect.top

    const clickedFerrero = ferreros.find(f => {
      const dx = mouseX - f.x
      const dy = mouseY - f.y
      return Math.sqrt(dx * dx + dy * dy) < 50
    })

    if (clickedFerrero) {
      setDragging(clickedFerrero.id)
      setDragOffset({
        x: mouseX - clickedFerrero.x,
        y: mouseY - clickedFerrero.y,
      })
    }
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (dragging === null) return

    const rect = containerRef.current?.getBoundingClientRect()
    if (!rect) return

    setFerreros(prev =>
      prev.map(f =>
        f.id === dragging
          ? {
              ...f,
              x: Math.max(50, Math.min(rect.width - 50, e.clientX - rect.left - dragOffset.x)),
              y: Math.max(30, Math.min(rect.height - 30, e.clientY - rect.top - dragOffset.y)),
              rotation: f.rotation + 0.08,
            }
          : f
      )
    )
  }

  const handleMouseUp = () => setDragging(null)

  const handleTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0]
    const rect = containerRef.current?.getBoundingClientRect()
    if (!rect) return

    const touchX = touch.clientX - rect.left
    const touchY = touch.clientY - rect.top

    const clickedFerrero = ferreros.find(f => {
      const dx = touchX - f.x
      const dy = touchY - f.y
      return Math.sqrt(dx * dx + dy * dy) < 50
    })

    if (clickedFerrero) {
      setDragging(clickedFerrero.id)
      setDragOffset({
        x: touchX - clickedFerrero.x,
        y: touchY - clickedFerrero.y,
      })
    }
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    if (dragging === null) return

    const touch = e.touches[0]
    const rect = containerRef.current?.getBoundingClientRect()
    if (!rect) return

    setFerreros(prev =>
      prev.map(f =>
        f.id === dragging
          ? {
              ...f,
              x: Math.max(50, Math.min(rect.width - 50, touch.clientX - rect.left - dragOffset.x)),
              y: Math.max(30, Math.min(rect.height - 30, touch.clientY - rect.top - dragOffset.y)),
            }
          : f
      )
    )
  }

  return (
    <footer className="relative z-30 bg-[#0d0906] py-6">
      <div
        ref={containerRef}
        className="relative h-52 overflow-hidden cursor-grab active:cursor-grabbing"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleMouseUp}
      >
        {/* Background text */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <span className="text-white/[0.03] text-2xl md:text-4xl font-bold uppercase tracking-widest">
            Trascina i Rocher
          </span>
        </div>

        {/* Single optimized Canvas */}
        {ferreros.length > 0 && (
          <Canvas
            camera={{ position: [0, 0, 12], fov: 35 }}
            style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}
            gl={{ alpha: true, antialias: true, powerPreference: 'high-performance' }}
            dpr={[1, 1.5]}
          >
            <ambientLight intensity={0.4} />
            <spotLight position={[5, 5, 8]} intensity={1.5} color="#D4A853" />
            <pointLight position={[-5, -3, 5]} intensity={0.6} color="#E8C878" />

            <Suspense fallback={null}>
              <MergedFerreros
                ferreros={ferreros}
                containerWidth={containerSize.width}
                containerHeight={containerSize.height}
                draggingId={dragging}
              />
              <Environment preset="studio" />
            </Suspense>
          </Canvas>
        )}
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

useGLTF.preload('/models/ferrero.glb')
