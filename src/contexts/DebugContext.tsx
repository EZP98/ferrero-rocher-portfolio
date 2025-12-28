import { createContext, useContext, useState, useEffect, ReactNode } from 'react'

// Types for all controllable components
export interface DebugState {
  enabled: boolean

  // Ferrero Model
  ferrero: {
    enabled: boolean
    rotX: number
    rotY: number
    rotZ: number
    posX: number
    posY: number
    posZ: number
    scale: number
    // Animation effects
    autoRotate: boolean
    autoRotateSpeed: number
    floatEnabled: boolean
    floatAmplitude: number
    floatSpeed: number
    bounceEnabled: boolean
    bounceAmplitude: number
    bounceSpeed: number
    // Material properties
    metalness: number
    roughness: number
    emissiveIntensity: number
    emissiveColor: string
    wireframe: boolean
    // Visual effects
    explodeEnabled: boolean
    explodeAmount: number
  }

  // Title Overlay
  title: {
    enabled: boolean
    opacity: number
    fadeSpeed: number
    titleText: string
    subtitleText: string
    // Text effects
    glowEnabled: boolean
    glowColor: string
    glowIntensity: number
    animateEnabled: boolean
    animationType: 'none' | 'pulse' | 'wave' | 'typewriter'
  }

  // Info Cards
  cards: {
    enabled: boolean
    globalOpacity: number
    backgroundColor: string
    borderColor: string
    accentColor: string
    padding: number
    borderRadius: number
    blur: number
    // Card effects
    glowEnabled: boolean
    glowColor: string
    animateIn: 'fade' | 'slide' | 'scale' | 'flip'
  }

  // Lighting
  lighting: {
    enabled: boolean
    ambientIntensity: number
    mainSpotIntensity: number
    mainSpotColor: string
    rimLightIntensity: number
    rimLightColor: string
    fillLightIntensity: number
    fillLightColor: string
    // Additional lights
    topLightEnabled: boolean
    topLightIntensity: number
    topLightColor: string
    bottomLightEnabled: boolean
    bottomLightIntensity: number
    bottomLightColor: string
  }

  // Transition Section
  transition: {
    enabled: boolean
    backgroundColor: string
    glowColor: string
    glowIntensity: number
    textColor: string
  }

  // Post-Processing Effects
  postProcessing: {
    enabled: boolean
    bloomEnabled: boolean
    bloomIntensity: number
    bloomThreshold: number
    bloomRadius: number
    vignetteEnabled: boolean
    vignetteIntensity: number
    vignetteOffset: number
    chromaticAberrationEnabled: boolean
    chromaticAberrationOffset: number
    noiseEnabled: boolean
    noiseIntensity: number
  }

  // Camera Controls
  camera: {
    enabled: boolean
    fov: number
    positionX: number
    positionY: number
    positionZ: number
    targetX: number
    targetY: number
    targetZ: number
    autoOrbit: boolean
    orbitSpeed: number
  }

  // Particles
  particles: {
    enabled: boolean
    count: number
    size: number
    color: string
    speed: number
    spread: number
    opacity: number
    type: 'dots' | 'sparkles' | 'snow' | 'stars'
  }

  // Background
  background: {
    enabled: boolean
    color: string
    gradientEnabled: boolean
    gradientTop: string
    gradientBottom: string
    starsEnabled: boolean
    starsCount: number
    starsSpeed: number
  }
}

