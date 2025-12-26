import { useRef, useEffect } from 'react'

interface WavyTextProps {
  text: string
  className?: string
}

export function WavyText({ text, className = '' }: WavyTextProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationRef = useRef<number>()
  const timeRef = useRef(0)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Set canvas size
    const dpr = window.devicePixelRatio || 1
    const rect = canvas.getBoundingClientRect()
    canvas.width = rect.width * dpr
    canvas.height = rect.height * dpr
    ctx.scale(dpr, dpr)

    const animate = () => {
      timeRef.current += 0.02
      ctx.clearRect(0, 0, rect.width, rect.height)

      // Text settings
      ctx.font = 'bold 80px "Space Grotesk", sans-serif'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'

      // Draw each character with wave effect
      const chars = text.split('')
      const charWidth = rect.width / chars.length
      const centerY = rect.height / 2

      chars.forEach((char, i) => {
        const x = charWidth * (i + 0.5)
        const waveOffset = Math.sin(timeRef.current + i * 0.3) * 5
        const y = centerY + waveOffset

        // Gradient for each character
        const gradient = ctx.createLinearGradient(x - 20, y - 40, x + 20, y + 40)
        gradient.addColorStop(0, '#D4A853')
        gradient.addColorStop(0.5, '#E8C878')
        gradient.addColorStop(1, '#D4A853')

        ctx.fillStyle = gradient
        ctx.fillText(char, x, y)
      })

      animationRef.current = requestAnimationFrame(animate)
    }

    animate()

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [text])

  return (
    <canvas
      ref={canvasRef}
      className={`wavy-text ${className}`}
      style={{
        width: '100%',
        height: '120px',
      }}
    />
  )
}
