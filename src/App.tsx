import { useEffect } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

import { useSmoothScroll } from './hooks/useSmoothScroll'
import { ScrollProgress } from './components/ScrollProgress'
import { Scene3D } from './components/Scene3D'
import { CustomCursor } from './components/CustomCursor'
import { Hero } from './sections/Hero'
import { Transition } from './sections/Transition'
import { DraggableFooter } from './components/DraggableFooter'
import { ScrollProvider } from './contexts/ScrollContext'
import { DebugProvider } from './contexts/DebugContext'
import { AnimationProvider } from './contexts/AnimationContext'

gsap.registerPlugin(ScrollTrigger)

// Check if in debug mode
const isDebugMode = typeof window !== 'undefined' &&
  new URLSearchParams(window.location.search).get('debug') === 'true'

export default function App() {
  useSmoothScroll()

  useEffect(() => {
    // Refresh ScrollTrigger after a delay to ensure all elements are rendered
    const timeout = setTimeout(() => {
      ScrollTrigger.refresh()
    }, 100)

    // Clean up
    return () => {
      clearTimeout(timeout)
      ScrollTrigger.getAll().forEach((trigger) => trigger.kill())
    }
  }, [])

  // DEBUG MODE: Show only 3D scene without Hero/Transition sections
  if (isDebugMode) {
    return (
      <AnimationProvider>
        <DebugProvider>
          <ScrollProvider>
            <div style={{
              position: 'fixed',
              inset: 0,
              background: '#0a0a0a',
            }}>
              <Scene3D />
            </div>
          </ScrollProvider>
        </DebugProvider>
      </AnimationProvider>
    )
  }

  // NORMAL MODE: Full page with all sections
  return (
    <AnimationProvider>
      <ScrollProvider>
      {/* Custom cursor (desktop only) */}
      <div className="hidden md:block">
        <CustomCursor />
      </div>

      {/* Scroll progress indicator */}
      <ScrollProgress />

      {/* 3D Scene (fixed background) */}
      <Scene3D />

      {/* Navigation - temporarily hidden */}
      {/* <Header /> */}

      {/* Main content */}
      <main>
        <Hero />
        <Transition />
      </main>

      {/* Footer with draggable Ferrero Rochers */}
      <DraggableFooter />

      {/* Noise overlay */}
      <div className="noise-overlay" />
      </ScrollProvider>
    </AnimationProvider>
  )
}
