import { useRef, Suspense, useMemo } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { useGLTF, Environment, Stars, Sparkles } from '@react-three/drei'
import * as THREE from 'three'
import { useScrollProgress } from '../contexts/ScrollContext'
import { useDebug } from '../contexts/DebugContext'

// Send component selection to parent (for debug console)
function sendComponentSelection(componentId: string) {
  if (typeof window === 'undefined' || window.parent === window) return
  window.parent.postMessage({ type: 'COMPONENT_SELECTED', componentId }, '*')
}

// Send Ferrero state to parent window (for debug console)
let lastSentState = ''
function sendFerreroStateToParent(state: {
  rotX: number
  rotY: number
  rotZ: number
  posX: number
  posY: number
  posZ: number
  scale: number
  scrollProgress: number
  activeCard: string | null
}) {
  if (typeof window === 'undefined' || window.parent === window) return
  const stateStr = JSON.stringify(state)
  if (stateStr === lastSentState) return
  lastSentState = stateStr
  window.parent.postMessage({ type: 'FERRERO_STATE', state }, '*')
}

// Send code structure info to parent (once on load)
let structureSent = false
function sendCodeStructureToParent() {
  if (typeof window === 'undefined' || window.parent === window || structureSent) return
  structureSent = true

  const sections = [
    { id: 'hero', name: 'Hero', component: '<Hero />', file: 'sections/Hero.tsx', height: '600vh', scrollRange: '0-60%' },
    { id: 'transition', name: 'Transition', component: '<Transition />', file: 'sections/Transition.tsx', height: '500vh', scrollRange: '60-100%' },
  ]

  const cards = [
    { id: 1, title: 'La Copertura', startScroll: 0.15, endScroll: 0.28, position: 'right' },
    { id: 2, title: 'Il Cuore', startScroll: 0.30, endScroll: 0.43, position: 'left' },
    { id: 3, title: "L'Eleganza", startScroll: 0.45, endScroll: 0.58, position: 'right' },
  ]

  const ferreroStages = [
    { name: 'Fade-in', range: '0-10%', rotX: 0, rotY: 0, posX: 0 },
    { name: 'Idle', range: '10-15%', rotX: 0, rotY: 0, posX: 0 },
    { name: 'Copertura', range: '15-30%', rotX: '0 → -0.6', rotY: '0 → π/2', posX: '0 → -2' },
    { name: 'Cuore', range: '30-45%', rotX: '-0.6 → -0.3', rotY: 'π/2 → π', posX: '-2 → +2' },
    { name: 'Eleganza', range: '45-60%', rotX: '-0.3 → 0', rotY: 'π → 1.3π', posX: '+2 → 0' },
    { name: 'Spin', range: '60%+', rotX: 0, rotY: 'continuous', posX: 0 },
  ]

  // Controllable components info
  const components = [
    { id: 'ferrero', name: 'Ferrero Model', controls: ['rotX', 'rotY', 'rotZ', 'posX', 'posY', 'posZ', 'scale'] },
    { id: 'title', name: 'Title Overlay', controls: ['opacity', 'fadeSpeed', 'titleText', 'subtitleText'] },
    { id: 'cards', name: 'Info Cards', controls: ['globalOpacity', 'backgroundColor', 'accentColor', 'padding', 'borderRadius'] },
    { id: 'lighting', name: 'Lighting', controls: ['ambientIntensity', 'mainSpotIntensity', 'rimLightIntensity', 'fillLightIntensity'] },
  ]

  window.parent.postMessage({
    type: 'CODE_STRUCTURE',
    data: { sections, cards, ferreroStages, components }
  }, '*')
}

if (typeof window !== 'undefined') {
  setTimeout(sendCodeStructureToParent, 500)
}

