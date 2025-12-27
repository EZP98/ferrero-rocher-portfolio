import { useRef, useState, useEffect, Suspense } from 'react'
import { Canvas, useThree, useFrame } from '@react-three/fiber'
import { useGLTF, Environment } from '@react-three/drei'
import * as THREE from 'three'

interface FerreroPiece {
  id: number
  position: [number, number, number]
  rotation: number
  scale: number
}

// Single Ferrero instance
function FerreroInstance({
  position,
  rotation,
  scale,
  isDragging
}: {
  position: [number, number, number]
  rotation: number
  scale: number
  isDragging: boolean
}) {
  const meshRef = useRef<THREE.Group>(null)

  let scene = null
  try {
    const gltf = useGLTF('/models/ferrero.glb')
    scene = gltf.scene
  } catch {
    return null
  }

  useFrame(() => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.005
      if (isDragging) {
        meshRef.current.rotation.y += 0.02
      }
    }
  })

  if (!scene) return null

  return (
    <primitive
      ref={meshRef}
      object={scene.clone()}
      position={position}
      rotation={[0, rotation, 0]}
      scale={scale}
    />
  )
}

// Scene with all Ferreros
function FerrerosScene({
  ferreros,
  draggingId,
  containerWidth,
  containerHeight
}: {
  ferreros: FerreroPiece[]
  draggingId: number | null
  containerWidth: number
  containerHeight: number
}) {
  const { camera } = useThree()

  useEffect(() => {
    // Adjust camera to fit container
    if (camera instanceof THREE.PerspectiveCamera) {
      camera.position.z = 8
      camera.updateProjectionMatrix()
    }
  }, [camera])

  // Convert screen coordinates to 3D world coordinates
  const screenToWorld = (x: number, y: number): [number, number, number] => {
    const worldX = ((x / containerWidth) - 0.5) * 12
    const worldY = -((y / containerHeight) - 0.5) * 4
    return [worldX, worldY, 0]
  }

  return (
    <>
      <ambientLight intensity={0.4} />
      <spotLight position={[5, 5, 5]} intensity={1.5} color="#D4A853" />
      <pointLight position={[-5, -5, 5]} intensity={0.8} color="#E8C878" />

      <Suspense fallback={null}>
        {ferreros.map((ferrero) => (
          <FerreroInstance
            key={ferrero.id}
            position={screenToWorld(ferrero.position[0], ferrero.position[1])}
            rotation={ferrero.rotation}
            scale={ferrero.scale * 0.8}
            isDragging={draggingId === ferrero.id}
          />
        ))}
        <Environment preset="studio" />
      </Suspense>
    </>
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
      const count = 10
      const newFerreros: FerreroPiece[] = []
      const width = containerRef.current?.offsetWidth || window.innerWidth
      const height = containerRef.current?.offsetHeight || 200

      setContainerSize({ width, height })

      for (let i = 0; i < count; i++) {
        newFerreros.push({
          id: i,
          position: [
            (width / count) * i + Math.random() * 60 + 30,
            40 + Math.random() * 100,
            0
          ],
          rotation: Math.random() * Math.PI * 2,
          scale: 0.9 + Math.random() * 0.3,
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

    // Find clicked Ferrero
    const clickedFerrero = ferreros.find(f => {
      const dx = mouseX - f.position[0]
      const dy = mouseY - f.position[1]
      return Math.sqrt(dx * dx + dy * dy) < 50
    })

    if (clickedFerrero) {
      setDragging(clickedFerrero.id)
      setDragOffset({
        x: mouseX - clickedFerrero.position[0],
        y: mouseY - clickedFerrero.position[1],
      })
    }
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (dragging === null) return

    const rect = containerRef.current?.getBoundingClientRect()
    if (!rect) return

    const mouseX = e.clientX - rect.left
    const mouseY = e.clientY - rect.top

    setFerreros(prev =>
      prev.map(f =>
        f.id === dragging
          ? {
              ...f,
              position: [
                Math.max(30, Math.min(rect.width - 30, mouseX - dragOffset.x)),
                Math.max(30, Math.min(rect.height - 30, mouseY - dragOffset.y)),
                0
              ] as [number, number, number],
              rotation: f.rotation + 0.1,
            }
          : f
      )
    )
  }

  const handleMouseUp = () => {
    setDragging(null)
  }

  const handleTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0]
    const rect = containerRef.current?.getBoundingClientRect()
    if (!rect) return

    const touchX = touch.clientX - rect.left
    const touchY = touch.clientY - rect.top

    const clickedFerrero = ferreros.find(f => {
      const dx = touchX - f.position[0]
      const dy = touchY - f.position[1]
      return Math.sqrt(dx * dx + dy * dy) < 50
    })

    if (clickedFerrero) {
      setDragging(clickedFerrero.id)
      setDragOffset({
        x: touchX - clickedFerrero.position[0],
        y: touchY - clickedFerrero.position[1],
      })
    }
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    if (dragging === null) return

    const touch = e.touches[0]
    const rect = containerRef.current?.getBoundingClientRect()
    if (!rect) return

    const touchX = touch.clientX - rect.left
    const touchY = touch.clientY - rect.top

    setFerreros(prev =>
      prev.map(f =>
        f.id === dragging
          ? {
              ...f,
              position: [
                Math.max(30, Math.min(rect.width - 30, touchX - dragOffset.x)),
                Math.max(30, Math.min(rect.height - 30, touchY - dragOffset.y)),
                0
              ] as [number, number, number],
            }
          : f
      )
    )
  }

  return (
    <footer className="relative z-30 bg-[#0d0906] py-8">
      {/* Draggable Ferrero area with single Canvas */}
      <div
        ref={containerRef}
        className="relative h-56 overflow-hidden cursor-grab active:cursor-grabbing"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleMouseUp}
      >
        {/* Background text */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0">
          <span className="text-white/5 text-3xl md:text-5xl font-bold uppercase tracking-widest">
            Trascina i Rocher
          </span>
        </div>

        {/* Single Canvas with all Ferreros */}
        <Canvas
          camera={{ position: [0, 0, 8], fov: 45 }}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            pointerEvents: 'none'
          }}
          gl={{ alpha: true, antialias: true }}
        >
          <FerrerosScene
            ferreros={ferreros}
            draggingId={dragging}
            containerWidth={containerSize.width}
            containerHeight={containerSize.height}
          />
        </Canvas>

        {/* Invisible hit areas for dragging */}
        {ferreros.map((ferrero) => (
          <div
            key={ferrero.id}
            className={`absolute w-16 h-16 rounded-full cursor-grab active:cursor-grabbing ${
              dragging === ferrero.id ? 'z-50' : 'z-10'
            }`}
            style={{
              left: ferrero.position[0] - 32,
              top: ferrero.position[1] - 32,
              pointerEvents: 'auto',
            }}
          />
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

// Preload the model
useGLTF.preload('/models/ferrero.glb')
