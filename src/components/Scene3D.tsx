import { useRef, Suspense, useEffect, useState, useMemo } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { useGLTF, Environment, Float, Clone } from '@react-three/drei'
import * as THREE from 'three'

// Main falling Ferrero Rocher
function FallingFerrero({ scrollProgress }: { scrollProgress: number }) {
  const meshRef = useRef<THREE.Group>(null)
  const { viewport } = useThree()

  let scene = null
  try {
    const gltf = useGLTF('/models/ferrero.glb')
    scene = gltf.scene
  } catch {
    // Fallback
  }

  useFrame((state) => {
    if (meshRef.current) {
      // Fall from top to bottom based on scroll
      // Start at y=8, fall to y=-3 (into the sea)
      const startY = 6
      const endY = -2.5
      const fallProgress = Math.min(scrollProgress * 1.5, 1) // Faster fall in first part of scroll

      const yPos = THREE.MathUtils.lerp(startY, endY, fallProgress)

      // Slight horizontal drift
      const xPos = Math.sin(scrollProgress * Math.PI * 2) * 1.5
      const zPos = Math.cos(scrollProgress * Math.PI) * 0.5

      meshRef.current.position.x = THREE.MathUtils.lerp(meshRef.current.position.x, xPos, 0.08)
      meshRef.current.position.y = THREE.MathUtils.lerp(meshRef.current.position.y, yPos, 0.08)
      meshRef.current.position.z = THREE.MathUtils.lerp(meshRef.current.position.z, zPos, 0.08)

      // Tumbling rotation as it falls
      meshRef.current.rotation.y = scrollProgress * Math.PI * 8 + state.clock.elapsedTime * 0.3
      meshRef.current.rotation.x = scrollProgress * Math.PI * 4 + Math.sin(state.clock.elapsedTime) * 0.2
      meshRef.current.rotation.z = Math.sin(scrollProgress * Math.PI * 3) * 0.5

      // Scale - slightly larger for the main one
      const baseScale = viewport.width > 10 ? 2.2 : 1.6
      const pulseScale = 1 + Math.sin(state.clock.elapsedTime * 2) * 0.02
      meshRef.current.scale.setScalar(baseScale * pulseScale)
    }
  })

  if (scene) {
    return (
      <Float speed={0.5} rotationIntensity={0.05} floatIntensity={0.1}>
        <primitive ref={meshRef} object={scene} />
      </Float>
    )
  }

  // Fallback golden sphere
  return (
    <Float speed={0.5} rotationIntensity={0.05} floatIntensity={0.1}>
      <group ref={meshRef}>
        <mesh castShadow>
          <sphereGeometry args={[1, 64, 64]} />
          <meshStandardMaterial
            color="#D4A853"
            metalness={0.95}
            roughness={0.05}
            envMapIntensity={2}
          />
        </mesh>
      </group>
    </Float>
  )
}

// Single Ferrero in the sea
function SeaFerrero({ position, rotationSpeed, scale, delay }: {
  position: [number, number, number]
  rotationSpeed: number
  scale: number
  delay: number
}) {
  const meshRef = useRef<THREE.Group>(null)

  let scene = null
  try {
    const gltf = useGLTF('/models/ferrero.glb')
    scene = gltf.scene
  } catch {
    // Fallback
  }

  useFrame((state) => {
    if (meshRef.current) {
      // Gentle floating motion
      meshRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 0.5 + delay) * 0.15
      meshRef.current.rotation.y = state.clock.elapsedTime * rotationSpeed + delay
      meshRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.3 + delay) * 0.1
    }
  })

  if (scene) {
    return (
      <Clone
        ref={meshRef}
        object={scene}
        scale={scale}
        position={position}
      />
    )
  }

  // Fallback sphere
  return (
    <group ref={meshRef} position={position} scale={scale}>
      <mesh>
        <sphereGeometry args={[1, 32, 32]} />
        <meshStandardMaterial color="#D4A853" metalness={0.9} roughness={0.1} />
      </mesh>
    </group>
  )
}

