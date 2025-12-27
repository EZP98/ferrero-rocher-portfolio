import { useRef, Suspense, useEffect, useState } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { useGLTF, Environment } from '@react-three/drei'
import * as THREE from 'three'

function FerreroModel({
  scrollProgress,
  debugMode = false,
  debugValues
}: {
  scrollProgress: number
  debugMode?: boolean
  debugValues?: { rotX: number; rotY: number; rotZ: number; posX: number; posY: number; posZ: number; scale: number }
}) {
  const meshRef = useRef<THREE.Group>(null)
  const { viewport } = useThree()
  const { scene } = useGLTF('/models/ferrero.glb')

  useFrame(() => {
    if (meshRef.current) {
      // DEBUG MODE: Use manual values from control panel
      if (debugMode && debugValues) {
        meshRef.current.rotation.x = debugValues.rotX
        meshRef.current.rotation.y = debugValues.rotY
        meshRef.current.rotation.z = debugValues.rotZ
        meshRef.current.position.x = debugValues.posX
        meshRef.current.position.y = debugValues.posY
        meshRef.current.position.z = debugValues.posZ
        const s = debugValues.scale
        meshRef.current.scale.set(s, s, s)
        return
      }

      // NORMAL MODE: Scroll-based animation
      // Ferrero starts invisible and fades in when scrolling (0-10% scroll)
      const fadeInProgress = Math.min(scrollProgress * 10, 1)

      // Define rotation stops at different scroll percentages
      let targetRotationX = 0
      let targetRotationY = 0
      let targetPosX = 0

      if (scrollProgress < 0.15) {
        targetRotationX = 0
        targetRotationY = 0
        targetPosX = 0
      } else if (scrollProgress < 0.30) {
        const t = (scrollProgress - 0.15) / 0.15
        targetRotationX = -0.6 * t
        targetRotationY = Math.PI * 0.5 * t
        targetPosX = -2 * t
      } else if (scrollProgress < 0.45) {
        const t = (scrollProgress - 0.30) / 0.15
        targetRotationX = -0.6 + 0.3 * t
        targetRotationY = Math.PI * 0.5 + Math.PI * 0.5 * t
        targetPosX = -2 + 4 * t
      } else if (scrollProgress < 0.60) {
        const t = (scrollProgress - 0.45) / 0.15
        targetRotationX = -0.3 + 0.3 * t
        targetRotationY = Math.PI + Math.PI * 0.3 * t
        targetPosX = 2 - 2 * t
      } else {
        targetRotationX = 0
        targetRotationY = Math.PI * 1.3 + (scrollProgress - 0.60) * Math.PI * 2
        targetPosX = 0
      }

      meshRef.current.rotation.x = THREE.MathUtils.lerp(meshRef.current.rotation.x, targetRotationX, 0.08)
      meshRef.current.rotation.y = THREE.MathUtils.lerp(meshRef.current.rotation.y, targetRotationY, 0.08)
      meshRef.current.position.x = THREE.MathUtils.lerp(meshRef.current.position.x, targetPosX, 0.08)

      const baseScale = viewport.width > 10 ? 2.2 : 1.6
      const targetScale = baseScale * fadeInProgress
      meshRef.current.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), 0.08)
    }
  })

  const scale = viewport.width > 10 ? 2.5 : 1.8

  return (
    <primitive ref={meshRef} object={scene} scale={scale} />
  )
}

// Title overlay that fades on scroll
function TitleOverlay({ scrollProgress }: { scrollProgress: number }) {
  // Fade out when scroll starts (0-15% scroll = full fade)
  const opacity = Math.max(0, 1 - scrollProgress * 7)

  if (opacity <= 0) return null

  return (
    <div
      className="absolute inset-0 z-30 flex items-center justify-center pointer-events-none"
      style={{ opacity }}
    >
      <div className="text-center">
        <span className="block text-[var(--color-gold)] uppercase tracking-[0.3em] text-[10px] mb-4 opacity-60">
          L'arte del cioccolato
        </span>
        <h1 className="luxury-title text-4xl md:text-6xl lg:text-7xl leading-[0.9]">
          <span className="block text-white">FERRERO</span>
          <span className="block gradient-text">ROCHER</span>
        </h1>
      </div>
    </div>
  )
}