// ============ FERRERO MODEL ============
function FerreroModel({ scrollProgress }: { scrollProgress: number }) {
  const meshRef = useRef<THREE.Group>(null)
  const { viewport, clock } = useThree()
  const { scene } = useGLTF('/models/ferrero.glb')
  const { debugState } = useDebug()
  const timeRef = useRef(0)

  // Apply material properties to all meshes in the model
  useMemo(() => {
    scene.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh
        if (mesh.material) {
          const mat = mesh.material as THREE.MeshStandardMaterial
          if (mat.isMeshStandardMaterial) {
            mat.needsUpdate = true
          }
        }
      }
    })
  }, [scene])

  useFrame((_, delta) => {
    if (!meshRef.current) return
    timeRef.current += delta

    const ferrero = debugState.ferrero
    const time = clock.getElapsedTime()

    // Apply material properties when enabled
    if (ferrero.enabled) {
      scene.traverse((child) => {
        if ((child as THREE.Mesh).isMesh) {
          const mesh = child as THREE.Mesh
          if (mesh.material && (mesh.material as THREE.MeshStandardMaterial).isMeshStandardMaterial) {
            const mat = mesh.material as THREE.MeshStandardMaterial
            mat.metalness = ferrero.metalness
            mat.roughness = ferrero.roughness
            mat.emissive = new THREE.Color(ferrero.emissiveColor)
            mat.emissiveIntensity = ferrero.emissiveIntensity
            mat.wireframe = ferrero.wireframe
          }
        }
      })
    }

    // DEBUG MODE: Use values from debug console
    if (ferrero.enabled) {
      let baseRotY = ferrero.rotY
      let basePosY = ferrero.posY

      // Auto-rotation effect
      if (ferrero.autoRotate) {
        baseRotY += time * ferrero.autoRotateSpeed
      }

      // Float effect (sine wave on Y position)
      if (ferrero.floatEnabled) {
        basePosY += Math.sin(time * ferrero.floatSpeed) * ferrero.floatAmplitude
      }

      // Bounce effect (abs sine wave)
      if (ferrero.bounceEnabled) {
        basePosY += Math.abs(Math.sin(time * ferrero.bounceSpeed)) * ferrero.bounceAmplitude
      }

      meshRef.current.rotation.x = ferrero.rotX
      meshRef.current.rotation.y = baseRotY
      meshRef.current.rotation.z = ferrero.rotZ
      meshRef.current.position.x = ferrero.posX
      meshRef.current.position.y = basePosY
      meshRef.current.position.z = ferrero.posZ
      meshRef.current.scale.setScalar(ferrero.scale)

      // Explode effect - move children outward
      if (ferrero.explodeEnabled && ferrero.explodeAmount > 0) {
        scene.traverse((child) => {
          if ((child as THREE.Mesh).isMesh) {
            const mesh = child as THREE.Mesh
            const direction = mesh.position.clone().normalize()
            mesh.position.add(direction.multiplyScalar(ferrero.explodeAmount * 0.01))
          }
        })
      }
      return
    }

    // NORMAL MODE: Scroll-based animation (original hardcoded logic)
    // Ferrero visible immediately from the start
    const fadeInProgress = 1

    let targetRotationX = 0
    let targetRotationY = 0
    let targetPosX = 0

    // Initial rotation to show the logo side
    const initialRotationY = -Math.PI * 0.5  // -90 degrees (opposite side)

    if (scrollProgress < 0.15) {
      targetRotationX = 0
      targetRotationY = initialRotationY
      targetPosX = 0
    } else if (scrollProgress < 0.30) {
      const t = (scrollProgress - 0.15) / 0.15
      targetRotationX = -0.6 * t
      targetRotationY = initialRotationY + Math.PI * 0.5 * t
      targetPosX = -2 * t
    } else if (scrollProgress < 0.45) {
      const t = (scrollProgress - 0.30) / 0.15
      targetRotationX = -0.6 + 0.3 * t
      targetRotationY = initialRotationY + Math.PI * 0.5 + Math.PI * 0.5 * t
      targetPosX = -2 + 4 * t
    } else if (scrollProgress < 0.60) {
      const t = (scrollProgress - 0.45) / 0.15
      targetRotationX = -0.3 + 0.3 * t
      targetRotationY = initialRotationY + Math.PI + Math.PI * 0.3 * t
      targetPosX = 2 - 2 * t
    } else {
      targetRotationX = 0
      targetRotationY = initialRotationY + Math.PI * 1.3 + (scrollProgress - 0.60) * Math.PI * 2
      targetPosX = 0
    }

    meshRef.current.rotation.x = THREE.MathUtils.lerp(meshRef.current.rotation.x, targetRotationX, 0.08)
    meshRef.current.rotation.y = THREE.MathUtils.lerp(meshRef.current.rotation.y, targetRotationY, 0.08)
    meshRef.current.position.x = THREE.MathUtils.lerp(meshRef.current.position.x, targetPosX, 0.08)

    // Big scale from the start, grows slightly as you scroll
    const baseScale = viewport.width > 10 ? 3.0 : 2.2
    const maxScale = viewport.width > 10 ? 3.8 : 3.0
    const scaleProgress = Math.max(0, Math.min(scrollProgress / 0.60, 1))
    const dynamicScale = baseScale + (maxScale - baseScale) * scaleProgress
    meshRef.current.scale.setScalar(dynamicScale)

    // Position Ferrero lower on screen (negative Y = down)
    const baseY = -0.8
    meshRef.current.position.y = baseY

    // Fade-in effect via material opacity
    scene.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh
        if (mesh.material) {
          const mat = mesh.material as THREE.MeshStandardMaterial
          if (mat.isMeshStandardMaterial) {
            // Only use transparency during fade-in, disable when fully visible
            mat.transparent = fadeInProgress < 1
            mat.opacity = fadeInProgress
            mat.depthWrite = fadeInProgress >= 1
          }
        }
      }
    })

    // Send state to debug console
    let activeCard: string | null = null
    if (scrollProgress >= 0.15 && scrollProgress < 0.28) activeCard = 'La Copertura'
    else if (scrollProgress >= 0.30 && scrollProgress < 0.43) activeCard = 'Il Cuore'
    else if (scrollProgress >= 0.45 && scrollProgress < 0.58) activeCard = "L'Eleganza"

    sendFerreroStateToParent({
      rotX: meshRef.current.rotation.x,
      rotY: meshRef.current.rotation.y,
      rotZ: meshRef.current.rotation.z,
      posX: meshRef.current.position.x,
      posY: meshRef.current.position.y,
      posZ: meshRef.current.position.z,
      scale: meshRef.current.scale.x,
      scrollProgress,
      activeCard,
    })
  })

  // Handle click on Ferrero model
  const handleClick = () => {
    sendComponentSelection('ferrero')
  }

  return (
    <group onClick={handleClick}>
      <primitive ref={meshRef} object={scene} scale={2.2} />
    </group>
  )
}

