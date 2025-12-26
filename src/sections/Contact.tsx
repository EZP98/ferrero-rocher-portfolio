import { useRef, useEffect, useState } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { Mail, MapPin, Send, Linkedin, Github } from 'lucide-react'

gsap.registerPlugin(ScrollTrigger)

const socials = [
  { icon: Github, href: 'https://github.com', label: 'GitHub' },
  { icon: Linkedin, href: 'https://linkedin.com', label: 'LinkedIn' },
]

export function Contact() {
  const sectionRef = useRef<HTMLElement>(null)
  const headingRef = useRef<HTMLDivElement>(null)
  const formRef = useRef<HTMLFormElement>(null)
  const infoRef = useRef<HTMLDivElement>(null)
  const [formState, setFormState] = useState({ name: '', email: '', message: '' })
  const [isSubmitting, setIsSubmitting] = useState(false)

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
          x: -50,
          opacity: 0,
          stagger: 0.15,
          duration: 0.8,
          ease: 'power3.out',
        })
      }

      // Form animation
      if (formRef.current) {
        gsap.from(formRef.current, {
          scrollTrigger: {
            trigger: formRef.current,
            start: 'top 80%',
          },
          y: 60,
          opacity: 0,
          duration: 1,
          ease: 'power3.out',
        })
      }

      // Social links
      const socialLinks = document.querySelectorAll('.social-link')
      gsap.from(socialLinks, {
        scrollTrigger: {
          trigger: '.social-links',
          start: 'top 90%',
        },
        scale: 0,
        opacity: 0,
        stagger: 0.1,
        duration: 0.6,
        ease: 'back.out(1.7)',
      })
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    // Simulate form submission
    await new Promise((resolve) => setTimeout(resolve, 1000))
    console.log('Form submitted:', formState)
    setFormState({ name: '', email: '', message: '' })
    setIsSubmitting(false)
  }

  return (
    <section
      id="contact"
      ref={sectionRef}
      className="relative min-h-screen py-32 overflow-hidden"
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
            {splitChars('Get in Touch')}
          </span>
          <h2 className="luxury-title text-5xl md:text-7xl lg:text-8xl">
            <div className="overflow-hidden">
              <span className="block">{splitChars("Let's Create")}</span>
            </div>
            <div className="overflow-hidden">
              <span className="block gradient-text">{splitChars('Together')}</span>
            </div>
          </h2>
          <p className="text-white/50 text-lg mt-8 max-w-xl mx-auto">
            Have a project in mind? I'd love to hear about it. Let's discuss how we can
            bring your vision to life.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-16 lg:gap-24">
          {/* Contact info */}
          <div ref={infoRef}>
            <div className="space-y-8 mb-12">
              <div className="contact-item flex items-center gap-6 group" data-cursor="hover">
                <div className="w-16 h-16 rounded-full bg-[var(--color-gold)]/10 flex items-center justify-center group-hover:bg-[var(--color-gold)]/20 transition-colors">
                  <Mail size={24} className="text-[var(--color-gold)]" />
                </div>
                <div>
                  <span className="text-white/40 text-sm uppercase tracking-wider block mb-1">
                    Email
                  </span>
                  <a
                    href="mailto:ezio@objects.design"
                    className="text-xl text-white hover:text-[var(--color-gold)] transition-colors"
                  >
                    ezio@objects.design
                  </a>
                </div>
              </div>

              <div className="contact-item flex items-center gap-6 group" data-cursor="hover">
                <div className="w-16 h-16 rounded-full bg-[var(--color-gold)]/10 flex items-center justify-center group-hover:bg-[var(--color-gold)]/20 transition-colors">
                  <MapPin size={24} className="text-[var(--color-gold)]" />
                </div>
                <div>
                  <span className="text-white/40 text-sm uppercase tracking-wider block mb-1">
                    Location
                  </span>
                  <span className="text-xl text-white">Milano, Italia</span>
                </div>
              </div>
            </div>

            {/* Social links */}
            <div className="social-links">
              <span className="text-white/40 text-sm uppercase tracking-wider block mb-6">
                Follow Me
              </span>
              <div className="flex gap-4">
                {socials.map(({ icon: Icon, href, label }) => (
                  <a
                    key={label}
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="social-link w-14 h-14 rounded-full border border-white/20 flex items-center justify-center text-white/70 hover:border-[var(--color-gold)] hover:text-[var(--color-gold)] hover:bg-[var(--color-gold)]/10 transition-all"
                    data-cursor="hover"
                  >
                    <Icon size={22} />
                  </a>
                ))}
              </div>
            </div>

            {/* Decorative quote */}
            <div className="mt-16 pt-16 border-t border-white/10">
              <blockquote className="text-white/30 italic text-lg">
                "Design is not just what it looks like and feels like.
                <br />
                Design is how it works."
              </blockquote>
              <cite className="text-[var(--color-gold)] text-sm mt-4 block">— Steve Jobs</cite>
            </div>
          </div>

          {/* Contact form */}
          <form
            ref={formRef}
            onSubmit={handleSubmit}
            className="glass rounded-2xl p-8 md:p-10 relative overflow-hidden"
          >
            {/* Form glow effect */}
            <div className="absolute -top-20 -right-20 w-40 h-40 bg-[var(--color-gold)]/20 rounded-full blur-3xl pointer-events-none" />

            <div className="space-y-6 relative z-10">
              <div>
                <label className="block text-white/50 text-sm uppercase tracking-wider mb-3">
                  Name
                </label>
                <input
                  type="text"
                  value={formState.name}
                  onChange={(e) => setFormState({ ...formState, name: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-5 py-4 text-white focus:border-[var(--color-gold)] focus:outline-none focus:ring-1 focus:ring-[var(--color-gold)]/50 transition-all placeholder:text-white/30"
                  placeholder="Your name"
                  required
                />
              </div>

              <div>
                <label className="block text-white/50 text-sm uppercase tracking-wider mb-3">
                  Email
                </label>
                <input
                  type="email"
                  value={formState.email}
                  onChange={(e) => setFormState({ ...formState, email: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-5 py-4 text-white focus:border-[var(--color-gold)] focus:outline-none focus:ring-1 focus:ring-[var(--color-gold)]/50 transition-all placeholder:text-white/30"
                  placeholder="your@email.com"
                  required
                />
              </div>

              <div>
                <label className="block text-white/50 text-sm uppercase tracking-wider mb-3">
                  Message
                </label>
                <textarea
                  value={formState.message}
                  onChange={(e) => setFormState({ ...formState, message: e.target.value })}
                  rows={5}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-5 py-4 text-white focus:border-[var(--color-gold)] focus:outline-none focus:ring-1 focus:ring-[var(--color-gold)]/50 transition-all resize-none placeholder:text-white/30"
                  placeholder="Tell me about your project..."
                  required
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-4 bg-[var(--color-gold)] text-[var(--color-dark)] font-medium rounded-lg flex items-center justify-center gap-3 hover:bg-[var(--color-gold-light)] transition-all disabled:opacity-70 disabled:cursor-not-allowed group"
                data-cursor="hover"
              >
                <span className="uppercase tracking-wider">
                  {isSubmitting ? 'Sending...' : 'Send Message'}
                </span>
                <Send size={18} className="transform transition-transform group-hover:translate-x-1" />
              </button>
            </div>
          </form>
        </div>

        {/* Footer */}
        <div className="mt-32 pt-12 border-t border-white/10">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <p className="text-white/40 text-sm">
              © {new Date().getFullYear()} Ezio Pappalardo. All rights reserved.
            </p>
            <div className="flex items-center gap-2 text-white/40 text-sm">
              <span>Built with</span>
              <span className="text-[var(--color-gold)]">React</span>
              <span>+</span>
              <span className="text-[var(--color-gold)]">Three.js</span>
              <span>+</span>
              <span className="text-[var(--color-gold)]">GSAP</span>
            </div>
          </div>
        </div>
      </div>

      {/* Decorative elements */}
      <div className="absolute top-1/3 left-0 w-64 h-64 bg-[var(--color-gold)]/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-0 w-96 h-96 bg-[var(--color-gold)]/5 rounded-full blur-3xl pointer-events-none" />
    </section>
  )
}
