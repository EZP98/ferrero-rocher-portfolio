import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'

const cards = [
  {
    title: 'Per i Golosi',
    description: 'Un momento di puro piacere. Lasciati avvolgere dalla dolcezza.',
    icon: '🍫',
  },
  {
    title: 'Per gli Intenditori',
    description: 'Ingredienti pregiati. Nocciole Piemonte IGP. Qualità senza compromessi.',
    icon: '🌰',
  },
  {
    title: 'Per le Occasioni',
    description: 'Il regalo perfetto. Eleganza dorata per momenti indimenticabili.',
    icon: '🎁',
  },
]

export function RotatingCards() {
  const [activeIndex, setActiveIndex] = useState(0)

  // Auto rotate
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % cards.length)
    }, 4000)
    return () => clearInterval(interval)
  }, [])

  // Calculate position for each card in a horizontal carousel
  const getCardStyle = (index: number) => {
    const diff = (index - activeIndex + cards.length) % cards.length

    // Center card
    if (diff === 0) {
      return {
        x: 0,
        scale: 1,
        opacity: 1,
        zIndex: 30,
        rotateY: 0,
      }
    }
    // Right card
    if (diff === 1) {
      return {
        x: 320,
        scale: 0.85,
        opacity: 0.5,
        zIndex: 20,
        rotateY: -15,
      }
    }
    // Left card
    return {
      x: -320,
      scale: 0.85,
      opacity: 0.5,
      zIndex: 20,
      rotateY: 15,
    }
  }

  return (
    <div className="relative w-full max-w-4xl mx-auto h-[400px]" style={{ perspective: '1200px' }}>
      {/* Decorative lines */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="w-[600px] h-[600px] relative">
          {/* Radial lines */}
          {[0, 45, 90, 135].map((angle) => (
            <div
              key={angle}
              className="absolute top-1/2 left-1/2 w-full h-px bg-gradient-to-r from-transparent via-[var(--color-gold)]/10 to-transparent"
              style={{
                transform: `translate(-50%, -50%) rotate(${angle}deg)`,
              }}
            />
          ))}
          {/* Center dot */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-[var(--color-gold)]/30 border border-[var(--color-gold)]/40" />
        </div>
      </div>

      {/* Cards container */}
      <div className="relative w-full h-full flex items-center justify-center">
        {cards.map((card, index) => {
          const style = getCardStyle(index)
          return (
            <motion.div
              key={index}
              className="absolute w-[300px] cursor-pointer"
              initial={false}
              animate={{
                x: style.x,
                scale: style.scale,
                opacity: style.opacity,
                rotateY: style.rotateY,
                zIndex: style.zIndex,
              }}
              transition={{
                duration: 0.6,
                ease: [0.32, 0.72, 0, 1],
              }}
              onClick={() => setActiveIndex(index)}
              style={{
                transformStyle: 'preserve-3d',
              }}
            >
              <div className="bg-white/[0.03] backdrop-blur-md border border-white/10 rounded-2xl p-8 text-center hover:border-[var(--color-gold)]/30 transition-colors duration-300">
                {/* Icon */}
                <div className="text-5xl mb-6">{card.icon}</div>

                {/* Title */}
                <h4 className="text-[var(--color-gold)] text-2xl font-semibold mb-4">
                  {card.title}
                </h4>

                {/* Description */}
                <p className="text-white/60 text-base leading-relaxed">
                  {card.description}
                </p>

                {/* Decorative line */}
                <div className="mt-6 mx-auto w-16 h-px bg-gradient-to-r from-transparent via-[var(--color-gold)]/50 to-transparent" />
              </div>
            </motion.div>
          )
        })}
      </div>

      {/* Dots indicator */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-3">
        {cards.map((_, index) => (
          <button
            key={index}
            onClick={() => setActiveIndex(index)}
            className={`h-2 rounded-full transition-all duration-300 ${
              index === activeIndex
                ? 'bg-[var(--color-gold)] w-8'
                : 'bg-white/20 hover:bg-white/40 w-2'
            }`}
          />
        ))}
      </div>

      {/* Navigation arrows */}
      <button
        onClick={() => setActiveIndex((prev) => (prev - 1 + cards.length) % cards.length)}
        className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/50 hover:text-[var(--color-gold)] hover:border-[var(--color-gold)]/30 transition-all duration-300"
      >
        ←
      </button>
      <button
        onClick={() => setActiveIndex((prev) => (prev + 1) % cards.length)}
        className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/50 hover:text-[var(--color-gold)] hover:border-[var(--color-gold)]/30 transition-all duration-300"
      >
        →
      </button>
    </div>
  )
}