// Info cards data
const infoCards = [
  {
    id: 1,
    title: 'La Copertura',
    description: 'Cioccolato al latte finissimo con granella di nocciole tostate che avvolge ogni pezzo in una croccantezza unica.',
    position: 'right',
    startScroll: 0.15,
    endScroll: 0.28,
  },
  {
    id: 2,
    title: 'Il Cuore',
    description: 'Una nocciola intera tostata racchiusa in una cialda croccante e immersa in una cremosa crema gianduia.',
    position: 'left',
    startScroll: 0.30,
    endScroll: 0.43,
  },
  {
    id: 3,
    title: "L'Eleganza",
    description: "Avvolto in carta dorata con l'iconico pirottino marrone, simbolo di raffinatezza italiana dal 1982.",
    position: 'right',
    startScroll: 0.45,
    endScroll: 0.58,
  },
]

// Info cards that appear at scroll positions
function InfoCards({ scrollProgress }: { scrollProgress: number }) {
  return (
    <>
      {infoCards.map((card) => {
        // Calculate opacity based on scroll position
        const fadeInStart = card.startScroll
        const fadeInEnd = card.startScroll + 0.03
        const fadeOutStart = card.endScroll - 0.03
        const fadeOutEnd = card.endScroll

        let opacity = 0
        if (scrollProgress >= fadeInStart && scrollProgress <= fadeInEnd) {
          opacity = (scrollProgress - fadeInStart) / (fadeInEnd - fadeInStart)
        } else if (scrollProgress > fadeInEnd && scrollProgress < fadeOutStart) {
          opacity = 1
        } else if (scrollProgress >= fadeOutStart && scrollProgress <= fadeOutEnd) {
          opacity = 1 - (scrollProgress - fadeOutStart) / (fadeOutEnd - fadeOutStart)
        }

        if (opacity <= 0) return null

        const isRight = card.position === 'right'

        return (
          <div
            key={card.id}
            className={`absolute top-1/2 -translate-y-1/2 z-30 ${
              isRight ? 'right-8 lg:right-16' : 'left-8 lg:left-16'
            }`}
            style={{
              opacity,
              transform: `translateY(-50%) translateX(${isRight ? (1 - opacity) * 30 : (opacity - 1) * 30}px)`,
            }}
          >
            <div className="backdrop-blur-xl bg-black/40 border border-white/10 rounded-2xl p-6 lg:p-8 max-w-[300px] lg:max-w-[350px]">
              {/* Gold accent */}
              <div className="w-12 h-0.5 bg-gradient-to-r from-[var(--color-gold)] to-transparent mb-4" />

              {/* Title */}
              <h3 className="text-xl lg:text-2xl font-medium text-white mb-3">
                {card.title}
              </h3>

              {/* Description */}
              <p className="text-white/60 text-sm lg:text-base leading-relaxed">
                {card.description}
              </p>
            </div>
          </div>
        )
      })}
    </>
  )
}

