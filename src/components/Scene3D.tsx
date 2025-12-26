import { useRef, Suspense, useEffect, useState } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { useGLTF, Environment, Float } from '@react-three/drei'
import * as THREE from 'three'

function FerreroModel({ scrollProgress }: { scrollProgress: number }) {
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
      // Dynamic position based on scroll
      // Move from right side at top to left side at bottom
      const xPos = THREE.MathUtils.lerp(4, -4, scrollProgress)
      const yPos = Math.sin(scrollProgress * Math.PI * 2) * 1.5 + Math.sin(state.clock.elapsedTime * 0.5) * 0.2
      const zPos = Math.sin(scrollProgress * Math.PI) * 2

      meshRef.current.position.x = THREE.MathUtils.lerp(meshRef.current.position.x, xPos, 0.05)
      meshRef.current.position.y = THREE.MathUtils.lerp(meshRef.current.position.y, yPos, 0.05)
      meshRef.current.position.z = THREE.MathUtils.lerp(meshRef.current.position.z, zPos, 0.05)

      // Scroll-linked rotation - more dramatic
      meshRef.current.rotation.y = scrollProgress * Math.PI * 6 + state.clock.elapsedTime * 0.2
      meshRef.current.rotation.x = Math.sin(scrollProgress * Math.PI * 2) * 0.8
      meshRef.current.rotation.z = Math.cos(scrollProgress * Math.PI) * 0.3

      // Scale pulsing based on scroll sections
      const pulseScale = 1 + Math.sin(scrollProgress * Math.PI * 4) * 0.15
      const targetScale = (viewport.width > 10 ? 2.5 : 1.8) * pulseScale
      meshRef.current.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), 0.03)
    }
  })

  const scale = viewport.width > 10 ? 2.5 : 1.8

  if (scene) {
    return (
      <Float speed={1} rotationIntensity={0.1} floatIntensity={0.2}>
        <primitive ref={meshRef} object={scene} scale={scale} />
      </Float>
    )
  }

  // Fallback golden sphere
  return (
    <Float speed={1} rotationIntensity={0.1} floatIntensity={0.2}>
      <group ref={meshRef}>
        <mesh castShadow>
          <sphereGeometry args={[1.5, 64, 64]} />
          <meshStandardMaterial
            color="#D4A853"
            metalness={0.95}
            roughness={0.05}
            envMapIntensity={2}
          />
        </mesh>
        {Array.from({ length: 30 }).map((_, i) => {
          const phi = Math.acos(-1 + (2 * i) / 30)
          const theta = Math.sqrt(30 * Math.PI) * phi
          return (
            <mesh
              key={i}
              position={[
                1.4 * Math.cos(theta) * Math.sin(phi),
                1.4 * Math.sin(theta) * Math.sin(phi),
                1.4 * Math.cos(phi),
              ]}
            >
              <sphereGeometry args={[0.12, 16, 16]} />
              <meshStandardMaterial color="#B8923F" metalness={0.8} roughness={0.2} />
            </mesh>
          )
        })}
        <mesh position={[0, -1.3, 0]}>
          <cylinderGeometry args={[1.8, 1.2, 0.7, 32, 1, true]} />
          <meshStandardMaterial color="#5A3A28" metalness={0.2} roughness={0.7} side={THREE.DoubleSide} />
        </mesh>
      </group>
    </Float>
  )
}

function GoldenParticles({ scrollProgress }: { scrollProgress: number }) {
  const particlesRef = useRef<THREE.Points>(null)
  const count = 300

  const positions = new Float32Array(count * 3)
  const colors = new Float32Array(count * 3)

  for (let i = 0; i < count; i++) {
    positions[i * 3] = (Math.random() - 0.5) * 25
    positions[i * 3 + 1] = (Math.random() - 0.5) * 25
    positions[i * 3 + 2] = (Math.random() - 0.5) * 25

    // Gold color variations
    colors[i * 3] = 0.83 + Math.random() * 0.1
    colors[i * 3 + 1] = 0.66 + Math.random() * 0.1
    colors[i * 3 + 2] = 0.33 + Math.random() * 0.1
  }

  useFrame((state) => {
    if (particlesRef.current) {
      particlesRef.current.rotation.y = state.clock.elapsedTime * 0.02 + scrollProgress * 1
      particlesRef.current.rotation.x = scrollProgress * 0.5
      particlesRef.current.rotation.z = Math.sin(scrollProgress * Math.PI) * 0.3
    }
  })

  return (
    <points ref={particlesRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={count} array={positions} itemSize={3} />
        <bufferAttribute attach="attributes-color" count={count} array={colors} itemSize={3} />
      </bufferGeometry>
      <pointsMaterial
        size={0.04}
        vertexColors
        transparent
        opacity={0.5}
        sizeAttenuation
        blending={THREE.AdditiveBlending}
      />
    </points>
  )
}

function LightRings({ scrollProgress }: { scrollProgress: number }) {
  const ringRef = useRef<THREE.Group>(null)

  useFrame((state) => {
    if (ringRef.current) {
      ringRef.current.rotation.x = Math.PI / 2 + scrollProgress * Math.PI
      ringRef.current.rotation.z = state.clock.elapsedTime * 0.1
    }
  })

  return (
    <group ref={ringRef}>
      {[1, 1.5, 2].map((radius, i) => (
        <mesh key={i} rotation={[0, 0, i * 0.3]}>
          <torusGeometry args={[radius * 3, 0.01, 16, 100]} />
          <meshBasicMaterial
            color="#D4A853"
            transparent
            opacity={0.1 - i * 0.02}
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
        camera={{ position: [0, 0, 10], fov: 35 }}
        dpr={[1, 2]}
        gl={{ antialias: true, alpha: true }}
      >
        <color attach="background" args={['#0A0A0A']} />

        <ambientLight intensity={0.2} />
        <spotLight
          position={[10, 10, 10]}
          angle={0.2}
          penumbra={1}
          intensity={2.5}
          color="#D4A853"
          castShadow
        />
        <spotLight
          position={[-10, 5, -10]}
          angle={0.3}
          penumbra={1}
          intensity={1.5}
          color="#E8C878"
        />
        <pointLight position={[0, -10, 0]} intensity={0.5} color="#5A3A28" />
        <pointLight position={[5, 5, 5]} intensity={0.3} color="#ffffff" />

        <Suspense fallback={null}>
          <FerreroModel scrollProgress={scrollProgress} />
          <Environment preset="studio" />
        </Suspense>

        <GoldenParticles scrollProgress={scrollProgress} />
        <LightRings scrollProgress={scrollProgress} />
      </Canvas>
    </div>
  )
}

useGLTF.preload('/models/ferrero.glb')
