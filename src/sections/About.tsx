import { useRef, useEffect } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { ImpulseString } from '../components/ImpulseString'

gsap.registerPlugin(ScrollTrigger)

const ingredients = [
  { name: 'Cioccolato Fondente', level: 100 },
  { name: 'Nocciola Piemonte IGP', level: 95 },
  { name: 'Crema Gianduia', level: 90 },
  { name: 'Cialda Croccante', level: 85 },
  { name: 'Nocciola Intera', level: 80 },
]

const stats = [
  { value: '1982', label: 'Anno di Nascita' },
  { value: '170+', label: 'Paesi nel Mondo' },
  { value: '3B+', label: 'Pezzi Venduti/Anno' },
  { value: '24', label: 'Nocciole per Pezzo' },
]

export function About() {
  const sectionRef = useRef<HTMLElement>(null)
  const headingRef = useRef<HTMLDivElement>(null)
  const textRef = useRef<HTMLDivElement>(null)
  const skillsRef = useRef<HTMLDivElement>(null)
  const statsRef = useRef<HTMLDivElement>(null)
  const horizontalTextRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Horizontal scrolling text
      gsap.to(horizontalTextRef.current, {
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top bottom',
          end: 'bottom top',
          scrub: 1,
        },
        x: '-30%',
        ease: 'none',
      })

      // Heading reveal
      const headingChars = headingRef.current?.querySelectorAll('.char')
      if (headingChars) {
        gsap.from(headingChars, {
          scrollTrigger: {
            trigger: headingRef.current,
            start: 'top 80%',
            end: 'top 50%',
            scrub: 1,
          },
          y: 100,
          opacity: 0,
          rotationX: -90,
          stagger: 0.03,
        })
      }

      // Text paragraphs
      const paragraphs = textRef.current?.querySelectorAll('p')
      if (paragraphs) {
        gsap.from(paragraphs, {
          scrollTrigger: {
            trigger: textRef.current,
            start: 'top 75%',
          },
          y: 60,
          opacity: 0,
          stagger: 0.2,
          duration: 1,
          ease: 'power3.out',
        })
      }

      // Skills bars
      const skillBars = skillsRef.current?.querySelectorAll('.skill-bar')
      if (skillBars) {
        skillBars.forEach((bar, i) => {
          const fill = bar.querySelector('.skill-fill')
          gsap.from(fill, {
            scrollTrigger: {
              trigger: bar,
              start: 'top 85%',
            },
            scaleX: 0,
            transformOrigin: 'left center',
            duration: 1.5,
            delay: i * 0.1,
            ease: 'power3.out',
          })
        })
      }

      // Stats animation
      const statItems = statsRef.current?.querySelectorAll('.stat-item')
      if (statItems) {
        gsap.from(statItems, {
          scrollTrigger: {
            trigger: statsRef.current,
            start: 'top 85%',
          },
          y: 50,
          opacity: 0,
          stagger: 0.1,
          duration: 0.8,
          ease: 'power3.out',
        })
      }
    }, sectionRef)

    return () => ctx.revert()
  }, [])

  const splitChars = (text: string) => {
    return text.split('').map((char, i) => (
      <span key={i} className="char inline-block">
        {char === ' ' ? '\u00A0' : char}
      </span>
    ))
  }

  return (
    <section
      id="about"
      ref={sectionRef}
      className="relative min-h-screen py-32 overflow-hidden bg-[var(--color-dark)]"
    >
      {/* Horizontal scrolling background text */}
      <div
        ref={horizontalTextRef}
        className="absolute top-1/2 -translate-y-1/2 left-0 whitespace-nowrap pointer-events-none select-none z-0"
      >
        <span className="horizontal-scroll-text">
          FERRERO ROCHER • TRADIZIONE ITALIANA • FERRERO ROCHER • TRADIZIONE ITALIANA •
        </span>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-12">
        {/* Section heading */}
        <div ref={headingRef} className="mb-20">
          <span className="text-[var(--color-gold)] uppercase tracking-[0.3em] text-xs mb-4 block">
            {splitChars('La Nostra Storia')}
          </span>
          <h2 className="luxury-title text-5xl md:text-7xl lg:text-8xl">
            <div className="overflow-hidden">
              <span className="block">{splitChars('Perfezione')}</span>
            </div>
            <div className="overflow-hidden">
              <span className="block gradient-text">{splitChars('Artigianale')}</span>
            </div>
          </h2>
        </div>

        <div className="grid lg:grid-cols-2 gap-16 lg:gap-24">
          {/* Left column - Story */}
          <div ref={textRef} className="space-y-8">
            <p className="text-xl md:text-2xl text-white/80 leading-relaxed font-light">
              Nato ad Alba, nel cuore del Piemonte, Ferrero Rocher rappresenta
              <span className="text-[var(--color-gold)]"> l'eccellenza della cioccolateria italiana</span> dal 1982.
            </p>
            <p className="text-lg text-white/60 leading-relaxed">
              Ogni sfera dorata racchiude strati di pura magia: una nocciola intera avvolta
              in vellutata crema gianduia, racchiusa in una croccante cialda di wafer
              e ricoperta di finissimo cioccolato al latte con granella di nocciole.
            </p>
            <p className="text-lg text-white/60 leading-relaxed">
              Perfetto per ogni occasione speciale, Ferrero Rocher è diventato
              il simbolo del regalo raffinato in oltre 170 paesi nel mondo.
            </p>

            {/* CTA */}
            <div className="pt-8">
              <a
                href="#contact"
                className="group inline-flex items-center gap-4 text-[var(--color-gold)] hover:text-[var(--color-gold-light)] transition-colors"
                data-cursor="hover"
              >
                <span className="text-lg">Scopri di più</span>
                <span className="w-12 h-px bg-[var(--color-gold)] group-hover:w-20 transition-all duration-300" />
              </a>
            </div>
          </div>

          {/* Right column - Ingredients */}
          <div ref={skillsRef} className="space-y-8">
            <h3 className="text-white/40 uppercase tracking-widest text-sm mb-8">I Nostri Ingredienti</h3>

            {ingredients.map((ingredient, index) => (
              <div key={index} className="skill-bar">
                <div className="flex justify-between mb-2">
                  <span className="text-white/80">{ingredient.name}</span>
                  <span className="text-[var(--color-gold)]">{ingredient.level}%</span>
                </div>
                <div className="h-1 bg-white/10 overflow-hidden">
                  <div
                    className="skill-fill h-full bg-gradient-to-r from-[var(--color-gold)] to-[var(--color-gold-light)]"
                    style={{ width: `${ingredient.level}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Stats */}
        <div
          ref={statsRef}
          className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-32 pt-16 border-t border-white/10"
        >
          {stats.map((stat, index) => (
            <div key={index} className="stat-item text-center">
              <div className="text-4xl md:text-5xl font-bold text-[var(--color-gold)] mb-2">
                {stat.value}
              </div>
              <div className="text-white/40 text-sm uppercase tracking-widest">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Decorative corner elements */}
      <div className="absolute top-0 right-0 w-64 h-64 opacity-5">
        <div className="w-full h-full border-r-2 border-t-2 border-[var(--color-gold)]" />
      </div>
      <div className="absolute bottom-0 left-0 w-64 h-64 opacity-5">
        <div className="w-full h-full border-l-2 border-b-2 border-[var(--color-gold)]" />
      </div>

      {/* Impulse String divider - StringTune style */}
      <div className="absolute bottom-0 left-0 right-0 z-20">
        <ImpulseString className="w-full" color="var(--color-gold)" />
      </div>
    </section>
  )
}
