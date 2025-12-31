/**
 * Animation Configuration
 *
 * This file defines all scroll-based animations.
 * The AI can modify this config via the console.
 */

export interface Keyframe {
  scroll: number      // 0-1 scroll progress
  rotX?: number       // rotation X (radians)
  rotY?: number       // rotation Y (radians)
  rotZ?: number       // rotation Z (radians)
  posX?: number       // position X
  posY?: number       // position Y
  posZ?: number       // position Z
  scale?: number      // scale multiplier
  opacity?: number    // 0-1
  glow?: number       // bloom intensity
}

export interface AnimationConfig {
  ferrero: {
    keyframes: Keyframe[]
    baseScale: number
  }
  title: {
    fadeSpeed: number
    text: string
    subtitle: string
  }
  cards: {
    items: Array<{
      id: number
      title: string
      description: string
      position: 'left' | 'right'
      startScroll: number
      endScroll: number
    }>
  }
}

// Default animation config - matches current hardcoded values
export const defaultAnimationConfig: AnimationConfig = {
  ferrero: {
    baseScale: 2.2,
    keyframes: [
      // Fade in (0-10%)
      { scroll: 0, rotX: 0, rotY: 0, posX: 0, scale: 0 },
      { scroll: 0.10, rotX: 0, rotY: 0, posX: 0, scale: 1 },

      // Idle (10-15%)
      { scroll: 0.15, rotX: 0, rotY: 0, posX: 0, scale: 1 },

      // Copertura card (15-30%) - rotate right, move left
      { scroll: 0.30, rotX: -0.6, rotY: Math.PI * 0.5, posX: -2, scale: 1 },

      // Cuore card (30-45%) - rotate more, move right
      { scroll: 0.45, rotX: -0.3, rotY: Math.PI, posX: 2, scale: 1 },

      // Eleganza card (45-60%) - center again
      { scroll: 0.60, rotX: 0, rotY: Math.PI * 1.3, posX: 0, scale: 1 },

      // Spin (60%+) - continuous rotation
      { scroll: 1.0, rotX: 0, rotY: Math.PI * 3.3, posX: 0, scale: 1 },
    ]
  },

  title: {
    fadeSpeed: 7,
    text: 'FERRERO ROCHER',
    subtitle: "L'arte del cioccolato"
  },

  cards: {
    items: [
      {
        id: 1,
        title: 'La Copertura',
        description: 'Cioccolato al latte finissimo con granella di nocciole tostate che avvolge ogni pezzo in una croccantezza unica.',
        position: 'right',
        startScroll: 0.15,
        endScroll: 0.28,
      },
      {
        id: 2,
        title: 'Il Cuore',
        description: 'Una nocciola intera tostata racchiusa in una cialda croccante e immersa in una cremosa crema gianduia.',
        position: 'left',
        startScroll: 0.30,
        endScroll: 0.43,
      },
      {
        id: 3,
        title: "L'Eleganza",
        description: "Avvolto in carta dorata con l'iconico pirottino marrone, simbolo di raffinatezza italiana dal 1982.",
        position: 'right',
        startScroll: 0.45,
        endScroll: 0.58,
      },
    ]
  }
}

// Interpolate between keyframes
export function interpolateKeyframes(keyframes: Keyframe[], scroll: number): Keyframe {
  if (keyframes.length === 0) return { scroll: 0 }
  if (keyframes.length === 1) return keyframes[0]

  // Sort by scroll
  const sorted = [...keyframes].sort((a, b) => a.scroll - b.scroll)

  // Find surrounding keyframes
  let before = sorted[0]
  let after = sorted[sorted.length - 1]

  for (let i = 0; i < sorted.length - 1; i++) {
    if (scroll >= sorted[i].scroll && scroll <= sorted[i + 1].scroll) {
      before = sorted[i]
      after = sorted[i + 1]
      break
    }
  }

  // Clamp to bounds
  if (scroll <= before.scroll) return before
  if (scroll >= after.scroll) return after

  // Calculate interpolation factor
  const range = after.scroll - before.scroll
  const t = range > 0 ? (scroll - before.scroll) / range : 0

  // Lerp helper
  const lerp = (a: number | undefined, b: number | undefined, fallback: number) => {
    const va = a ?? fallback
    const vb = b ?? fallback
    return va + (vb - va) * t
  }

  return {
    scroll,
    rotX: lerp(before.rotX, after.rotX, 0),
    rotY: lerp(before.rotY, after.rotY, 0),
    rotZ: lerp(before.rotZ, after.rotZ, 0),
    posX: lerp(before.posX, after.posX, 0),
    posY: lerp(before.posY, after.posY, 0),
    posZ: lerp(before.posZ, after.posZ, 0),
    scale: lerp(before.scale, after.scale, 1),
    opacity: lerp(before.opacity, after.opacity, 1),
    glow: lerp(before.glow, after.glow, 0),
  }
}
