import { useRef, useEffect } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

export function Hero() {
  const sectionRef = useRef<HTMLElement>(null)
  const scrollIndicatorRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Scroll indicator fades out
      gsap.to(scrollIndicatorRef.current, {
        scrollTrigger: {
          trigger: sectionRef.current,
          start: '5% top',
          end: '20% top',
          scrub: 1,
        },
        opacity: 0,
        y: 50,
      })
    }, sectionRef)

    return () => ctx.revert()
  }, [])

  return (
    <section
      id="hero"
      ref={sectionRef}
      className="relative h-[600vh]"
    >
      {/* Sticky container for the hero content */}
      <div className="sticky top-0 h-screen flex items-center justify-center overflow-hidden">
        {/* Scroll indicator */}
        <div
          ref={scrollIndicatorRef}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-3 z-20"
        >
          <span className="text-white/30 text-[10px] uppercase tracking-[0.3em]">Scorri</span>
          <div className="w-px h-12 bg-gradient-to-b from-[var(--color-gold)] to-transparent relative overflow-hidden">
            <div
              className="absolute inset-0 bg-[var(--color-gold)]"
              style={{
                animation: 'scrollDown 1.5s ease-in-out infinite',
              }}
            />
          </div>
        </div>
      </div>

      <style>{`
        @keyframes scrollDown {
          0% { transform: translateY(-100%); }
          50% { transform: translateY(0); }
          100% { transform: translateY(100%); }
        }
      `}</style>
    </section>
  )
}
