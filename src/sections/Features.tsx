import { useRef, useEffect } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

const features = [
  {
    icon: '🌰',
    name: 'Nocciola Intera',
    tagline: 'Il cuore del piacere.',
    description: 'Una nocciola Piemonte IGP intera al centro di ogni sfera.',
  },
  {
    icon: '🍫',
    name: 'Crema Gianduia',
    tagline: 'Vellutata perfezione.',
    description: 'Crema di nocciole e cioccolato che avvolge il cuore croccante.',
  },
  {
    icon: '✨',
    name: 'Wafer Croccante',
    tagline: 'Texture sorprendente.',
    description: 'Un guscio di wafer sottile che aggiunge croccantezza ad ogni morso.',
  },
  {
    icon: '🥛',
    name: 'Cioccolato al Latte',
    tagline: 'Dolcezza avvolgente.',
    description: 'Pregiato cioccolato al latte che racchiude tutti gli strati.',
  },
  {
    icon: '💎',
    name: 'Granella Dorata',
    tagline: 'Finitura artigianale.',
    description: 'Frammenti di nocciola tostata che decorano l\'esterno dorato.',
  },
]

export function Features() {
  const sectionRef = useRef<HTMLElement>(null)
  const titleRef = useRef<HTMLDivElement>(null)
  const cardsRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Title animation
      const titleChars = titleRef.current?.querySelectorAll('.char')
      if (titleChars) {
        gsap.from(titleChars, {
          scrollTrigger: {
            trigger: titleRef.current,
            start: 'top 85%',
          },
          y: 60,
          opacity: 0,
          rotationX: -45,
          stagger: 0.03,
          duration: 0.8,
          ease: 'power3.out',
        })
      }

      // Cards stagger animation
      const cards = cardsRef.current?.querySelectorAll('.feature-card')
      if (cards) {
        gsap.from(cards, {
          scrollTrigger: {
            trigger: cardsRef.current,
            start: 'top 80%',
          },
          y: 80,
          opacity: 0,
          stagger: 0.1,
          duration: 0.8,
          ease: 'power3.out',
        })
      }

      // Tagline animation
      const tagline = sectionRef.current?.querySelector('.tagline')
      if (tagline) {
        gsap.from(tagline, {
          scrollTrigger: {
            trigger: tagline,
            start: 'top 90%',
          },
          y: 30,
          opacity: 0,
          duration: 1,
          ease: 'power3.out',
        })
      }
    }, sectionRef)

    return () => ctx.revert()
  }, [])

  const splitChars = (text: string) => {
    return text.split('').map((char, i) => (
      <span key={i} className="char inline-block" style={{ transformStyle: 'preserve-3d' }}>
        {char === ' ' ? '\u00A0' : char}
      </span>
    ))
  }

  return (
    <section
      ref={sectionRef}
      className="relative z-20 py-32 overflow-hidden"
      style={{ background: 'linear-gradient(180deg, var(--color-darker) 0%, #0a0806 100%)' }}
    >
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-[0.02]">
        <div
          className="w-full h-full"
          style={{
            backgroundImage: `radial-gradient(circle at center, var(--color-gold) 1px, transparent 1px)`,
            backgroundSize: '60px 60px',
          }}
        />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-12">
        {/* Title */}
        <div ref={titleRef} className="text-center mb-20" style={{ perspective: '1000px' }}>
          <span className="text-[var(--color-gold)] uppercase tracking-[0.3em] text-xs mb-4 block">
            {splitChars('L\'Arte del Gusto')}
          </span>
          <h2 className="luxury-title text-4xl md:text-6xl lg:text-7xl">
            <span className="block text-white">{splitChars('Ferrero Rocher')}</span>
            <span className="block gradient-text mt-2">{splitChars('Principi')}</span>
          </h2>
        </div>

        {/* Features grid */}
        <div ref={cardsRef} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 lg:gap-4 mb-16">
          {features.map((feature, index) => (
            <div
              key={index}
              className="feature-card group relative p-6 rounded-2xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.05] hover:border-[var(--color-gold)]/20 transition-all duration-500"
            >
              {/* Icon */}
              <div className="text-4xl mb-4 group-hover:scale-110 transition-transform duration-300">
                {feature.icon}
              </div>

              {/* Name */}
              <h3 className="text-white font-semibold text-lg mb-2 group-hover:text-[var(--color-gold)] transition-colors">
                {feature.name}
              </h3>

              {/* Tagline */}
              <p className="text-[var(--color-gold)]/80 text-sm mb-3 italic">
                {feature.tagline}
              </p>

              {/* Description */}
              <p className="text-white/50 text-sm leading-relaxed">
                {feature.description}
              </p>

              {/* Hover glow */}
              <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                style={{
                  background: 'radial-gradient(circle at 50% 0%, rgba(212,168,83,0.1) 0%, transparent 50%)',
                }}
              />
            </div>
          ))}
        </div>

        {/* Bottom tagline */}
        <div className="tagline text-center">
          <p className="text-white/30 text-sm uppercase tracking-[0.2em]">
            Minimalista, Espressivo, Indimenticabile.
          </p>
        </div>
      </div>

      {/* Decorative elements */}
      <div className="absolute top-1/4 left-0 w-64 h-64 bg-[var(--color-gold)]/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-0 w-96 h-96 bg-[var(--color-gold)]/3 rounded-full blur-3xl pointer-events-none" />
    </section>
  )
}
