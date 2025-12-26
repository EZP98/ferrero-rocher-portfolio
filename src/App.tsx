import { useEffect } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

import { useSmoothScroll } from './hooks/useSmoothScroll'
import { Header } from './components/Header'
import { ScrollProgress } from './components/ScrollProgress'
import { Scene3D } from './components/Scene3D'
import { Hero } from './sections/Hero'
import { About } from './sections/About'
import { Works } from './sections/Works'
import { Contact } from './sections/Contact'

gsap.registerPlugin(ScrollTrigger)

export default function App() {
  useSmoothScroll()

  useEffect(() => {
    // Refresh ScrollTrigger on load
    ScrollTrigger.refresh()

    // Clean up
    return () => {
      ScrollTrigger.getAll().forEach((trigger) => trigger.kill())
    }
  }, [])

  return (
    <>
      {/* Scroll progress indicator */}
      <ScrollProgress />

      {/* 3D Scene (fixed background) */}
      <Scene3D />

      {/* Navigation */}
      <Header />

      {/* Main content */}
      <main>
        <Hero />
        <About />
        <Works />
        <Contact />
      </main>

      {/* Noise overlay */}
      <div className="noise-overlay" />
    </>
  )
}
