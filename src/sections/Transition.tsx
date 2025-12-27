import { useRef, useEffect } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

const phrases = [
  { text: 'Irresistibile', highlight: false },
  { text: 'Ogni Morso Unico', highlight: false },
  { text: 'Nocciola Piemonte', highlight: true },
  { text: 'Croccante Fuori', highlight: false },
  { text: 'Cremoso Dentro', highlight: false },
  { text: 'Avvolto in Oro', highlight: true },
  { text: 'Dal 1982', highlight: false },
  { text: 'Puro Piacere Italiano', highlight: true },
]

export function Transition() {
  const sectionRef = useRef<HTMLElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
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
  }, [])

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
