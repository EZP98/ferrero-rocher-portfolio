import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

interface SplitTextProps {
  children: string
  className?: string
  delay?: number
  trigger?: string
}

export function SplitText({
  children,
  className = '',
  delay = 0,
  trigger,
}: SplitTextProps) {
  const containerRef = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    if (!containerRef.current) return

    const chars = containerRef.current.querySelectorAll('.char')

    gsap.set(chars, { y: '100%', opacity: 0 })

    const animation = gsap.to(chars, {
      y: '0%',
      opacity: 1,
      duration: 0.6,
      stagger: 0.03,
      delay,
      ease: 'power3.out',
      scrollTrigger: trigger ? {
        trigger: trigger,
        start: 'top 80%',
        toggleActions: 'play none none reverse',
      } : undefined,
    })

    return () => {
      animation.kill()
    }
  }, [children, delay, trigger])

  const words = children.split(' ')

  return (
    <span ref={containerRef} className={className}>
      {words.map((word, wordIndex) => (
        <span key={wordIndex} className="word">
          {word.split('').map((char, charIndex) => (
            <span key={charIndex} className="char">
              {char}
            </span>
          ))}
          {wordIndex < words.length - 1 && <span className="char">&nbsp;</span>}
        </span>
      ))}
    </span>
  )
}
