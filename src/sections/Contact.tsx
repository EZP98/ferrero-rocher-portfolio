import { useRef, useEffect } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { MapPin } from 'lucide-react'

gsap.registerPlugin(ScrollTrigger)

export function Contact() {
  const sectionRef = useRef<HTMLElement>(null)
  const headingRef = useRef<HTMLDivElement>(null)
  const infoRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Heading animation
      const headingChars = headingRef.current?.querySelectorAll('.char')
      if (headingChars) {
        gsap.from(headingChars, {
          scrollTrigger: {
            trigger: headingRef.current,
            start: 'top 85%',
          },
          y: 80,
          opacity: 0,
          rotationX: -60,
          stagger: 0.02,
          duration: 1,
          ease: 'power3.out',
        })
      }

      // Info items
      const infoItems = infoRef.current?.querySelectorAll('.contact-item')
      if (infoItems) {
        gsap.from(infoItems, {
          scrollTrigger: {
            trigger: infoRef.current,
            start: 'top 80%',
          },
          y: 50,
          opacity: 0,
          stagger: 0.15,
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
      id="contact"
      ref={sectionRef}
      className="relative z-20 min-h-screen py-32 overflow-hidden"
      style={{
        background: 'linear-gradient(180deg, var(--color-darker) 0%, var(--color-dark) 50%, #0d0906 100%)',
      }}
    >
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-5">
        <div
          className="w-full h-full"
          style={{
            backgroundImage: `radial-gradient(circle at center, var(--color-gold) 1px, transparent 1px)`,
            backgroundSize: '50px 50px',
          }}
        />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-12">
        {/* Section heading */}
        <div ref={headingRef} className="mb-20 text-center">
          <span className="text-[var(--color-gold)] uppercase tracking-[0.3em] text-xs mb-4 block">
            {splitChars('Dove Trovarci')}
          </span>
          <h2 className="luxury-title text-5xl md:text-7xl lg:text-8xl">
            <div className="overflow-hidden">
              <span className="block">{splitChars('Il Gusto')}</span>
            </div>
            <div className="overflow-hidden">
              <span className="block gradient-text">{splitChars('Ti Aspetta')}</span>
            </div>
          </h2>
          <p className="text-white/50 text-lg mt-8 max-w-xl mx-auto">
            Ferrero Rocher è disponibile nei migliori punti vendita di tutto il mondo.
            Trova il tuo momento di dolcezza.
          </p>
        </div>

        <div ref={infoRef} className="max-w-4xl mx-auto">
          {/* Ferrero Info */}
          <div className="grid md:grid-cols-3 gap-8 mb-16">
            <div className="contact-item glass rounded-2xl p-8 text-center">
              <div className="w-16 h-16 rounded-full bg-[var(--color-gold)]/10 flex items-center justify-center mx-auto mb-4">
                <MapPin size={24} className="text-[var(--color-gold)]" />
              </div>
              <h3 className="text-white font-semibold mb-2">Sede Centrale</h3>
              <p className="text-white/50 text-sm">
                Alba, Piemonte<br />Italia
              </p>
            </div>

            <div className="contact-item glass rounded-2xl p-8 text-center">
              <div className="w-16 h-16 rounded-full bg-[var(--color-gold)]/10 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🌍</span>
              </div>
              <h3 className="text-white font-semibold mb-2">Presenza Globale</h3>
              <p className="text-white/50 text-sm">
                Oltre 170 paesi<br />nel mondo
              </p>
            </div>

            <div className="contact-item glass rounded-2xl p-8 text-center">
              <div className="w-16 h-16 rounded-full bg-[var(--color-gold)]/10 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🏭</span>
              </div>
              <h3 className="text-white font-semibold mb-2">Produzione</h3>
              <p className="text-white/50 text-sm">
                Stabilimenti in<br />Europa e Canada
              </p>
            </div>
          </div>

          {/* Quote */}
          <div className="contact-item text-center pt-12 border-t border-white/10">
            <blockquote className="text-2xl md:text-3xl text-white/80 font-light italic mb-6">
              "Un momento di puro piacere, avvolto nell'oro della tradizione italiana."
            </blockquote>
            <cite className="text-[var(--color-gold)] text-sm uppercase tracking-widest">
              — Ferrero Rocher
            </cite>
          </div>
        </div>
      </div>

      {/* Decorative elements */}
      <div className="absolute top-1/3 left-0 w-64 h-64 bg-[var(--color-gold)]/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-0 w-96 h-96 bg-[var(--color-gold)]/5 rounded-full blur-3xl pointer-events-none" />
    </section>
  )
}
