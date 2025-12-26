import { useRef, useEffect } from 'react'
import { motion } from 'framer-motion'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { SplitText } from '../components/SplitText'
import { ParallaxSection } from '../components/ParallaxSection'

gsap.registerPlugin(ScrollTrigger)

const skills = [
  { name: 'React / Next.js', level: 95 },
  { name: 'Three.js / WebGL', level: 85 },
  { name: 'TypeScript', level: 90 },
  { name: 'GSAP / Framer Motion', level: 88 },
  { name: 'Node.js', level: 82 },
  { name: 'UI/UX Design', level: 78 },
]

export function About() {
  const sectionRef = useRef<HTMLElement>(null)

  useEffect(() => {
    if (!sectionRef.current) return

    const bars = sectionRef.current.querySelectorAll('.skill-bar-fill')

    gsap.fromTo(
      bars,
      { scaleX: 0 },
      {
        scaleX: 1,
        duration: 1.2,
        stagger: 0.1,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top 60%',
        },
      }
    )
  }, [])

  return (
    <section
      id="about"
      ref={sectionRef}
      className="relative py-32 md:py-48 overflow-hidden"
    >
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid md:grid-cols-2 gap-16 md:gap-24">
          <div>
            <motion.span
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-[var(--color-gold)] uppercase tracking-[0.3em] text-sm mb-6 block"
            >
              About Me
            </motion.span>

            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold font-[family-name:var(--font-display)] mb-8">
              <SplitText trigger="#about">Passion Meets</SplitText>
              <br />
              <span className="gradient-text">
                <SplitText trigger="#about" delay={0.3}>Precision</SplitText>
              </span>
            </h2>

            <ParallaxSection speed={0.2}>
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: 0.4 }}
                className="space-y-6 text-white/70"
              >
                <p>
                  I'm a creative developer based in Italy, specializing in crafting
                  immersive digital experiences that blend stunning visuals with
                  seamless functionality.
                </p>
                <p>
                  With expertise in modern web technologies and 3D graphics,
                  I transform ideas into interactive realities that engage and
                  inspire users.
                </p>
              </motion.div>
            </ParallaxSection>
          </div>

          <div>
            <motion.span
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-white/40 uppercase tracking-[0.3em] text-sm mb-8 block"
            >
              Skills & Expertise
            </motion.span>

            <div className="space-y-6">
              {skills.map((skill, index) => (
                <motion.div
                  key={skill.name}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <div className="flex justify-between mb-2">
                    <span className="text-white/90">{skill.name}</span>
                    <span className="text-[var(--color-gold)]">{skill.level}%</span>
                  </div>
                  <div className="h-1 bg-white/10 rounded-full overflow-hidden">
                    <div
                      className="skill-bar-fill h-full bg-gradient-to-r from-[var(--color-gold)] to-[var(--color-gold-light)] rounded-full origin-left"
                      style={{ transform: `scaleX(${skill.level / 100})` }}
                    />
                  </div>
                </motion.div>
              ))}
            </div>

            <div className="grid grid-cols-3 gap-6 mt-12 pt-12 border-t border-white/10">
              {[
                { value: '5+', label: 'Years Exp.' },
                { value: '50+', label: 'Projects' },
                { value: '30+', label: 'Clients' },
              ].map((stat, index) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: 0.6 + index * 0.1 }}
                  className="text-center"
                >
                  <div className="text-3xl md:text-4xl font-bold gradient-text mb-1">
                    {stat.value}
                  </div>
                  <div className="text-sm text-white/50">{stat.label}</div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="absolute top-1/2 left-0 w-96 h-96 bg-[var(--color-gold)]/5 rounded-full blur-3xl -translate-y-1/2 pointer-events-none" />
    </section>
  )
}
