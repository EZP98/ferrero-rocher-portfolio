import { useRef, useEffect, useState } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { ArrowUpRight } from 'lucide-react'

gsap.registerPlugin(ScrollTrigger)

const products = [
  {
    id: 1,
    title: 'Ferrero Rocher Classic',
    category: 'La Sfera Dorata',
    description: 'L\'originale: nocciola intera, crema gianduia, cialda croccante e cioccolato al latte con granella di nocciole.',
    details: ['Nocciola Intera', 'Crema Gianduia', 'Wafer Croccante', 'Cioccolato al Latte'],
    color: '#D4A853',
    year: '1982',
  },
  {
    id: 2,
    title: 'Ferrero Rocher Dark',
    category: 'Cioccolato Fondente',
    description: 'Per gli amanti del cioccolato intenso: la stessa magia avvolta in pregiato cioccolato fondente.',
    details: ['Nocciola Intera', 'Crema Fondente', 'Wafer Croccante', 'Cioccolato Fondente'],
    color: '#5A3A28',
    year: '2020',
  },
  {
    id: 3,
    title: 'Grand Ferrero Rocher',
    category: 'Edizione Speciale',
    description: 'Il formato regalo per eccellenza: due Ferrero Rocher racchiusi in un guscio di cioccolato e nocciole.',
    details: ['Doppia Nocciola', 'Guscio Premium', 'Ideale Regalo', 'Limited Edition'],
    color: '#E8C878',
    year: '2015',
  },
]

