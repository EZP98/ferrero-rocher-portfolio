import { useRef, useEffect } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

const phrases = [
  { text: 'Concentrate', highlight: false },
  { text: 'Keep Scrolling', highlight: false },
  { text: 'The Experience Awaits', highlight: true },
]

export function Transition() {
  const sectionRef = useRef<HTMLElement>(null)
  const phrasesRef = useRef<(HTMLSpanElement | null)[]>([])

  useEffect(() => {
    const ctx = gsap.context(() => {
      phrases.forEach((_, index) => {
        const phrase = phrasesRef.current[index]
        if (!phrase) return

        const chars = phrase.querySelectorAll('.char')

        // Animate in
        gsap.fromTo(
          chars,
          {
            y: 100,
            opacity: 0,
            rotationX: -90,
          },
          {
            y: 0,
            opacity: 1,
            rotationX: 0,
            stagger: 0.02,
            duration: 0.8,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: sectionRef.current,
              start: `${15 + index * 30}% center`,
              end: `${35 + index * 30}% center`,
              scrub: 1,
            },
          }
        )

        // Animate out
        gsap.to(chars, {
          y: -100,
          opacity: 0,
          rotationX: 90,
          stagger: 0.01,
          scrollTrigger: {
            trigger: sectionRef.current,
            start: `${40 + index * 25}% center`,
            end: `${60 + index * 25}% center`,
            scrub: 1,
          },
        })
      })
    }, sectionRef)

    return () => ctx.revert()
  }, [])

  const splitChars = (text: string) => {
    return text.split('').map((char, i) => (
      <span
        key={i}
        className="char inline-block"
        style={{ transformStyle: 'preserve-3d' }}
      >
        {char === ' ' ? '\u00A0' : char}
      </span>
    ))
  }

  return (
    <section
      ref={sectionRef}
      className="relative h-[300vh] flex items-center justify-center overflow-hidden bg-[var(--color-darker)]"
    >
      <div className="sticky top-0 h-screen w-full flex items-center justify-center">
        <div className="text-center perspective-1000">
          {phrases.map((phrase, index) => (
            <span
              key={index}
              ref={(el) => { phrasesRef.current[index] = el }}
              className={`absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 luxury-title text-5xl md:text-7xl lg:text-8xl whitespace-nowrap ${
                phrase.highlight ? 'gradient-text' : 'text-white/90'
              }`}
              style={{ transformStyle: 'preserve-3d' }}
            >
              {splitChars(phrase.text)}
            </span>
          ))}
        </div>
      </div>

      {/* Progress line */}
      <div className="fixed left-1/2 bottom-20 -translate-x-1/2 w-px h-24 bg-white/10 overflow-hidden z-20">
        <div
          className="w-full bg-[var(--color-gold)]"
          style={{
            height: '100%',
            transform: 'scaleY(var(--progress, 0))',
            transformOrigin: 'top',
          }}
        />
      </div>
    </section>
  )
}
