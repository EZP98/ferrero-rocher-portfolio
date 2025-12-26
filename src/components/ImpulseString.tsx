import { useRef, useEffect, useState } from 'react'

interface ImpulseStringProps {
  className?: string
}

export function ImpulseString({ className = '' }: ImpulseStringProps) {
  const svgRef = useRef<SVGSVGElement>(null)
  const pathRef = useRef<SVGPathElement>(null)
  const [mouseY, setMouseY] = useState(0.5)

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!svgRef.current) return
      const rect = svgRef.current.getBoundingClientRect()
      const relativeY = (e.clientY - rect.top) / rect.height
      setMouseY(Math.max(0, Math.min(1, relativeY)))
    }

    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [])

  useEffect(() => {
    if (!pathRef.current) return

    // Smooth interpolation for the string curve
    const targetY = 0.5 + (mouseY - 0.5) * 0.3
    const currentPath = `M 0 0.5 C 0.22 0.5 0.28 ${targetY} 0.5 ${targetY} C 0.72 ${targetY} 0.78 0.5 1 0.5`

    pathRef.current.setAttribute('d', currentPath)
  }, [mouseY])

  return (
    <svg
      ref={svgRef}
      viewBox="0 0 1 1"
      preserveAspectRatio="none"
      className={`impulse-string ${className}`}
      style={{
        width: '100%',
        height: '80px',
        overflow: 'visible'
      }}
    >
      <path
        ref={pathRef}
        d="M 0 0.5 C 0.22 0.5 0.28 0.5 0.5 0.5 C 0.72 0.5 0.78 0.5 1 0.5"
        fill="none"
        stroke="var(--color-gold)"
        strokeWidth="1"
        vectorEffect="non-scaling-stroke"
        style={{ transition: 'd 0.3s ease-out' }}
      />
    </svg>
  )
}