// ============ LIGHTING ============
function SceneLighting() {
  const { debugState } = useDebug()
  const lighting = debugState.lighting

  // Use debug values if enabled, otherwise defaults
  const ambient = lighting.enabled ? lighting.ambientIntensity : 0.15
  const mainSpot = lighting.enabled ? lighting.mainSpotIntensity : 3
  const mainColor = lighting.enabled ? lighting.mainSpotColor : '#FFFFFF'
  const rimIntensity = lighting.enabled ? lighting.rimLightIntensity : 2
  const rimColor = lighting.enabled ? lighting.rimLightColor : '#D4A853'
  const fillIntensity = lighting.enabled ? lighting.fillLightIntensity : 1.5
  const fillColor = lighting.enabled ? lighting.fillLightColor : '#E8C878'

  return (
    <>
      <ambientLight intensity={ambient} />
      <spotLight
        position={[0, 12, 5]}
        angle={0.4}
        penumbra={0.8}
        intensity={mainSpot}
        color={mainColor}
        castShadow
      />
      <spotLight
        position={[8, 2, 4]}
        angle={0.5}
        penumbra={1}
        intensity={rimIntensity}
        color={rimColor}
      />
      <spotLight
        position={[-8, 0, 4]}
        angle={0.5}
        penumbra={1}
        intensity={fillIntensity}
        color={fillColor}
      />
      {/* Standard point lights */}
      <pointLight position={[0, -8, 2]} intensity={0.4} color="#5A3A28" />
      <pointLight position={[0, 5, -10]} intensity={0.6} color="#FFD700" />

      {/* Additional debug lights */}
      {lighting.enabled && lighting.topLightEnabled && (
        <spotLight
          position={[0, 15, 0]}
          angle={0.6}
          penumbra={1}
          intensity={lighting.topLightIntensity}
          color={lighting.topLightColor}
        />
      )}
      {lighting.enabled && lighting.bottomLightEnabled && (
        <pointLight
          position={[0, -10, 0]}
          intensity={lighting.bottomLightIntensity}
          color={lighting.bottomLightColor}
        />
      )}
    </>
  )
}

// ============ PARTICLES ============
function ParticleSystem() {
  const { debugState } = useDebug()
  const particles = debugState.particles

  if (!particles.enabled) return null

  return (
    <Sparkles
      count={particles.count}
      size={particles.size * 10}
      color={particles.color}
      speed={particles.speed}
      scale={particles.spread}
      opacity={particles.opacity}
    />
  )
}

// ============ BACKGROUND EFFECTS ============
function BackgroundEffects() {
  const { debugState } = useDebug()
  const background = debugState.background

  if (!background.enabled) return null

  return (
    <>
      {background.starsEnabled && (
        <Stars
          radius={100}
          depth={50}
          count={background.starsCount}
          factor={4}
          saturation={0}
          fade
          speed={background.starsSpeed}
        />
      )}
    </>
  )
}

// ============ CSS-BASED EFFECTS OVERLAY ============
// Returns null - effects are applied via CSS in the main component
function PostProcessingEffects() {
  return null
}

