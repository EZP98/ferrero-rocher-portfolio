import { useRef, useEffect, useState } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { ImpulseString } from '../components/ImpulseString'

gsap.registerPlugin(ScrollTrigger)

export function Hero() {
  const sectionRef = useRef<HTMLElement>(null)
  const titleRef = useRef<HTMLDivElement>(null)
  const subtitleRef = useRef<HTMLDivElement>(null)
  const lineRefs = useRef<HTMLDivElement[]>([])
  const [scrollY, setScrollY] = useState(0)

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Initial reveal animation
      const tl = gsap.timeline({ delay: 0.5 })

      // Animate subtitle letters
      if (subtitleRef.current) {
        const chars = subtitleRef.current.querySelectorAll('.char')
        tl.from(chars, {
          y: 100,
          opacity: 0,
          rotationX: -90,
          stagger: 0.02,
          duration: 0.8,
          ease: 'power3.out',
        })
      }

      // Animate main title
      if (titleRef.current) {
        const words = titleRef.current.querySelectorAll('.word')
        tl.from(
          words,
          {
            y: 120,
            opacity: 0,
            stagger: 0.1,
            duration: 1,
            ease: 'power3.out',
          },
          '-=0.4'
        )
      }

      // Animate horizontal lines
      tl.from(
        lineRefs.current,
        {
          scaleX: 0,
          duration: 1.2,
          ease: 'power3.inOut',
          stagger: 0.1,
        },
        '-=0.6'
      )

      // Scroll-triggered parallax
      gsap.to(titleRef.current, {
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top top',
          end: 'bottom top',
          scrub: 1,
        },
        y: 300,
        scale: 0.8,
        opacity: 0,
      })

      gsap.to(subtitleRef.current, {
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top top',
          end: '50% top',
          scrub: 1,
        },
        y: 150,
        opacity: 0,
      })
    }, sectionRef)

    return () => ctx.revert()
  }, [])

  const splitText = (text: string) => {
    return text.split('').map((char, i) => (
      <span key={i} className="char inline-block" style={{ transitionDelay: `${i * 20}ms` }}>
        {char === ' ' ? '\u00A0' : char}
      </span>
    ))
  }

  const parallaxY = scrollY * 0.3

  return (
    <section
      id="hero"
      ref={sectionRef}
      className="relative min-h-[200vh] flex flex-col justify-start pt-[30vh] overflow-hidden"
    >
      {/* Background gradient overlay */}
      <div className="fixed inset-0 bg-gradient-radial from-[#1a1512] via-[var(--color-dark)] to-[var(--color-darker)] z-0" />

      {/* Animated background lines */}
      <div className="fixed inset-0 overflow-hidden z-0 opacity-10">
        {[...Array(5)].map((_, i) => (
          <div
            key={i}
            ref={(el) => { if (el) lineRefs.current[i] = el }}
            className="absolute h-px bg-gradient-to-r from-transparent via-[var(--color-gold)] to-transparent"
            style={{
              top: `${20 + i * 15}%`,
              left: 0,
              right: 0,
              transform: `translateY(${parallaxY * (0.5 + i * 0.1)}px)`,
            }}
          />
        ))}
      </div>

      {/* Subtitle */}
      <div
        ref={subtitleRef}
        className="relative z-10 text-center mb-8"
        style={{ transform: `translateY(${parallaxY * 0.2}px)` }}
      >
        <span className="text-[var(--color-gold)] uppercase tracking-[0.5em] text-xs md:text-sm font-medium">
          {splitText('Creative Developer & Designer')}
        </span>
      </div>

      {/* Main title */}
      <div
        ref={titleRef}
        className="relative z-10 text-center px-4"
        style={{ transform: `translateY(${parallaxY * 0.1}px)` }}
      >
        <h1 className="luxury-title text-[12vw] md:text-[10vw] lg:text-[8vw] leading-[0.85] mb-6">
          <div className="overflow-hidden">
            <span className="word inline-block text-white/90">EZIO</span>
          </div>
          <div className="overflow-hidden">
            <span className="word inline-block gradient-text">PAPPALARDO</span>
          </div>
        </h1>

        {/* Decorative elements */}
        <div className="flex items-center justify-center gap-8 mt-12 mb-16">
          <div className="h-px w-24 md:w-40 bg-gradient-to-r from-transparent to-[var(--color-gold)]" />
          <div className="w-3 h-3 rounded-full bg-[var(--color-gold)] animate-pulse" />
          <div className="h-px w-24 md:w-40 bg-gradient-to-l from-transparent to-[var(--color-gold)]" />
        </div>

        {/* Tagline */}
        <p className="text-white/50 text-lg md:text-xl max-w-xl mx-auto font-light tracking-wide">
          Transforming ideas into immersive digital experiences
          <br />
          <span className="text-[var(--color-gold)]">with code and creativity</span>
        </p>
      </div>

      {/* Scroll indicator */}
      <div className="fixed bottom-12 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-3">
        <span className="text-white/30 text-[10px] uppercase tracking-[0.3em]">Scroll to explore</span>
        <div className="w-px h-16 bg-gradient-to-b from-[var(--color-gold)] to-transparent relative overflow-hidden">
          <div className="absolute inset-0 bg-[var(--color-gold)] animate-[scrollDown_2s_ease-in-out_infinite]" />
        </div>
      </div>

      {/* Side text decoration */}
      <div className="fixed left-8 top-1/2 -translate-y-1/2 z-10 hidden lg:block">
        <span className="text-white/10 text-xs uppercase tracking-[0.5em] transform -rotate-90 origin-center whitespace-nowrap">
          Portfolio 2024
        </span>
      </div>

      <div className="fixed right-8 top-1/2 -translate-y-1/2 z-10 hidden lg:block">
        <span className="text-white/10 text-xs uppercase tracking-[0.5em] transform rotate-90 origin-center whitespace-nowrap">
          Milano, Italia
        </span>
      </div>

      {/* Impulse String - StringTune style */}
      <div className="absolute bottom-[25vh] left-0 right-0 z-10">
        <ImpulseString className="w-full" color="var(--color-gold)" />
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
