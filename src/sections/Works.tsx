import { useRef, useEffect } from 'react'
import { motion } from 'framer-motion'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { ExternalLink, Github } from 'lucide-react'
import { SplitText } from '../components/SplitText'

gsap.registerPlugin(ScrollTrigger)

const projects = [
  {
    title: 'Ferrero Experience',
    category: '3D / WebGL',
    description: 'Immersive 3D product showcase with interactive animations',
    color: '#D4A853',
  },
  {
    title: 'Design Editor',
    category: 'Web App',
    description: 'Full-featured design editor with real-time collaboration',
    color: '#E8C878',
  },
  {
    title: 'Cocktail AI',
    category: 'AI / Full Stack',
    description: 'AI-powered cocktail recommendation and bar management system',
    color: '#B8923F',
  },
]

export function Works() {
  const sectionRef = useRef<HTMLElement>(null)

  useEffect(() => {
    if (!sectionRef.current) return

    gsap.to('.works-title', {
      x: -200,
      scrollTrigger: {
        trigger: sectionRef.current,
        start: 'top bottom',
        end: 'bottom top',
        scrub: 1,
      },
    })
  }, [])

  return (
    <section
      id="works"
      ref={sectionRef}
      className="relative py-32 md:py-48 overflow-hidden"
    >
      <div className="max-w-7xl mx-auto px-6">
        <div className="mb-20">
          <motion.span
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-[var(--color-gold)] uppercase tracking-[0.3em] text-sm mb-6 block"
          >
            Selected Works
          </motion.span>

          <h2 className="works-title text-5xl md:text-7xl lg:text-8xl font-bold font-[family-name:var(--font-display)]">
            <SplitText trigger="#works">Featured</SplitText>
            <br />
            <span className="gradient-text">
              <SplitText trigger="#works" delay={0.3}>Projects</SplitText>
            </span>
          </h2>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-12">
          {projects.map((project, index) => (
            <motion.div
              key={project.title}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.15 }}
              whileHover={{ y: -10 }}
              className="group"
            >
              <div
                className="relative aspect-[4/3] overflow-hidden rounded-lg mb-6"
                style={{ background: `linear-gradient(135deg, ${project.color}20, ${project.color}05)` }}
              >
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-6xl font-bold opacity-10">{index + 1}</span>
                </div>

                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-end p-6">
                  <div className="flex gap-4">
                    <a href="#" className="p-3 bg-[var(--color-gold)] text-[var(--color-dark)] rounded-full hover:bg-[var(--color-gold-light)] transition-colors">
                      <ExternalLink size={20} />
                    </a>
                    <a href="#" className="p-3 bg-white/10 text-white rounded-full hover:bg-white/20 transition-colors">
                      <Github size={20} />
                    </a>
                  </div>
                </div>

                <div
                  className="absolute inset-0 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                  style={{ boxShadow: `inset 0 0 0 1px ${project.color}40, 0 0 30px ${project.color}20` }}
                />
              </div>

              <span className="text-sm text-[var(--color-gold)] uppercase tracking-wider">
                {project.category}
              </span>
              <h3 className="text-2xl font-bold mt-2 mb-3 group-hover:text-[var(--color-gold)] transition-colors">
                {project.title}
              </h3>
              <p className="text-white/60">{project.description}</p>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="text-center mt-16"
        >
          <a
            href="#"
            className="inline-flex items-center gap-3 px-8 py-4 border border-[var(--color-gold)] text-[var(--color-gold)] hover:bg-[var(--color-gold)] hover:text-[var(--color-dark)] transition-all group"
          >
            View All Projects
            <ExternalLink size={18} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
          </a>
        </motion.div>
      </div>

      <div className="absolute bottom-0 right-0 w-96 h-96 bg-[var(--color-gold)]/5 rounded-full blur-3xl pointer-events-none" />
    </section>
  )
}