// ============ CAMERA CONTROLLER ============
function CameraController() {
  const { debugState } = useDebug()
  const { camera, clock } = useThree()
  const cam = debugState.camera

  useFrame(() => {
    if (!cam.enabled) return

    // Update camera position
    camera.position.x = cam.positionX
    camera.position.y = cam.positionY
    camera.position.z = cam.positionZ

    // Auto orbit
    if (cam.autoOrbit) {
      const time = clock.getElapsedTime()
      camera.position.x = Math.sin(time * cam.orbitSpeed) * cam.positionZ
      camera.position.z = Math.cos(time * cam.orbitSpeed) * cam.positionZ
    }

    // Look at target
    camera.lookAt(cam.targetX, cam.targetY, cam.targetZ)

    // Update FOV
    if ((camera as THREE.PerspectiveCamera).isPerspectiveCamera) {
      const perspCam = camera as THREE.PerspectiveCamera
      if (perspCam.fov !== cam.fov) {
        perspCam.fov = cam.fov
        perspCam.updateProjectionMatrix()
      }
    }
  })

  return null
}

// ============ TITLE OVERLAY ============
function TitleOverlay({ scrollProgress }: { scrollProgress: number }) {
  const { debugState } = useDebug()
  const title = debugState.title

  // Use debug values if enabled
  const fadeSpeed = title.enabled ? title.fadeSpeed : 7
  const calculatedOpacity = Math.max(0, 1 - scrollProgress * fadeSpeed)
  const opacity = title.enabled ? title.opacity * calculatedOpacity : calculatedOpacity

  if (opacity <= 0) return null

  const [firstWord, secondWord] = title.enabled
    ? title.titleText.split(' ')
    : ['FERRERO', 'ROCHER']
  const subtitle = title.enabled ? title.subtitleText : "L'arte del cioccolato"

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    sendComponentSelection('title')
  }

  return (
    <div
      className="absolute inset-0 z-30 flex items-start justify-center pt-[25vh]"
      style={{ opacity, pointerEvents: opacity > 0 ? 'auto' : 'none' }}
      onClick={handleClick}
    >
      <div className="text-center cursor-pointer hover:scale-105 transition-transform">
        <span className="block text-[var(--color-gold)] uppercase tracking-[0.3em] text-[10px] mb-4 opacity-60">
          {subtitle}
        </span>
        <h1 className="luxury-title text-4xl md:text-6xl lg:text-7xl leading-[0.9]">
          <span className="block text-white">{firstWord}</span>
          <span className="block gradient-text">{secondWord}</span>
        </h1>
      </div>
    </div>
  )
}