// Sea of Ferrero Rochers
function FerreroSea({ scrollProgress }: { scrollProgress: number }) {
  const groupRef = useRef<THREE.Group>(null)

  // Generate random positions for the sea of Ferreros
  const ferreros = useMemo(() => {
    const items: Array<{
      position: [number, number, number]
      rotationSpeed: number
      scale: number
      delay: number
    }> = []

    // Create multiple layers of Ferreros
    const layers = [
      { y: -4, count: 15, spread: 12, scaleRange: [0.6, 0.9] },
      { y: -5, count: 20, spread: 15, scaleRange: [0.5, 0.8] },
      { y: -6, count: 25, spread: 18, scaleRange: [0.4, 0.7] },
      { y: -7, count: 30, spread: 20, scaleRange: [0.3, 0.6] },
    ]

    layers.forEach(layer => {
      for (let i = 0; i < layer.count; i++) {
        const angle = (i / layer.count) * Math.PI * 2 + Math.random() * 0.5
        const radius = Math.random() * layer.spread
        items.push({
          position: [
            Math.cos(angle) * radius + (Math.random() - 0.5) * 3,
            layer.y + (Math.random() - 0.5) * 0.5,
            Math.sin(angle) * radius + (Math.random() - 0.5) * 3 - 5
          ],
          rotationSpeed: 0.1 + Math.random() * 0.2,
          scale: layer.scaleRange[0] + Math.random() * (layer.scaleRange[1] - layer.scaleRange[0]),
          delay: Math.random() * Math.PI * 2
        })
      }
    })

    return items
  }, [])

  useFrame(() => {
    if (groupRef.current) {
      // Reveal the sea as user scrolls
      const revealProgress = Math.max(0, (scrollProgress - 0.2) * 1.5)
      groupRef.current.position.y = THREE.MathUtils.lerp(2, 0, Math.min(revealProgress, 1))

      // Subtle wave motion for the whole sea
      groupRef.current.rotation.y = Math.sin(Date.now() * 0.0001) * 0.05
    }
  })

  return (
    <group ref={groupRef}>
      {ferreros.map((ferrero, i) => (
        <SeaFerrero
          key={i}
          position={ferrero.position}
          rotationSpeed={ferrero.rotationSpeed}
          scale={ferrero.scale}
          delay={ferrero.delay}
        />
      ))}
    </group>
  )
}

// Splash particles when Ferrero hits the sea
function SplashParticles({ scrollProgress }: { scrollProgress: number }) {
  const particlesRef = useRef<THREE.Points>(null)
  const count = 100

  const { positions, velocities } = useMemo(() => {
    const pos = new Float32Array(count * 3)
    const vel = new Float32Array(count * 3)

    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2
      const speed = 0.5 + Math.random() * 1.5
      pos[i * 3] = 0
      pos[i * 3 + 1] = -2.5
      pos[i * 3 + 2] = 0
      vel[i * 3] = Math.cos(angle) * speed
      vel[i * 3 + 1] = 0.5 + Math.random() * 2
      vel[i * 3 + 2] = Math.sin(angle) * speed
    }

    return { positions: pos, velocities: vel }
  }, [])

  useFrame(() => {
    if (particlesRef.current && particlesRef.current.geometry.attributes.position) {
      const posArray = particlesRef.current.geometry.attributes.position.array as Float32Array

      // Only show splash when ferrero hits the sea (around 60-80% scroll)
      const splashProgress = scrollProgress > 0.55 && scrollProgress < 0.85
        ? (scrollProgress - 0.55) / 0.3
        : 0

      for (let i = 0; i < count; i++) {
        if (splashProgress > 0) {
          posArray[i * 3] = velocities[i * 3] * splashProgress * 3
          posArray[i * 3 + 1] = -2.5 + velocities[i * 3 + 1] * splashProgress * 2 - splashProgress * splashProgress * 3
          posArray[i * 3 + 2] = velocities[i * 3 + 2] * splashProgress * 3
        } else {
          posArray[i * 3] = 0
          posArray[i * 3 + 1] = -10
          posArray[i * 3 + 2] = 0
        }
      }

      particlesRef.current.geometry.attributes.position.needsUpdate = true

      // Fade out
      const material = particlesRef.current.material as THREE.PointsMaterial
      material.opacity = splashProgress > 0 ? Math.sin(splashProgress * Math.PI) * 0.8 : 0
    }
  })

  return (
    <points ref={particlesRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={count} array={positions} itemSize={3} />
      </bufferGeometry>
      <pointsMaterial
        size={0.08}
        color="#D4A853"
        transparent
        opacity={0}
        sizeAttenuation
        blending={THREE.AdditiveBlending}
      />
    </points>
  )
}