export function Works() {
  const sectionRef = useRef<HTMLElement>(null)
  const headingRef = useRef<HTMLDivElement>(null)
  const projectsRef = useRef<HTMLDivElement>(null)
  const horizontalTextRef = useRef<HTMLDivElement>(null)
  const [, setHoveredProject] = useState<number | null>(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Horizontal scrolling text (opposite direction)
      gsap.to(horizontalTextRef.current, {
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top bottom',
          end: 'bottom top',
          scrub: 1,
        },
        x: '20%',
        ease: 'none',
      })

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

      // Project cards staggered reveal
      const projectCards = projectsRef.current?.querySelectorAll('.project-card')
      if (projectCards) {
        gsap.from(projectCards, {
          scrollTrigger: {
            trigger: projectsRef.current,
            start: 'top 80%',
          },
          y: 100,
          opacity: 0,
          stagger: 0.15,
          duration: 1,
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
      id="works"
      ref={sectionRef}
      className="relative z-20 min-h-screen py-32 overflow-hidden bg-[var(--color-darker)]"
    >
      {/* Horizontal scrolling background text */}
      <div
        ref={horizontalTextRef}
        className="absolute top-1/3 -translate-y-1/2 -left-1/4 whitespace-nowrap pointer-events-none select-none z-0"
      >
        <span className="horizontal-scroll-text">
          LA COLLEZIONE • PRODOTTI PREMIUM • LA COLLEZIONE • PRODOTTI PREMIUM •
        </span>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-12">
        {/* Section heading */}
        <div ref={headingRef} className="mb-24">
          <span className="text-[var(--color-gold)] uppercase tracking-[0.3em] text-xs mb-4 block">
            {splitChars('La Collezione')}
          </span>
          <h2 className="luxury-title text-5xl md:text-7xl lg:text-8xl">
            <div className="overflow-hidden">
              <span className="block">{splitChars('I Nostri')}</span>
            </div>
            <div className="overflow-hidden">
              <span className="block gradient-text">{splitChars('Prodotti')}</span>
            </div>
          </h2>
        </div>

        {/* Products grid */}
        <div ref={projectsRef} className="space-y-16">
          {products.map((product, index) => (
            <div
              key={product.id}
              className="project-card group relative"
              onMouseEnter={() => setHoveredProject(product.id)}
              onMouseLeave={() => setHoveredProject(null)}
            >
              <div className="grid lg:grid-cols-2 gap-8 lg:gap-16 items-center">
                {/* Product image/preview */}
                <div
                  className={`relative aspect-[16/10] overflow-hidden ${
                    index % 2 === 1 ? 'lg:order-2' : ''
                  }`}
                >
                  <div
                    className="absolute inset-0 transition-transform duration-700 ease-out group-hover:scale-105"
                    style={{
                      background: `linear-gradient(135deg, ${product.color}30, ${product.color}05)`,
                    }}
                  >
                    {/* Product number */}
                    <div className="absolute top-6 left-6 text-8xl font-bold text-white/5 leading-none">
                      0{index + 1}
                    </div>

                    {/* Golden sphere indicator */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div
                        className="w-32 h-32 rounded-full opacity-20 group-hover:opacity-40 transition-opacity duration-500"
                        style={{
                          background: `radial-gradient(circle, ${product.color} 0%, transparent 70%)`
                        }}
                      />
                    </div>
                  </div>

                  {/* Border glow on hover */}
                  <div
                    className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                    style={{
                      boxShadow: `inset 0 0 0 1px ${product.color}60, 0 0 40px ${product.color}20`,
                    }}
                  />
                </div>

                {/* Product info */}
                <div className={index % 2 === 1 ? 'lg:order-1 lg:text-right' : ''}>
                  <div className="flex items-center gap-4 mb-4">
                    <span className="text-[var(--color-gold)] text-sm uppercase tracking-wider">
                      {product.category}
                    </span>
                    <span className="text-white/30 text-sm">{product.year}</span>
                  </div>

                  <h3 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 transition-colors duration-300 group-hover:text-[var(--color-gold)]">
                    {product.title}
                  </h3>

                  <p className="text-white/60 text-lg mb-6 max-w-md">
                    {product.description}
                  </p>

                  {/* Details */}
                  <div className={`flex flex-wrap gap-2 mb-8 ${index % 2 === 1 ? 'lg:justify-end' : ''}`}>
                    {product.details.map((detail) => (
                      <span
                        key={detail}
                        className="px-3 py-1 text-xs uppercase tracking-wider text-white/40 border border-white/10 rounded-full"
                      >
                        {detail}
                      </span>
                    ))}
                  </div>

                  {/* View product link */}
                  <a
                    href="#"
                    className={`inline-flex items-center gap-2 text-white/70 hover:text-[var(--color-gold)] transition-colors group/link ${
                      index % 2 === 1 ? 'lg:flex-row-reverse' : ''
                    }`}
                    data-cursor="hover"
                  >
                    <span className="text-sm uppercase tracking-wider">Scopri</span>
                    <ArrowUpRight
                      size={18}
                      className="transform transition-transform group-hover/link:translate-x-1 group-hover/link:-translate-y-1"
                    />
                  </a>
                </div>
              </div>

              {/* Separator line */}
              {index < products.length - 1 && (
                <div className="mt-16 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
              )}
            </div>
          ))}
        </div>

        {/* View all CTA */}
        <div className="text-center mt-24">
          <a
            href="#"
            className="group inline-flex items-center gap-4 px-8 py-4 border border-[var(--color-gold)] text-[var(--color-gold)] hover:bg-[var(--color-gold)] hover:text-[var(--color-dark)] transition-all duration-300"
            data-cursor="hover"
          >
            <span className="uppercase tracking-wider text-sm">Esplora la Collezione</span>
            <ArrowUpRight size={18} className="transform transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" />
          </a>
        </div>
      </div>

      {/* Decorative elements */}
      <div className="absolute top-1/4 right-0 w-px h-64 bg-gradient-to-b from-transparent via-[var(--color-gold)]/20 to-transparent" />
      <div className="absolute bottom-1/4 left-0 w-px h-64 bg-gradient-to-b from-transparent via-[var(--color-gold)]/20 to-transparent" />
    </section>
  )
}
