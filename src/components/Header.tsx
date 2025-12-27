import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'

const navItems = [
  { label: 'Storia', href: '#about' },
  { label: 'Prodotti', href: '#works' },
  { label: 'Dove Siamo', href: '#contact' },
]

export function Header() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMinimal, setIsMinimal] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50)
      setIsMinimal(window.scrollY > 300)
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        isScrolled ? 'glass py-3' : 'py-5'
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
        {/* Logo */}
        <motion.a
          href="#hero"
          className="relative group"
          whileHover={{ scale: 1.05 }}
          data-cursor="hover"
        >
          <div className="flex items-center gap-3">
            {/* Symbol */}
            <div className="w-10 h-10 relative">
              <svg viewBox="0 0 40 40" className="w-full h-full">
                <circle
                  cx="20"
                  cy="20"
                  r="18"
                  fill="none"
                  stroke="var(--color-gold)"
                  strokeWidth="1"
                  className="opacity-30"
                />
                <path
                  d="M20 8 L20 32 M8 20 L32 20"
                  stroke="var(--color-gold)"
                  strokeWidth="1"
                  className="opacity-50"
                />
                <circle
                  cx="20"
                  cy="20"
                  r="4"
                  fill="var(--color-gold)"
                />
              </svg>
            </div>
            {/* Name */}
            <span
              className={`font-[family-name:var(--font-display)] font-medium transition-all duration-500 ${
                isMinimal ? 'opacity-0 w-0' : 'opacity-100'
              }`}
            >
              <span className="gradient-text text-lg">Ferrero Rocher</span>
            </span>
          </div>
        </motion.a>

        {/* Center - minimal branding */}
        <motion.span
          initial={{ opacity: 0 }}
          animate={{ opacity: isMinimal ? 1 : 0 }}
          className="absolute left-1/2 -translate-x-1/2 text-white/30 text-xs uppercase tracking-[0.3em] hidden md:block"
        >
          Portfolio
        </motion.span>

        {/* Navigation */}
        <nav className="hidden md:flex items-center gap-6">
          {navItems.map((item, i) => (
            <motion.a
              key={item.href}
              href={item.href}
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * i, duration: 0.5 }}
              className="relative px-4 py-2 text-xs uppercase tracking-[0.2em] text-white/60 hover:text-white transition-colors group"
              data-cursor="hover"
            >
              <span className="relative z-10">{item.label}</span>
              <span className="absolute inset-0 bg-white/5 rounded-full scale-0 group-hover:scale-100 transition-transform" />
            </motion.a>
          ))}

          {/* CTA Button */}
          <motion.a
            href="#contact"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="ml-4 px-5 py-2 bg-[var(--color-gold)]/10 border border-[var(--color-gold)]/30 text-[var(--color-gold)] text-xs uppercase tracking-[0.15em] rounded-full hover:bg-[var(--color-gold)] hover:text-[var(--color-dark)] transition-all"
            data-cursor="hover"
          >
            Scopri
          </motion.a>
        </nav>

        {/* Mobile menu button */}
        <button
          className="md:hidden w-10 h-10 flex flex-col items-center justify-center gap-1.5"
          data-cursor="hover"
        >
          <span className="w-5 h-px bg-white/70" />
          <span className="w-5 h-px bg-white/70" />
        </button>
      </div>
    </motion.header>
  )
}
