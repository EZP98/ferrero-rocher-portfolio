import { useRef, useEffect, useState } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { ExternalLink, Github, ArrowUpRight } from 'lucide-react'

gsap.registerPlugin(ScrollTrigger)

const projects = [
  {
    id: 1,
    title: 'Ferrero Experience',
    category: '3D / WebGL',
    description: 'Immersive 3D product showcase with scroll-linked animations and interactive elements. Built with Three.js and GSAP.',
    tech: ['Three.js', 'React', 'GSAP', 'WebGL'],
    color: '#D4A853',
    year: '2024',
  },
  {
    id: 2,
    title: 'Design Editor',
    category: 'Web Application',
    description: 'Full-featured design editor with real-time collaboration, template system, and export capabilities.',
    tech: ['React', 'TypeScript', 'Supabase', 'Tailwind'],
    color: '#E8C878',
    year: '2024',
  },
  {
    id: 3,
    title: 'Cocktail AI',
    category: 'AI / Full Stack',
    description: 'AI-powered cocktail recommendation and bar management system with voice commands and stock tracking.',
    tech: ['OpenAI', 'React', 'Node.js', 'PostgreSQL'],
    color: '#B8923F',
    year: '2024',
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
      className="relative min-h-screen py-32 overflow-hidden bg-[var(--color-darker)]"
    >
      {/* Horizontal scrolling background text */}
      <div
        ref={horizontalTextRef}
        className="absolute top-1/3 -translate-y-1/2 -left-1/4 whitespace-nowrap pointer-events-none select-none z-0"
      >
        <span className="horizontal-scroll-text">
          SELECTED WORKS • FEATURED PROJECTS • SELECTED WORKS • FEATURED PROJECTS •
        </span>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-12">
        {/* Section heading */}
        <div ref={headingRef} className="mb-24">
          <span className="text-[var(--color-gold)] uppercase tracking-[0.3em] text-xs mb-4 block">
            {splitChars('Selected Works')}
          </span>
          <h2 className="luxury-title text-5xl md:text-7xl lg:text-8xl">
            <div className="overflow-hidden">
              <span className="block">{splitChars('Featured')}</span>
            </div>
            <div className="overflow-hidden">
              <span className="block gradient-text">{splitChars('Projects')}</span>
            </div>
          </h2>
        </div>

        {/* Projects grid */}
        <div ref={projectsRef} className="space-y-16">
          {projects.map((project, index) => (
            <div
              key={project.id}
              className="project-card group relative"
              onMouseEnter={() => setHoveredProject(project.id)}
              onMouseLeave={() => setHoveredProject(null)}
            >
              <div className="grid lg:grid-cols-2 gap-8 lg:gap-16 items-center">
                {/* Project image/preview */}
                <div
                  className={`relative aspect-[16/10] overflow-hidden ${
                    index % 2 === 1 ? 'lg:order-2' : ''
                  }`}
                >
                  <div
                    className="absolute inset-0 transition-transform duration-700 ease-out group-hover:scale-105"
                    style={{
                      background: `linear-gradient(135deg, ${project.color}30, ${project.color}05)`,
                    }}
                  >
                    {/* Project number */}
                    <div className="absolute top-6 left-6 text-8xl font-bold text-white/5 leading-none">
                      0{index + 1}
                    </div>

                    {/* Hover overlay */}
                    <div
                      className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                      style={{
                        background: `linear-gradient(135deg, ${project.color}40, ${project.color}20)`,
                      }}
                    >
                      <div className="flex gap-4">
                        <a
                          href="#"
                          className="w-14 h-14 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center text-white hover:bg-white/20 transition-colors"
                          data-cursor="hover"
                        >
                          <ExternalLink size={22} />
                        </a>
                        <a
                          href="#"
                          className="w-14 h-14 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center text-white hover:bg-white/20 transition-colors"
                          data-cursor="hover"
                        >
                          <Github size={22} />
                        </a>
                      </div>
                    </div>
                  </div>

                  {/* Border glow on hover */}
                  <div
                    className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                    style={{
                      boxShadow: `inset 0 0 0 1px ${project.color}60, 0 0 40px ${project.color}20`,
                    }}
                  />
                </div>

                {/* Project info */}
                <div className={index % 2 === 1 ? 'lg:order-1 lg:text-right' : ''}>
                  <div className="flex items-center gap-4 mb-4">
                    <span className="text-[var(--color-gold)] text-sm uppercase tracking-wider">
                      {project.category}
                    </span>
                    <span className="text-white/30 text-sm">{project.year}</span>
                  </div>

                  <h3 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 transition-colors duration-300 group-hover:text-[var(--color-gold)]">
                    {project.title}
                  </h3>

                  <p className="text-white/60 text-lg mb-6 max-w-md">
                    {project.description}
                  </p>

                  {/* Tech stack */}
                  <div className={`flex flex-wrap gap-2 mb-8 ${index % 2 === 1 ? 'lg:justify-end' : ''}`}>
                    {project.tech.map((tech) => (
                      <span
                        key={tech}
                        className="px-3 py-1 text-xs uppercase tracking-wider text-white/40 border border-white/10 rounded-full"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>

                  {/* View project link */}
                  <a
                    href="#"
                    className={`inline-flex items-center gap-2 text-white/70 hover:text-[var(--color-gold)] transition-colors group/link ${
                      index % 2 === 1 ? 'lg:flex-row-reverse' : ''
                    }`}
                    data-cursor="hover"
                  >
                    <span className="text-sm uppercase tracking-wider">View Project</span>
                    <ArrowUpRight
                      size={18}
                      className="transform transition-transform group-hover/link:translate-x-1 group-hover/link:-translate-y-1"
                    />
                  </a>
                </div>
              </div>

              {/* Separator line */}
              {index < projects.length - 1 && (
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
            <span className="uppercase tracking-wider text-sm">View All Projects</span>
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
