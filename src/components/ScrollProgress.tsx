import { motion, useScroll, useSpring, useTransform } from 'framer-motion'

export function ScrollProgress() {
  const { scrollYProgress } = useScroll()
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001,
  })

  const percentage = useTransform(scrollYProgress, [0, 1], [0, 100])

  return (
    <>
      {/* Progress bar */}
      <motion.div className="scroll-progress" style={{ scaleX }} />

      {/* Percentage indicator */}
      <motion.div
        className="fixed top-6 right-6 z-50 hidden md:flex items-center gap-2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
      >
        <motion.span
          className="text-white/30 text-xs uppercase tracking-widest font-mono"
          style={{ opacity: scrollYProgress }}
        >
          <motion.span>{percentage}</motion.span>%
        </motion.span>
      </motion.div>
    </>
  )
}
