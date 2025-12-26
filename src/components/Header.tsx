import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'

const navItems = [
  { label: 'Home', href: '#hero' },
  { label: 'About', href: '#about' },
  { label: 'Works', href: '#works' },
  { label: 'Contact', href: '#contact' },
]

export function Header() {
  const [isScrolled, setIsScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50)
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
        isScrolled ? 'glass py-4' : 'py-6'
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
        <motion.a
          href="#hero"
          className="text-2xl font-bold font-[family-name:var(--font-display)]"
          whileHover={{ scale: 1.05 }}
        >
          <span className="gradient-text">EP</span>
        </motion.a>

        <nav className="hidden md:flex items-center gap-8">
          {navItems.map((item, i) => (
            <motion.a
              key={item.href}
              href={item.href}
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * i, duration: 0.5 }}
              className="text-sm uppercase tracking-wider text-white/70 hover:text-[var(--color-gold)] transition-colors"
            >
              {item.label}
            </motion.a>
          ))}
        </nav>

        <motion.a
          href="#contact"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="hidden md:block px-6 py-2 border border-[var(--color-gold)] text-[var(--color-gold)] text-sm uppercase tracking-wider hover:bg-[var(--color-gold)] hover:text-[var(--color-dark)] transition-all"
        >
          Let's Talk
        </motion.a>
      </div>
    </motion.header>
  )
}
