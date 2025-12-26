import { useRef, useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { Mail, MapPin, Send, Linkedin, Github, Twitter } from 'lucide-react'
import { SplitText } from '../components/SplitText'

gsap.registerPlugin(ScrollTrigger)

const socials = [
  { icon: Github, href: 'https://github.com', label: 'GitHub' },
  { icon: Linkedin, href: 'https://linkedin.com', label: 'LinkedIn' },
  { icon: Twitter, href: 'https://twitter.com', label: 'Twitter' },
]

export function Contact() {
  const sectionRef = useRef<HTMLElement>(null)
  const [formState, setFormState] = useState({ name: '', email: '', message: '' })

  useEffect(() => {
    if (!sectionRef.current) return

    gsap.fromTo(
      '.contact-item',
      { x: -50, opacity: 0 },
      {
        x: 0,
        opacity: 1,
        duration: 0.8,
        stagger: 0.15,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top 70%',
        },
      }
    )
  }, [])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log('Form submitted:', formState)
  }

  return (
    <section
      id="contact"
      ref={sectionRef}
      className="relative py-32 md:py-48 overflow-hidden bg-gradient-to-b from-transparent to-[var(--color-darker)]"
    >
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid lg:grid-cols-2 gap-16 lg:gap-24">
          <div>
            <motion.span
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-[var(--color-gold)] uppercase tracking-[0.3em] text-sm mb-6 block"
            >
              Get in Touch
            </motion.span>

            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold font-[family-name:var(--font-display)] mb-8">
              <SplitText trigger="#contact">Let's Create</SplitText>
              <br />
              <span className="gradient-text">
                <SplitText trigger="#contact" delay={0.3}>Together</SplitText>
              </span>
            </h2>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="text-white/70 text-lg mb-12 max-w-md"
            >
              Have a project in mind? Let's discuss how we can bring your vision to life.
            </motion.p>

            <div className="space-y-6">
              <div className="contact-item flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-[var(--color-gold)]/10 flex items-center justify-center">
                  <Mail size={20} className="text-[var(--color-gold)]" />
                </div>
                <div>
                  <span className="text-white/50 text-sm">Email</span>
                  <a href="mailto:hello@example.com" className="block text-white hover:text-[var(--color-gold)] transition-colors">
                    hello@example.com
                  </a>
                </div>
              </div>

              <div className="contact-item flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-[var(--color-gold)]/10 flex items-center justify-center">
                  <MapPin size={20} className="text-[var(--color-gold)]" />
                </div>
                <div>
                  <span className="text-white/50 text-sm">Location</span>
                  <span className="block text-white">Italy, Europe</span>
                </div>
              </div>
            </div>

            <div className="flex gap-4 mt-12">
              {socials.map(({ icon: Icon, href, label }) => (
                <motion.a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-12 h-12 rounded-full border border-white/20 flex items-center justify-center text-white/70 hover:border-[var(--color-gold)] hover:text-[var(--color-gold)] hover:bg-[var(--color-gold)]/10 transition-all"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Icon size={20} />
                </motion.a>
              ))}
            </div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.3 }}
          >
            <form onSubmit={handleSubmit} className="glass rounded-2xl p-8 md:p-10">
              <div className="space-y-6">
                <div>
                  <label className="block text-white/50 text-sm mb-2">Name</label>
                  <input
                    type="text"
                    value={formState.name}
                    onChange={(e) => setFormState({ ...formState, name: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:border-[var(--color-gold)] focus:outline-none transition-colors"
                    placeholder="Your name"
                    required
                  />
                </div>

                <div>
                  <label className="block text-white/50 text-sm mb-2">Email</label>
                  <input
                    type="email"
                    value={formState.email}
                    onChange={(e) => setFormState({ ...formState, email: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:border-[var(--color-gold)] focus:outline-none transition-colors"
                    placeholder="your@email.com"
                    required
                  />
                </div>

                <div>
                  <label className="block text-white/50 text-sm mb-2">Message</label>
                  <textarea
                    value={formState.message}
                    onChange={(e) => setFormState({ ...formState, message: e.target.value })}
                    rows={5}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:border-[var(--color-gold)] focus:outline-none transition-colors resize-none"
                    placeholder="Tell me about your project..."
                    required
                  />
                </div>

                <motion.button
                  type="submit"
                  className="w-full py-4 bg-[var(--color-gold)] text-[var(--color-dark)] font-medium rounded-lg flex items-center justify-center gap-2 hover:bg-[var(--color-gold-light)] transition-colors"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Send Message
                  <Send size={18} />
                </motion.button>
              </div>
            </form>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1, delay: 0.5 }}
          className="mt-32 pt-12 border-t border-white/10 text-center"
        >
          <p className="text-white/40 text-sm">
            © {new Date().getFullYear()} Ezio Pappalardo. All rights reserved.
          </p>
        </motion.div>
      </div>

      <div className="absolute top-1/4 left-0 w-64 h-64 bg-[var(--color-gold)]/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-0 w-96 h-96 bg-[var(--color-gold)]/5 rounded-full blur-3xl pointer-events-none" />
    </section>
  )
}
