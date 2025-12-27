import { useRef, useEffect } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { RotatingCards } from '../components/RotatingCards'

gsap.registerPlugin(ScrollTrigger)

const principles = [
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

const audienceCards = [
  {
    title: 'Per i Golosi',
    description: 'Un momento di puro piacere. Lasciati avvolgere dalla dolcezza.',
  },
  {
    title: 'Per gli Intenditori',
    description: 'Ingredienti pregiati. Nocciole Piemonte IGP. Qualità senza compromessi.',
  },
  {
    title: 'Per le Occasioni',
    description: 'Il regalo perfetto. Eleganza dorata per momenti indimenticabili.',
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
        {/* Top audience cards - like StringTune's "Experienced Developers", etc */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-24">
          {audienceCards.map((card, index) => (
            <div
              key={index}
              className="feature-card group p-6 rounded-xl border border-white/10 bg-white/[0.02] hover:bg-white/[0.04] hover:border-[var(--color-gold)]/30 transition-all duration-500"
            >
              <h4 className="text-[var(--color-gold)] text-lg font-semibold mb-2">
                {card.title}
              </h4>
              <p className="text-white/50 text-sm leading-relaxed">
                {card.description}
              </p>
            </div>
          ))}
        </div>

        {/* Main Title - StringTune style */}
        <div ref={titleRef} className="text-center mb-24" style={{ perspective: '1000px' }}>
          <h2 className="luxury-title text-5xl md:text-7xl lg:text-8xl mb-4">
            <span className="block text-white">{splitChars('Ferrero Rocher')}</span>
          </h2>
          <h2 className="luxury-title text-4xl md:text-6xl lg:text-7xl">
            <span className="block gradient-text">{splitChars('Principi')}</span>
          </h2>
        </div>

        {/* Principles grid - 5 columns like StringTune */}
        <div ref={cardsRef} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-6 mb-16">
          {principles.map((principle, index) => (
            <div
              key={index}
              className="feature-card group text-center"
            >
              {/* Icon */}
              <div className="text-5xl mb-6 group-hover:scale-110 transition-transform duration-300">
                {principle.icon}
              </div>

              {/* Name */}
              <h3 className="text-white font-semibold text-xl mb-3 group-hover:text-[var(--color-gold)] transition-colors">
                {principle.name}
              </h3>

              {/* Tagline */}
              <p className="text-[var(--color-gold)]/80 text-sm mb-3">
                {principle.tagline}
              </p>

              {/* Description */}
              <p className="text-white/40 text-sm leading-relaxed">
                {principle.description}
              </p>
            </div>
          ))}
        </div>

        {/* Bottom tagline - StringTune style */}
        <div className="tagline text-center mt-20">
          <p className="text-white/30 text-sm uppercase tracking-[0.3em]">
            Minimalista, Espressivo, Indimenticabile.
          </p>
        </div>
      </div>

      {/* Rotating Cards Section - separate section with proper spacing */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-12 mt-40 pb-16">
        <RotatingCards />
      </div>

      {/* Decorative elements */}
      <div className="absolute top-1/4 left-0 w-64 h-64 bg-[var(--color-gold)]/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-0 w-96 h-96 bg-[var(--color-gold)]/3 rounded-full blur-3xl pointer-events-none" />
    </section>
  )
}
