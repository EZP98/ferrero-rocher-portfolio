/**
 * Animation Context
 *
 * Holds the animation config and allows updates via postMessage.
 * The console AI can modify animations in real-time.
 */

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import {
  AnimationConfig,
  defaultAnimationConfig,
  interpolateKeyframes,
  Keyframe
} from '../config/animations'

interface AnimationContextValue {
  config: AnimationConfig
  setConfig: (config: AnimationConfig) => void
  updateFerrero: (keyframes: Keyframe[]) => void
  getFerreroState: (scroll: number) => Keyframe
}

const AnimationContext = createContext<AnimationContextValue | null>(null)

// Storage key for localStorage persistence
const STORAGE_KEY = 'ferrero-animation-config'

export function AnimationProvider({ children }: { children: ReactNode }) {
  const [config, setConfigState] = useState<AnimationConfig>(() => {
    // Try to load from localStorage
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved) {
        try {
          return JSON.parse(saved)
        } catch {
          // Invalid JSON, use default
        }
      }
    }
    return defaultAnimationConfig
  })

  // Save to localStorage when config changes
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(config))
  }, [config])

  // Listen for config updates from parent window (console)
  useEffect(() => {
    const handler = (event: MessageEvent) => {
      if (event.data?.type === 'ANIMATION_CONFIG_UPDATE') {
        const newConfig = event.data.config
        if (newConfig) {
          setConfigState(prev => ({ ...prev, ...newConfig }))
        }
      }

      // Update specific keyframe
      if (event.data?.type === 'ANIMATION_KEYFRAME_UPDATE') {
        const { scroll, values } = event.data
        setConfigState(prev => {
          const keyframes = [...prev.ferrero.keyframes]
          // Find existing keyframe at this scroll or create new
          const existingIndex = keyframes.findIndex(k => Math.abs(k.scroll - scroll) < 0.01)
          if (existingIndex >= 0) {
            keyframes[existingIndex] = { ...keyframes[existingIndex], ...values }
          } else {
            keyframes.push({ scroll, ...values })
            keyframes.sort((a, b) => a.scroll - b.scroll)
          }
          return { ...prev, ferrero: { ...prev.ferrero, keyframes } }
        })
      }

      // Add new keyframe
      if (event.data?.type === 'ANIMATION_ADD_KEYFRAME') {
        const { scroll, values } = event.data
        setConfigState(prev => {
          const keyframes = [...prev.ferrero.keyframes, { scroll, ...values }]
          keyframes.sort((a, b) => a.scroll - b.scroll)
          return { ...prev, ferrero: { ...prev.ferrero, keyframes } }
        })
      }

      // Delete keyframe
      if (event.data?.type === 'ANIMATION_DELETE_KEYFRAME') {
        const { scroll } = event.data
        setConfigState(prev => {
          const keyframes = prev.ferrero.keyframes.filter(k => Math.abs(k.scroll - scroll) >= 0.01)
          return { ...prev, ferrero: { ...prev.ferrero, keyframes } }
        })
      }

      // Reset to default
      if (event.data?.type === 'ANIMATION_RESET') {
        setConfigState(defaultAnimationConfig)
        localStorage.removeItem(STORAGE_KEY)
      }
    }

    window.addEventListener('message', handler)
    return () => window.removeEventListener('message', handler)
  }, [])

  // Send current config to parent when requested
  useEffect(() => {
    const handler = (event: MessageEvent) => {
      if (event.data?.type === 'GET_ANIMATION_CONFIG') {
        window.parent.postMessage({
          type: 'ANIMATION_CONFIG',
          config
        }, '*')
      }
    }

    window.addEventListener('message', handler)

    // Also send on mount if in iframe
    if (window.parent !== window) {
      setTimeout(() => {
        window.parent.postMessage({
          type: 'ANIMATION_CONFIG',
          config
        }, '*')
      }, 500)
    }

    return () => window.removeEventListener('message', handler)
  }, [config])

  const setConfig = (newConfig: AnimationConfig) => {
    setConfigState(newConfig)
  }

  const updateFerrero = (keyframes: Keyframe[]) => {
    setConfigState(prev => ({
      ...prev,
      ferrero: { ...prev.ferrero, keyframes }
    }))
  }

  const getFerreroState = (scroll: number): Keyframe => {
    return interpolateKeyframes(config.ferrero.keyframes, scroll)
  }

  return (
    <AnimationContext.Provider value={{ config, setConfig, updateFerrero, getFerreroState }}>
      {children}
    </AnimationContext.Provider>
  )
}

export function useAnimation() {
  const context = useContext(AnimationContext)
  if (!context) {
    // Return default if not in provider
    return {
      config: defaultAnimationConfig,
      setConfig: () => {},
      updateFerrero: () => {},
      getFerreroState: (scroll: number) => interpolateKeyframes(defaultAnimationConfig.ferrero.keyframes, scroll),
    }
  }
  return context
}
