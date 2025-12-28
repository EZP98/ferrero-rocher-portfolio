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

  const content = (
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
  )

  // Wrap with DebugProvider when in debug mode
  if (isDebugMode) {
    return <DebugProvider>{content}</DebugProvider>
  }

  return content
}
