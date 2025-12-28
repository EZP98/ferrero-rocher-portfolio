import { useRef, useEffect } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useScrollProgress } from '../contexts/ScrollContext'

gsap.registerPlugin(ScrollTrigger)

export const phrases = [
  { text: 'Irresistibile', highlight: false },
  { text: 'Ogni Morso Unico', highlight: false },
  { text: 'Nocciola Piemonte', highlight: true },
  { text: 'Croccante Fuori', highlight: false },
  { text: 'Cremoso Dentro', highlight: false },
  { text: 'Avvolto in Oro', highlight: true },
  { text: 'Dal 1982', highlight: false },
  { text: 'Puro Piacere Italiano', highlight: true },
]

// Standalone content component for use in DebugPage
export function TransitionContent({ localProgress }: { localProgress: number }) {
  const containerRef = useRef<HTMLDivElement>(null)
  const sectionPercent = 1 / phrases.length

  // Animate characters based on localProgress
  useEffect(() => {
    const phraseElements = containerRef.current?.querySelectorAll('.phrase')
    if (!phraseElements) return

    phraseElements.forEach((phrase, index) => {
      const chars = phrase.querySelectorAll('.char') as NodeListOf<HTMLElement>

      const start = index * sectionPercent
      const fadeInEnd = start + sectionPercent * 0.3
      const mid = start + sectionPercent * 0.5
      const end = start + sectionPercent

      chars.forEach((char, charIndex) => {
        const charDelay = charIndex * 0.015
        let opacity = 0
        let y = 80
        let rotationX = -45

        if (localProgress >= start + charDelay && localProgress < end) {
          if (localProgress < fadeInEnd + charDelay) {
            const t = (localProgress - start - charDelay) / (fadeInEnd - start)
            opacity = Math.max(0, Math.min(1, t))
            y = 80 * (1 - opacity)
            rotationX = -45 * (1 - opacity)
          } else if (localProgress < mid) {
            opacity = 1
            y = 0
            rotationX = 0
          } else if (index < phrases.length - 1) {
            const t = (localProgress - mid) / (end - mid)
            opacity = Math.max(0, 1 - t)
            y = -80 * t
            rotationX = 45 * t
          } else {
            if (localProgress < 0.92) {
              opacity = 1
              y = 0
              rotationX = 0
            } else {
              const t = (localProgress - 0.92) / 0.08
              opacity = 1 - t
              y = -40 * t
              rotationX = 0
            }
          }
        }

        char.style.opacity = String(opacity)
        char.style.transform = `translateY(${y}px) rotateX(${rotationX}deg)`
      })
    })
  }, [localProgress, sectionPercent])

  return (
    <div className="h-full w-full flex items-center justify-center overflow-hidden">
      {/* Background glow */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div
          className="w-[600px] h-[600px] rounded-full opacity-10"
          style={{
            background: 'radial-gradient(circle, var(--color-gold) 0%, transparent 70%)',
          }}
        />
      </div>

      {/* Phrases container */}
      <div ref={containerRef} className="relative w-full px-4">
        {phrases.map((phrase, index) => (
          <div
            key={index}
            className="phrase absolute inset-0 flex items-center justify-center"
            style={{ perspective: '1000px' }}
          >
            <span
              className={`luxury-title text-4xl sm:text-5xl md:text-7xl lg:text-8xl xl:text-9xl text-center leading-tight ${
                phrase.highlight ? 'gradient-text' : 'text-white'
              }`}
              style={{ transformStyle: 'preserve-3d' }}
            >
              {phrase.text.split('').map((char, i) => (
                <span
                  key={i}
                  className="char inline-block"
                  style={{ transformStyle: 'preserve-3d' }}
                >
                  {char === ' ' ? '\u00A0' : char}
                </span>
              ))}
            </span>
          </div>
        ))}
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-12 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-white/30">
        <span className="text-xs uppercase tracking-[0.3em]">Scorri</span>
        <div className="w-px h-12 bg-gradient-to-b from-white/30 to-transparent" />
      </div>
    </div>
  )
}

export function Transition() {
  const sectionRef = useRef<HTMLElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const { scrollProgress, isDebugMode } = useScrollProgress()

  // DEBUG MODE: Direct CSS-based animation controlled by scrollProgress
  useEffect(() => {
    if (!isDebugMode) return

    const phraseElements = containerRef.current?.querySelectorAll('.phrase')
    if (!phraseElements) return

    // Transition section is 60-100% of total scroll
    // Convert global scroll (0.6-1.0) to local (0-1)
    const localProgress = scrollProgress < 0.60 ? 0 : (scrollProgress - 0.60) / 0.40
    const sectionPercent = 1 / phrases.length

    phraseElements.forEach((phrase, index) => {
      const chars = phrase.querySelectorAll('.char') as NodeListOf<HTMLElement>

      const start = index * sectionPercent
      const fadeInEnd = start + sectionPercent * 0.3
      const mid = start + sectionPercent * 0.5
      const end = start + sectionPercent

      chars.forEach((char, charIndex) => {
        const charDelay = charIndex * 0.015 // Stagger effect
        let opacity = 0
        let y = 80
        let rotationX = -45

        if (localProgress >= start + charDelay && localProgress < end) {
          // Fade in phase
          if (localProgress < fadeInEnd + charDelay) {
            const t = (localProgress - start - charDelay) / (fadeInEnd - start)
            opacity = Math.max(0, Math.min(1, t))
            y = 80 * (1 - opacity)
            rotationX = -45 * (1 - opacity)
          }
          // Visible phase
          else if (localProgress < mid) {
            opacity = 1
            y = 0
            rotationX = 0
          }
          // Fade out phase (except last)
          else if (index < phrases.length - 1) {
            const t = (localProgress - mid) / (end - mid)
            opacity = Math.max(0, 1 - t)
            y = -80 * t
            rotationX = 45 * t
          }
          // Last phrase stays
          else {
            if (localProgress < 0.92) {
              opacity = 1
              y = 0
              rotationX = 0
            } else {
              const t = (localProgress - 0.92) / 0.08
              opacity = 1 - t
              y = -40 * t
              rotationX = 0
            }
          }
        }

        char.style.opacity = String(opacity)
        char.style.transform = `translateY(${y}px) rotateX(${rotationX}deg)`
      })
    })
  }, [scrollProgress, isDebugMode])

  // NORMAL MODE: GSAP ScrollTrigger animation
  useEffect(() => {
    if (isDebugMode) return

    const ctx = gsap.context(() => {
      const phraseElements = containerRef.current?.querySelectorAll('.phrase')
      if (!phraseElements) return

      // Each phrase gets its own section of the scroll
      phraseElements.forEach((phrase, index) => {
        const chars = phrase.querySelectorAll('.char')

        // Calculate scroll positions
        const sectionPercent = 100 / phrases.length
        const start = index * sectionPercent
        const mid = start + sectionPercent * 0.5
        const end = start + sectionPercent

        // Set initial state - hidden
        gsap.set(chars, { opacity: 0, y: 80, rotationX: -45 })

        // Animate in
        gsap.to(chars, {
          opacity: 1,
          y: 0,
          rotationX: 0,
          stagger: 0.03,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: sectionRef.current,
            start: `${start}% top`,
            end: `${start + sectionPercent * 0.3}% top`,
            scrub: 0.5,
          },
        })

        // Animate out (except last)
        if (index < phrases.length - 1) {
          gsap.to(chars, {
            opacity: 0,
            y: -80,
            rotationX: 45,
            stagger: 0.02,
            scrollTrigger: {
              trigger: sectionRef.current,
              start: `${mid}% top`,
              end: `${end}% top`,
              scrub: 0.5,
            },
          })
        } else {
          // Last phrase stays longer, fades at very end
          gsap.to(chars, {
            opacity: 0,
            y: -40,
            scrollTrigger: {
              trigger: sectionRef.current,
              start: '92% top',
              end: '100% top',
              scrub: 0.5,
            },
          })
        }
      })
    }, sectionRef)

    return () => ctx.revert()
  }, [isDebugMode])

  return (
    <section
      ref={sectionRef}
      className="relative z-10 h-[500vh]"
      style={{ background: 'linear-gradient(180deg, var(--color-dark) 0%, var(--color-darker) 100%)' }}
    >
      {/* Sticky container */}
      <div className="sticky top-0 h-screen w-full flex items-center justify-center overflow-hidden">
        {/* Background glow */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div
            className="w-[600px] h-[600px] rounded-full opacity-10"
            style={{
              background: 'radial-gradient(circle, var(--color-gold) 0%, transparent 70%)',
            }}
          />
        </div>

        {/* Phrases container */}
        <div ref={containerRef} className="relative w-full px-4">
          {phrases.map((phrase, index) => (
            <div
              key={index}
              className="phrase absolute inset-0 flex items-center justify-center"
              style={{ perspective: '1000px' }}
            >
              <span
                className={`luxury-title text-4xl sm:text-5xl md:text-7xl lg:text-8xl xl:text-9xl text-center leading-tight ${
                  phrase.highlight ? 'gradient-text' : 'text-white'
                }`}
                style={{ transformStyle: 'preserve-3d' }}
              >
                {phrase.text.split('').map((char, i) => (
                  <span
                    key={i}
                    className="char inline-block"
                    style={{ transformStyle: 'preserve-3d' }}
                  >
                    {char === ' ' ? '\u00A0' : char}
                  </span>
                ))}
              </span>
            </div>
          ))}
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-12 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-white/30">
          <span className="text-xs uppercase tracking-[0.3em]">Scorri</span>
          <div className="w-px h-12 bg-gradient-to-b from-white/30 to-transparent" />
        </div>
      </div>
    </section>
  )
}