// Debug control panel
function ControlPanel({
  values,
  onChange,
}: {
  values: { rotX: number; rotY: number; rotZ: number; posX: number; posY: number; posZ: number; scale: number }
  onChange: (key: string, value: number) => void
}) {
  return (
    <div className="fixed top-4 left-4 z-[100] bg-black/90 backdrop-blur p-4 rounded-xl border border-white/20 text-white text-xs w-64">
      <h3 className="text-[var(--color-gold)] font-bold mb-3 text-sm">Ferrero Controls</h3>

      <div className="space-y-3">
        <div>
          <label className="block text-white/60 mb-1">Rotation X: {values.rotX.toFixed(2)}</label>
          <input type="range" min="-3.14" max="3.14" step="0.01" value={values.rotX}
            onChange={(e) => onChange('rotX', parseFloat(e.target.value))}
            className="w-full accent-[var(--color-gold)]" />
        </div>

        <div>
          <label className="block text-white/60 mb-1">Rotation Y: {values.rotY.toFixed(2)}</label>
          <input type="range" min="-3.14" max="3.14" step="0.01" value={values.rotY}
            onChange={(e) => onChange('rotY', parseFloat(e.target.value))}
            className="w-full accent-[var(--color-gold)]" />
        </div>

        <div>
          <label className="block text-white/60 mb-1">Rotation Z: {values.rotZ.toFixed(2)}</label>
          <input type="range" min="-3.14" max="3.14" step="0.01" value={values.rotZ}
            onChange={(e) => onChange('rotZ', parseFloat(e.target.value))}
            className="w-full accent-[var(--color-gold)]" />
        </div>

        <hr className="border-white/10" />

        <div>
          <label className="block text-white/60 mb-1">Position X: {values.posX.toFixed(2)}</label>
          <input type="range" min="-5" max="5" step="0.1" value={values.posX}
            onChange={(e) => onChange('posX', parseFloat(e.target.value))}
            className="w-full accent-[var(--color-gold)]" />
        </div>

        <div>
          <label className="block text-white/60 mb-1">Position Y: {values.posY.toFixed(2)}</label>
          <input type="range" min="-5" max="5" step="0.1" value={values.posY}
            onChange={(e) => onChange('posY', parseFloat(e.target.value))}
            className="w-full accent-[var(--color-gold)]" />
        </div>

        <div>
          <label className="block text-white/60 mb-1">Position Z: {values.posZ.toFixed(2)}</label>
          <input type="range" min="-5" max="5" step="0.1" value={values.posZ}
            onChange={(e) => onChange('posZ', parseFloat(e.target.value))}
            className="w-full accent-[var(--color-gold)]" />
        </div>

        <hr className="border-white/10" />

        <div>
          <label className="block text-white/60 mb-1">Scale: {values.scale.toFixed(2)}</label>
          <input type="range" min="0.5" max="5" step="0.1" value={values.scale}
            onChange={(e) => onChange('scale', parseFloat(e.target.value))}
            className="w-full accent-[var(--color-gold)]" />
        </div>
      </div>

      <div className="mt-4 p-2 bg-white/5 rounded text-[10px] font-mono">
        rotX: {values.rotX.toFixed(2)}, rotY: {values.rotY.toFixed(2)}, rotZ: {values.rotZ.toFixed(2)}<br/>
        posX: {values.posX.toFixed(2)}, posY: {values.posY.toFixed(2)}, posZ: {values.posZ.toFixed(2)}<br/>
        scale: {values.scale.toFixed(2)}
      </div>
    </div>
  )
}

export function Scene3D() {
  const [scrollProgress, setScrollProgress] = useState(0)
  const [debugMode] = useState(false) // Debug panel disabled
  const [controlValues, setControlValues] = useState({
    rotX: 0,
    rotY: 0,
    rotZ: 0,
    posX: 0,
    posY: 0,
    posZ: 0,
    scale: 2.2,
  })

  const handleControlChange = (key: string, value: number) => {
    setControlValues(prev => ({ ...prev, [key]: value }))
  }

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
      {debugMode && <ControlPanel values={controlValues} onChange={handleControlChange} />}
      <TitleOverlay scrollProgress={scrollProgress} />
      <InfoCards scrollProgress={scrollProgress} />
      <Canvas
        camera={{ position: [0, 0, 10], fov: 35 }}
        dpr={[1, 2]}
        gl={{ antialias: true, alpha: true }}
      >
        <color attach="background" args={['#0A0A0A']} />

        {/* Soft ambient for base illumination */}
        <ambientLight intensity={0.15} />

        {/* Main spotlight from above - dramatic opening effect */}
        <spotLight
          position={[0, 12, 5]}
          angle={0.4}
          penumbra={0.8}
          intensity={3}
          color="#FFFFFF"
          castShadow
        />

        {/* Golden rim light from the right */}
        <spotLight
          position={[8, 2, 4]}
          angle={0.5}
          penumbra={1}
          intensity={2}
          color="#D4A853"
        />

        {/* Complementary light from the left */}
        <spotLight
          position={[-8, 0, 4]}
          angle={0.5}
          penumbra={1}
          intensity={1.5}
          color="#E8C878"
        />

        {/* Bottom fill light - subtle warmth */}
        <pointLight position={[0, -8, 2]} intensity={0.4} color="#5A3A28" />

        {/* Back light for depth */}
        <pointLight position={[0, 5, -10]} intensity={0.6} color="#FFD700" />

        <Suspense fallback={null}>
          <FerreroModel
            scrollProgress={scrollProgress}
            debugMode={debugMode}
            debugValues={controlValues}
          />
          <Environment preset="apartment" />
        </Suspense>
      </Canvas>
    </div>
  )
}

useGLTF.preload('/models/ferrero.glb')