// ============ INFO CARDS ============
const infoCardsData = [
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

function InfoCards({ scrollProgress }: { scrollProgress: number }) {
  const { debugState } = useDebug()
  const cards = debugState.cards

  // Dynamic styles based on debug state
  const cardStyle: React.CSSProperties = {
    width: '320px',
    padding: cards.enabled ? `${cards.padding}px` : '28px 32px',
    backgroundColor: cards.enabled ? cards.backgroundColor : 'rgba(20, 20, 20, 0.85)',
    backdropFilter: `blur(${cards.enabled ? cards.blur : 20}px)`,
    WebkitBackdropFilter: `blur(${cards.enabled ? cards.blur : 20}px)`,
    borderRadius: cards.enabled ? `${cards.borderRadius}px` : '20px',
    border: `1px solid ${cards.enabled ? cards.borderColor : 'rgba(255, 255, 255, 0.08)'}`,
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
  }

  const accentStyle: React.CSSProperties = {
    width: '40px',
    height: '3px',
    backgroundColor: cards.enabled ? cards.accentColor : '#d4a853',
    borderRadius: '2px',
    marginBottom: '20px',
  }

  return (
    <>
      {infoCardsData.map((card) => {
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

        // Apply global opacity from debug
        if (cards.enabled) {
          opacity *= cards.globalOpacity
        }

        if (opacity <= 0) return null

        const isRight = card.position === 'right'
        const slideOffset = isRight ? (1 - opacity) * 40 : (opacity - 1) * 40

        const handleCardClick = (e: React.MouseEvent) => {
          e.stopPropagation()
          sendComponentSelection('cards')
        }

        return (
          <div
            key={card.id}
            onClick={handleCardClick}
            style={{
              position: 'absolute',
              top: '50%',
              zIndex: 30,
              cursor: 'pointer',
              ...(isRight ? { right: '48px' } : { left: '48px' }),
              opacity,
              transform: `translateY(-50%) translateX(${slideOffset}px)`,
              transition: 'opacity 0.1s ease-out, transform 0.2s ease-out',
            }}
          >
            <div style={{ ...cardStyle, transition: 'transform 0.2s ease-out' }} className="hover:scale-105">
              <div style={accentStyle} />
              <h3 style={{
                margin: 0,
                marginBottom: '14px',
                fontSize: '22px',
                fontWeight: 600,
                color: '#ffffff',
                fontFamily: 'Inter, system-ui, sans-serif',
                letterSpacing: '-0.02em',
              }}>
                {card.title}
              </h3>
              <p style={{
                margin: 0,
                fontSize: '14px',
                fontWeight: 400,
                color: 'rgba(255, 255, 255, 0.65)',
                lineHeight: 1.7,
                fontFamily: 'Inter, system-ui, sans-serif',
              }}>
                {card.description}
              </p>
            </div>
          </div>
        )
      })}
    </>
  )
}

// ============ DYNAMIC BACKGROUND ============
function DynamicBackground() {
  const { debugState } = useDebug()
  const bg = debugState.background

  if (!bg.enabled) {
    return <color attach="background" args={['#0A0A0A']} />
  }

  if (bg.gradientEnabled) {
    // For gradient, we use a simple solid color as Three.js doesn't support CSS gradients
    // The gradient effect would need a custom shader or plane
    return <color attach="background" args={[bg.gradientTop]} />
  }

  return <color attach="background" args={[bg.color]} />
}

// ============ MAIN SCENE3D ============
export function Scene3D() {
  const { scrollProgress } = useScrollProgress()
  const { debugState } = useDebug()
  const pp = debugState.postProcessing

  // Check if in debug mode (iframe from console)
  const isDebugMode = debugState.enabled || debugState.ferrero.enabled

  return (
    <div className="canvas-container">
      {/* Hide overlays in debug mode - only show 3D model */}
      {!isDebugMode && <TitleOverlay scrollProgress={scrollProgress} />}
      {!isDebugMode && <InfoCards scrollProgress={scrollProgress} />}

      {/* CSS Gradient Background when enabled */}
      {debugState.background.enabled && debugState.background.gradientEnabled && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: `linear-gradient(180deg, ${debugState.background.gradientTop} 0%, ${debugState.background.gradientBottom} 100%)`,
            zIndex: -1,
          }}
        />
      )}

      <Canvas
        camera={{ position: [0, 0, 10], fov: 35 }}
        dpr={[1, 2]}
        gl={{ antialias: true, alpha: true }}
      >
        <DynamicBackground />
        <SceneLighting />

        {/* Camera Controller */}
        <CameraController />

        <Suspense fallback={null}>
          <FerreroModel scrollProgress={scrollProgress} />
          <Environment preset="apartment" />

          {/* Particles */}
          <ParticleSystem />

          {/* Background Stars */}
          <BackgroundEffects />
        </Suspense>

        {/* Post Processing Effects */}
        <PostProcessingEffects />
      </Canvas>

      {/* CSS-based Post-Processing Effects */}
      {pp.enabled && (
        <>
          {/* Vignette Effect */}
          {pp.vignetteEnabled && (
            <div
              style={{
                position: 'absolute',
                inset: 0,
                pointerEvents: 'none',
                zIndex: 50,
                background: `radial-gradient(ellipse at center, transparent ${(1 - pp.vignetteOffset) * 100}%, rgba(0,0,0,${pp.vignetteIntensity}) 100%)`,
              }}
            />
          )}
          {/* Bloom Glow Effect (approximated with CSS) */}
          {pp.bloomEnabled && (
            <div
              style={{
                position: 'absolute',
                inset: 0,
                pointerEvents: 'none',
                zIndex: 49,
                backdropFilter: `brightness(${1 + pp.bloomIntensity * 0.1}) contrast(${1 + pp.bloomIntensity * 0.05})`,
                WebkitBackdropFilter: `brightness(${1 + pp.bloomIntensity * 0.1}) contrast(${1 + pp.bloomIntensity * 0.05})`,
              }}
            />
          )}
          {/* Noise Effect */}
          {pp.noiseEnabled && (
            <div
              style={{
                position: 'absolute',
                inset: 0,
                pointerEvents: 'none',
                zIndex: 51,
                opacity: pp.noiseIntensity,
                backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 256 256\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noise\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.65\' numOctaves=\'3\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noise)\'/%3E%3C/svg%3E")',
              }}
            />
          )}
        </>
      )}
    </div>
  )
}

useGLTF.preload('/models/ferrero.glb')
