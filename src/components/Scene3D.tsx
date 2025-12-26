import { useRef, Suspense, useMemo } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { useGLTF, Environment, Float, ContactShadows } from '@react-three/drei'
import { useScroll, useTransform, motion } from 'framer-motion'
import * as THREE from 'three'

function FerreroModel() {
  const meshRef = useRef<THREE.Group>(null)

  // Try to load the GLB model
  let scene = null
  try {
    const gltf = useGLTF('/models/ferrero.glb')
    scene = gltf.scene
  } catch {
    // Model not found, will use fallback
  }

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = state.clock.elapsedTime * 0.3
      meshRef.current.position.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.1
    }
  })

  if (scene) {
    return (
      <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
        <primitive ref={meshRef} object={scene} scale={2} />
      </Float>
    )
  }

  // Fallback: Golden sphere (Ferrero Rocher style)
  return (
    <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
      <group ref={meshRef}>
        {/* Main chocolate ball */}
        <mesh castShadow>
          <sphereGeometry args={[1.2, 64, 64]} />
          <meshStandardMaterial
            color="#D4A853"
            metalness={0.8}
            roughness={0.2}
            envMapIntensity={1.5}
          />
        </mesh>
        {/* Hazelnut bumps */}
        {Array.from({ length: 20 }).map((_, i) => {
          const phi = Math.acos(-1 + (2 * i) / 20)
          const theta = Math.sqrt(20 * Math.PI) * phi
          return (
            <mesh
              key={i}
              position={[
                1.1 * Math.cos(theta) * Math.sin(phi),
                1.1 * Math.sin(theta) * Math.sin(phi),
                1.1 * Math.cos(phi),
              ]}
              castShadow
            >
              <sphereGeometry args={[0.15, 16, 16]} />
              <meshStandardMaterial
                color="#B8923F"
                metalness={0.7}
                roughness={0.3}
              />
            </mesh>
          )
        })}
        {/* Brown paper cup */}
        <mesh position={[0, -1, 0]} receiveShadow>
          <cylinderGeometry args={[1.5, 1, 0.6, 32, 1, true]} />
          <meshStandardMaterial
            color="#5A3A28"
            metalness={0.1}
            roughness={0.8}
            side={THREE.DoubleSide}
          />
        </mesh>
      </group>
    </Float>
  )
}

function Particles() {
  const particlesRef = useRef<THREE.Points>(null)

  const positions = useMemo(() => {
    const pos = new Float32Array(300 * 3)
    for (let i = 0; i < 300; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 15
      pos[i * 3 + 1] = (Math.random() - 0.5) * 15
      pos[i * 3 + 2] = (Math.random() - 0.5) * 15
    }
    return pos
  }, [])

  useFrame((state) => {
    if (particlesRef.current) {
      particlesRef.current.rotation.y = state.clock.elapsedTime * 0.02
    }
  })

  return (
    <points ref={particlesRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={300}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.03}
        color="#D4A853"
        transparent
        opacity={0.5}
        sizeAttenuation
      />
    </points>
  )
}

export function Scene3D() {
  const { scrollYProgress } = useScroll()

  return (
    <motion.div
      className="canvas-container"
      style={{ opacity: useTransform(scrollYProgress, [0, 0.8, 1], [1, 1, 0]) }}
    >
      <Canvas
        camera={{ position: [0, 0, 6], fov: 45 }}
        dpr={[1, 2]}
        gl={{ antialias: true, alpha: true }}
      >
        <color attach="background" args={['#0A0A0A']} />

        <ambientLight intensity={0.4} />
        <spotLight
          position={[10, 10, 10]}
          angle={0.3}
          penumbra={1}
          intensity={1.5}
          color="#D4A853"
          castShadow
        />
        <pointLight position={[-10, -10, -10]} intensity={0.3} color="#E8C878" />

        <Suspense fallback={null}>
          <FerreroModel />
          <Environment preset="studio" />
          <ContactShadows
            position={[0, -2, 0]}
            opacity={0.4}
            scale={8}
            blur={2}
            far={4}
          />
        </Suspense>

        <Particles />
      </Canvas>
    </motion.div>
  )
}
