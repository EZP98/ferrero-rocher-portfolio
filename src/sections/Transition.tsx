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
  const phrasesRef = useRef<(HTMLSpanElement | null)[]>([])

  useEffect(() => {
    const ctx = gsap.context(() => {
      const totalPhrases = phrases.length
      const segmentSize = 100 / (totalPhrases + 1) // Distribute evenly

      phrases.forEach((_, index) => {
        const phrase = phrasesRef.current[index]
        if (!phrase) return

        const chars = phrase.querySelectorAll('.char')

        // Calculate positions for each phrase
        const startIn = index * segmentSize
        const endIn = startIn + segmentSize * 0.6
        const startOut = endIn + segmentSize * 0.2
        const endOut = startOut + segmentSize * 0.5

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
              start: `${startIn}% center`,
              end: `${endIn}% center`,
              scrub: 1,
            },
          }
        )

        // Animate out (except last phrase which stays longer)
        if (index < totalPhrases - 1) {
          gsap.to(chars, {
            y: -100,
            opacity: 0,
            rotationX: 90,
            stagger: 0.01,
            scrollTrigger: {
              trigger: sectionRef.current,
              start: `${startOut}% center`,
              end: `${endOut}% center`,
              scrub: 1,
            },
          })
        } else {
          // Last phrase fades out at the very end
          gsap.to(chars, {
            y: -50,
            opacity: 0,
            stagger: 0.01,
            scrollTrigger: {
              trigger: sectionRef.current,
              start: '90% center',
              end: '100% center',
              scrub: 1,
            },
          })
        }
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
      className="relative h-[600vh] flex items-center justify-center overflow-hidden bg-[var(--color-darker)]"
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