const defaultDebugState: DebugState = {
  enabled: false,

  ferrero: {
    enabled: false,
    rotX: 0,
    rotY: 0,
    rotZ: 0,
    posX: 0,
    posY: 0,
    posZ: 0,
    scale: 2.2,
    // Animation effects
    autoRotate: false,
    autoRotateSpeed: 1,
    floatEnabled: false,
    floatAmplitude: 0.2,
    floatSpeed: 1,
    bounceEnabled: false,
    bounceAmplitude: 0.1,
    bounceSpeed: 2,
    // Material properties
    metalness: 0.8,
    roughness: 0.2,
    emissiveIntensity: 0,
    emissiveColor: '#d4a853',
    wireframe: false,
    // Visual effects
    explodeEnabled: false,
    explodeAmount: 0,
  },

  title: {
    enabled: false,
    opacity: 1,
    fadeSpeed: 7,
    titleText: 'FERRERO ROCHER',
    subtitleText: "L'arte del cioccolato",
    // Text effects
    glowEnabled: false,
    glowColor: '#d4a853',
    glowIntensity: 10,
    animateEnabled: false,
    animationType: 'none',
  },

  cards: {
    enabled: false,
    globalOpacity: 1,
    backgroundColor: 'rgba(20, 20, 20, 0.85)',
    borderColor: 'rgba(255, 255, 255, 0.08)',
    accentColor: '#d4a853',
    padding: 28,
    borderRadius: 20,
    blur: 20,
    // Card effects
    glowEnabled: false,
    glowColor: '#d4a853',
    animateIn: 'fade',
  },

  lighting: {
    enabled: false,
    ambientIntensity: 0.15,
    mainSpotIntensity: 3,
    mainSpotColor: '#FFFFFF',
    rimLightIntensity: 2,
    rimLightColor: '#D4A853',
    fillLightIntensity: 1.5,
    fillLightColor: '#E8C878',
    // Additional lights
    topLightEnabled: false,
    topLightIntensity: 2,
    topLightColor: '#FFD700',
    bottomLightEnabled: false,
    bottomLightIntensity: 1,
    bottomLightColor: '#5A3A28',
  },

  transition: {
    enabled: false,
    backgroundColor: '#0a0a0a',
    glowColor: '#d4a853',
    glowIntensity: 0.3,
    textColor: '#ffffff',
  },

  postProcessing: {
    enabled: false,
    bloomEnabled: false,
    bloomIntensity: 1,
    bloomThreshold: 0.8,
    bloomRadius: 0.4,
    vignetteEnabled: false,
    vignetteIntensity: 0.5,
    vignetteOffset: 0.5,
    chromaticAberrationEnabled: false,
    chromaticAberrationOffset: 0.002,
    noiseEnabled: false,
    noiseIntensity: 0.1,
  },

  camera: {
    enabled: false,
    fov: 35,
    positionX: 0,
    positionY: 0,
    positionZ: 10,
    targetX: 0,
    targetY: 0,
    targetZ: 0,
    autoOrbit: false,
    orbitSpeed: 0.5,
  },

  particles: {
    enabled: false,
    count: 100,
    size: 0.02,
    color: '#d4a853',
    speed: 0.5,
    spread: 10,
    opacity: 0.6,
    type: 'sparkles',
  },

  background: {
    enabled: false,
    color: '#0A0A0A',
    gradientEnabled: false,
    gradientTop: '#1a1a2e',
    gradientBottom: '#0a0a0a',
    starsEnabled: false,
    starsCount: 200,
    starsSpeed: 0.1,
  },
}

interface DebugContextValue {
  debugState: DebugState
  setDebugState: (state: Partial<DebugState>) => void
  updateComponent: (
    component: keyof DebugState,
    values: Record<string, unknown>
  ) => void
}

const DebugContext = createContext<DebugContextValue | null>(null)

export function DebugProvider({ children }: { children: ReactNode }) {
  const [debugState, setDebugStateInternal] = useState<DebugState>(defaultDebugState)

  // Listen for debug messages from parent window (debug console)
  useEffect(() => {
    const handler = (event: MessageEvent) => {
      if (event.data?.type === 'DEBUG_UPDATE') {
        const { component, values } = event.data
        if (component === 'all') {
          setDebugStateInternal(prev => ({ ...prev, ...values }))
        } else if (component in defaultDebugState) {
          setDebugStateInternal(prev => {
            const key = component as keyof DebugState
            const currentValue = prev[key]
            if (typeof currentValue === 'object' && currentValue !== null) {
              return {
                ...prev,
                [key]: { ...currentValue, ...values }
              }
            }
            return prev
          })
        }
      }

      // Legacy support for FERRERO_DEBUG messages
      if (event.data?.type === 'FERRERO_DEBUG') {
        setDebugStateInternal(prev => ({
          ...prev,
          ferrero: { ...prev.ferrero, ...event.data.values }
        }))
      }
    }

    window.addEventListener('message', handler)
    return () => window.removeEventListener('message', handler)
  }, [])

  // Send current state to parent when it changes
  useEffect(() => {
    if (window.parent !== window) {
      window.parent.postMessage({
        type: 'DEBUG_STATE_SYNC',
        state: debugState
      }, '*')
    }
  }, [debugState])

  const setDebugState = (state: Partial<DebugState>) => {
    setDebugStateInternal(prev => ({ ...prev, ...state }))
  }

  const updateComponent = (
    component: keyof DebugState,
    values: Record<string, unknown>
  ) => {
    setDebugStateInternal(prev => {
      const currentValue = prev[component]
      if (typeof currentValue === 'object' && currentValue !== null) {
        return {
          ...prev,
          [component]: { ...currentValue, ...values }
        }
      }
      return prev
    })
  }

  return (
    <DebugContext.Provider value={{ debugState, setDebugState, updateComponent }}>
      {children}
    </DebugContext.Provider>
  )
}

export function useDebug() {
  const context = useContext(DebugContext)
  if (!context) {
    // Return default state if not in provider (for non-debug mode)
    return {
      debugState: defaultDebugState,
      setDebugState: () => {},
      updateComponent: () => {},
    }
  }
  return context
}

export { defaultDebugState }
