import { motion, useScroll, useSpring, useTransform, useMotionValueEvent } from 'framer-motion'
import { useState } from 'react'

export function ScrollProgress() {
  const { scrollYProgress } = useScroll()
  const [percentage, setPercentage] = useState(0)

  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001,
  })

  // Track percentage as integer
  useMotionValueEvent(scrollYProgress, "change", (latest) => {
    setPercentage(Math.round(latest * 100))
  })

  // Opacity based on scroll
  const opacity = useTransform(scrollYProgress, [0, 0.02, 0.98, 1], [0, 1, 1, 0])

  return (
    <>
      {/* Progress bar at top */}
      <motion.div
        className="fixed top-0 left-0 right-0 h-[2px] z-[9999] origin-left"
        style={{
          scaleX,
          background: 'linear-gradient(90deg, var(--color-gold), var(--color-gold-light))',
        }}
      />

      {/* Percentage indicator - right side */}
      <motion.div
        className="fixed right-6 top-1/2 -translate-y-1/2 z-50 hidden lg:flex flex-col items-center gap-3"
        style={{ opacity }}
      >
        {/* Vertical progress line */}
        <div className="relative h-24 w-px bg-white/10 rounded-full overflow-hidden">
          <motion.div
            className="absolute bottom-0 left-0 w-full bg-[var(--color-gold)]"
            style={{ height: useTransform(scrollYProgress, [0, 1], ['0%', '100%']) }}
          />
        </div>

        {/* Percentage number */}
        <div className="text-center">
          <span className="text-[var(--color-gold)] text-sm font-mono font-medium">
            {percentage}
          </span>
          <span className="text-white/30 text-xs">%</span>
        </div>
      </motion.div>

      {/* Mobile: small indicator */}
      <motion.div
        className="fixed bottom-6 right-6 z-50 lg:hidden"
        style={{ opacity }}
      >
        <div className="w-12 h-12 rounded-full border border-white/10 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <span className="text-[var(--color-gold)] text-xs font-mono">
            {percentage}%
          </span>
        </div>
      </motion.div>
    </>
  )
}
