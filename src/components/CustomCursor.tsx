import { useEffect, useRef, useState } from 'react'
import { gsap } from 'gsap'

export function CustomCursor() {
  const cursorRef = useRef<HTMLDivElement>(null)
  const spotlightRef = useRef<HTMLDivElement>(null)
  const [isHovering, setIsHovering] = useState(false)

  useEffect(() => {
    const cursor = cursorRef.current
    const spotlight = spotlightRef.current
    if (!cursor || !spotlight) return

    let mouseX = 0
    let mouseY = 0
    let cursorX = 0
    let cursorY = 0

    const handleMouseMove = (e: MouseEvent) => {
      mouseX = e.clientX
      mouseY = e.clientY
    }

    const animate = () => {
      // Smooth cursor follow
      cursorX += (mouseX - cursorX) * 0.15
      cursorY += (mouseY - cursorY) * 0.15

      cursor.style.left = `${cursorX}px`
      cursor.style.top = `${cursorY}px`

      spotlight.style.left = `${mouseX - 200}px`
      spotlight.style.top = `${mouseY - 200}px`

      requestAnimationFrame(animate)
    }

    // Hover detection
    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      if (
        target.tagName === 'A' ||
        target.tagName === 'BUTTON' ||
        target.closest('a') ||
        target.closest('button') ||
        target.dataset.cursor === 'hover'
      ) {
        setIsHovering(true)
        gsap.to(cursor, { scale: 2.5, duration: 0.3, ease: 'power2.out' })
      }
    }

    const handleMouseOut = () => {
      setIsHovering(false)
      gsap.to(cursor, { scale: 1, duration: 0.3, ease: 'power2.out' })
    }

    window.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseover', handleMouseOver)
    document.addEventListener('mouseout', handleMouseOut)
    animate()

    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseover', handleMouseOver)
      document.removeEventListener('mouseout', handleMouseOut)
    }
  }, [])

  return (
    <>
      <div
        ref={cursorRef}
        className={`custom-cursor ${isHovering ? 'hover' : ''}`}
        style={{ transform: 'translate(-50%, -50%)' }}
      />
      <div ref={spotlightRef} className="spotlight" />
    </>
  )
}