// Ambient golden dust
function GoldenDust({ scrollProgress }: { scrollProgress: number }) {
  const particlesRef = useRef<THREE.Points>(null)
  const count = 200

  const positions = useMemo(() => {
    const pos = new Float32Array(count * 3)
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 30
      pos[i * 3 + 1] = (Math.random() - 0.5) * 20
      pos[i * 3 + 2] = (Math.random() - 0.5) * 20 - 5
    }
    return pos
  }, [])

  useFrame((state) => {
    if (particlesRef.current) {
      particlesRef.current.rotation.y = state.clock.elapsedTime * 0.01 + scrollProgress * 0.5
      particlesRef.current.rotation.x = scrollProgress * 0.2
    }
  })

  return (
    <points ref={particlesRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={count} array={positions} itemSize={3} />
      </bufferGeometry>
      <pointsMaterial
        size={0.03}
        color="#D4A853"
        transparent
        opacity={0.4}
        sizeAttenuation
        blending={THREE.AdditiveBlending}
      />
    </points>
  )
}

// Light rays effect
function LightRays({ scrollProgress }: { scrollProgress: number }) {
  const groupRef = useRef<THREE.Group>(null)

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.z = state.clock.elapsedTime * 0.05
      groupRef.current.position.y = 5 - scrollProgress * 8
    }
  })

  return (
    <group ref={groupRef} position={[0, 5, -10]}>
      {[...Array(8)].map((_, i) => (
        <mesh key={i} rotation={[0, 0, (i / 8) * Math.PI * 2]}>
          <planeGeometry args={[0.1, 15]} />
          <meshBasicMaterial
            color="#D4A853"
            transparent
            opacity={0.05}
            side={THREE.DoubleSide}
            blending={THREE.AdditiveBlending}
          />
        </mesh>
      ))}
    </group>
  )
}

export function Scene3D() {
  const [scrollProgress, setScrollProgress] = useState(0)

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY
      const docHeight = document.documentElement.scrollHeight - window.innerHeight
      setScrollProgress(docHeight > 0 ? scrollTop / docHeight : 0)
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <div className="canvas-container">
      <Canvas
        camera={{ position: [0, 2, 12], fov: 40 }}
        dpr={[1, 2]}
        gl={{ antialias: true, alpha: true }}
      >
        <color attach="background" args={['#0A0A0A']} />

        {/* Fog for depth */}
        <fog attach="fog" args={['#0A0A0A', 15, 35]} />

        {/* Lighting */}
        <ambientLight intensity={0.3} />
        <spotLight
          position={[0, 15, 10]}
          angle={0.3}
          penumbra={1}
          intensity={3}
          color="#D4A853"
          castShadow
        />
        <spotLight
          position={[-10, 5, -5]}
          angle={0.4}
          penumbra={1}
          intensity={1.5}
          color="#E8C878"
        />
        <pointLight position={[0, -8, 0]} intensity={1} color="#5A3A28" distance={20} />
        <pointLight position={[5, 0, 5]} intensity={0.5} color="#ffffff" />

        <Suspense fallback={null}>
          {/* Main falling Ferrero */}
          <FallingFerrero scrollProgress={scrollProgress} />

          {/* Sea of Ferreros at the bottom */}
          <FerreroSea scrollProgress={scrollProgress} />

          <Environment preset="studio" />
        </Suspense>

        {/* Effects */}
        <SplashParticles scrollProgress={scrollProgress} />
        <GoldenDust scrollProgress={scrollProgress} />
        <LightRays scrollProgress={scrollProgress} />
      </Canvas>
    </div>
  )
}

useGLTF.preload('/models/ferrero.glb')
