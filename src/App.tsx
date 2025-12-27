import { useEffect } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

import { useSmoothScroll } from './hooks/useSmoothScroll'
import { Header } from './components/Header'
import { ScrollProgress } from './components/ScrollProgress'
import { Scene3D } from './components/Scene3D'
import { CustomCursor } from './components/CustomCursor'
import { Hero } from './sections/Hero'
import { Transition } from './sections/Transition'
import { Features } from './sections/Features'
import { About } from './sections/About'
import { Works } from './sections/Works'
import { Contact } from './sections/Contact'
import { DraggableFooter } from './components/DraggableFooter'

gsap.registerPlugin(ScrollTrigger)

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

  return (
    <>
      {/* Custom cursor (desktop only) */}
      <div className="hidden md:block">
        <CustomCursor />
      </div>

      {/* Scroll progress indicator */}
      <ScrollProgress />

      {/* 3D Scene (fixed background) */}
      <Scene3D />

      {/* Navigation */}
      <Header />

      {/* Main content */}
      <main>
        <Hero />
        <Transition />
        <Features />
        <About />
        <Works />
        <Contact />
      </main>

      {/* Footer with draggable Ferrero Rochers */}
      <DraggableFooter />

      {/* Noise overlay */}
      <div className="noise-overlay" />
    </>
  )
}
