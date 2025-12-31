/**
 * Animation Console - Ferrero Storyboard
 * Best practices: extracted components, custom slider, consistent design system
 */

import { useState, useEffect, memo } from 'react'
import { Canvas } from '@react-three/fiber'
import { Environment } from '@react-three/drei'
import { FerreroBall } from '../components/FerreroBall'

// ========================
// DESIGN TOKENS
// ========================

const tokens = {
  colors: {
    primary: 'rgb(212, 175, 55)',      // Gold
    primaryLight: 'rgb(251, 191, 36)',  // Amber-400
    primaryDark: 'rgb(180, 140, 40)',
    bg: {
      base: 'rgb(10, 10, 10)',
      elevated: 'rgb(18, 18, 18)',
      subtle: 'rgba(255, 255, 255, 0.05)',
    },
    border: 'rgba(255, 255, 255, 0.1)',
    text: {
      primary: 'rgba(255, 255, 255, 0.9)',
      secondary: 'rgba(255, 255, 255, 0.5)',
      muted: 'rgba(255, 255, 255, 0.3)',
    }
  },
  spacing: {
    xs: '0.25rem',   // 4px
    sm: '0.5rem',    // 8px
    md: '0.75rem',   // 12px
    lg: '1rem',      // 16px
    xl: '1.5rem',    // 24px
    xxl: '2rem',     // 32px
  },
  radius: {
    sm: '0.375rem',  // 6px
    md: '0.5rem',    // 8px
    lg: '0.75rem',   // 12px
    full: '9999px',
  }
}

// ========================
// UI COMPONENTS
// ========================

const generateParticles = (count: number) => {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    left: Math.random() * 100,
    top: Math.random() * 100,
    size: 0.5 + Math.random() * 0.5,
    delay: Math.random() * 2,
    duration: 2 + Math.random() * 2,
  }))
}

interface LumaButtonProps {
  children: React.ReactNode
  onClick?: () => void
  active?: boolean
  small?: boolean
  className?: string
}

const LumaButton = memo(({ children, onClick, active, small, className = '' }: LumaButtonProps) => {
  const [isHovered, setIsHovered] = useState(false)
  const [particles] = useState(() => generateParticles(8))

  return (
    <button
      className={`relative cursor-pointer ${small ? 'text-xs' : 'text-sm'} ${className} focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500/50 rounded-full`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onClick}
      style={{ background: 'none', border: 'none', padding: 0 }}
    >
      <div
        className="relative overflow-hidden rounded-full p-px transition-all duration-300"
        style={{
          background: active
            ? 'linear-gradient(180deg, rgba(251, 191, 36, 1) 0%, rgba(180, 140, 40, 1) 100%)'
            : 'linear-gradient(180deg, rgba(60, 60, 60, 1) 0%, rgba(34, 34, 34, 1) 100%)',
          boxShadow: active
            ? '0 0 30px rgba(212, 175, 55, 0.4)'
            : '0 0 20px rgba(255, 255, 255, 0.05)',
        }}
      >
        {active && (
          <div
            className="absolute inset-0"
            style={{
              background: `conic-gradient(from 0deg, transparent 0deg, transparent 60deg, rgba(255, 215, 100, 0.6) 120deg, rgba(255, 230, 150, 1) 180deg, rgba(255, 215, 100, 0.6) 240deg, transparent 300deg, transparent 360deg)`,
              filter: 'blur(6px)',
              animation: 'rotate 4s linear infinite',
            }}
          />
        )}

        <div
          className={`relative rounded-full flex items-center justify-center gap-2 transition-all duration-300 ${small ? 'px-3 py-1.5' : 'px-5 py-2.5'}`}
          style={{ background: tokens.colors.bg.base }}
        >
          <div className="absolute inset-0 overflow-hidden rounded-full pointer-events-none">
            {particles.map((particle) => (
              <div
                key={particle.id}
                className="absolute"
                style={{
                  left: `${particle.left}%`,
                  top: `${particle.top}%`,
                  width: `${particle.size}px`,
                  height: `${particle.size}px`,
                  backgroundColor: active ? 'rgba(251, 191, 36, 0.8)' : 'rgba(255, 255, 255, 0.6)',
                  borderRadius: '50%',
                  animation: `twinkle ${particle.duration}s ease-in-out infinite`,
                  animationDelay: `${particle.delay}s`,
                }}
              />
            ))}
          </div>
          <span
            className={`font-medium tracking-wide transition-all duration-300 relative z-10 ${active ? 'text-amber-300' : 'text-white'}`}
            style={{
              textShadow: isHovered || active ? '0 0 12px rgba(251, 191, 36, 0.6)' : 'none',
            }}
          >
            {children}
          </span>
        </div>
      </div>
    </button>
  )
})

LumaButton.displayName = 'LumaButton'

const SparkleIcon = memo(({ size = 16, className = '' }: { size?: number; className?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <path d="M12 2L13.09 8.26L19 9L13.09 9.74L12 16L10.91 9.74L5 9L10.91 8.26L12 2Z" fill="currentColor"/>
    <path d="M18 14L18.54 16.46L21 17L18.54 17.54L18 20L17.46 17.54L15 17L17.46 16.46L18 14Z" fill="currentColor" opacity="0.7"/>
  </svg>
))

SparkleIcon.displayName = 'SparkleIcon'

// Custom Slider Component
interface SliderProps {
  label: string
  value: number
  min: number
  max: number
  step: number
  onChange: (value: number) => void
  formatValue?: (value: number) => string
}

const Slider = memo(({ label, value, min, max, step, onChange, formatValue }: SliderProps) => {
  const percentage = ((value - min) / (max - min)) * 100

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-xs text-white/40 uppercase tracking-wider font-medium">
          {label}
        </label>
        <span className="text-sm font-mono text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded">
          {formatValue ? formatValue(value) : value.toFixed(1)}
        </span>
      </div>
      <div className="relative h-2 group">
        {/* Track background */}
        <div className="absolute inset-0 bg-white/10 rounded-full overflow-hidden">
          {/* Filled track */}
          <div
            className="absolute inset-y-0 left-0 bg-gradient-to-r from-amber-600 to-amber-400 rounded-full transition-all"
            style={{ width: `${percentage}%` }}
          />
        </div>
        {/* Thumb glow */}
        <div
          className="absolute top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-amber-400 shadow-lg shadow-amber-500/50 transition-all group-hover:scale-110 group-hover:shadow-amber-500/70"
          style={{ left: `calc(${percentage}% - 8px)` }}
        />
        {/* Hidden input for accessibility */}
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(parseFloat(e.target.value))}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />
      </div>
    </div>
  )
})

Slider.displayName = 'Slider'

// Icon Button Component
interface IconButtonProps {
  onClick?: () => void
  children: React.ReactNode
  active?: boolean
  size?: 'sm' | 'md' | 'lg'
  title?: string
}

const IconButton = memo(({ onClick, children, active, size = 'md', title }: IconButtonProps) => {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12',
  }

  return (
    <button
      onClick={onClick}
      title={title}
      className={`${sizeClasses[size]} rounded-lg flex items-center justify-center transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500/50 ${
        active
          ? 'bg-amber-500 hover:bg-amber-400 shadow-lg shadow-amber-500/30 text-black'
          : 'bg-white/5 hover:bg-white/10 border border-white/10 text-white'
      }`}
    >
      {children}
    </button>
  )
})

IconButton.displayName = 'IconButton'

// ========================
// TYPES
// ========================

interface SceneState {
  opacity: number
  scale: number
  rotationY: number
  glow: number
  positionX: number
}

interface Scene {
  id: number
  name: string
  scrollPercent: number
  state: SceneState
}

// ========================
// DEFAULT SCENES
// ========================

const defaultScenes: Scene[] = [
  { id: 1, name: 'Fade-in', scrollPercent: 0, state: { opacity: 1, scale: 1, rotationY: 0, glow: 0, positionX: 0 } },
  { id: 2, name: 'Idle', scrollPercent: 10, state: { opacity: 1, scale: 1, rotationY: 0, glow: 0, positionX: 0 } },
  { id: 3, name: 'Copertura', scrollPercent: 15, state: { opacity: 1, scale: 1, rotationY: 1.57, glow: 0.5, positionX: -2 } },
  { id: 4, name: 'Cuore', scrollPercent: 30, state: { opacity: 1, scale: 1, rotationY: 3.14, glow: 1, positionX: -2 } },
  { id: 5, name: 'Eleganza', scrollPercent: 45, state: { opacity: 1, scale: 1, rotationY: 4.71, glow: 0.5, positionX: 2 } },
  { id: 6, name: 'Spin', scrollPercent: 60, state: { opacity: 1, scale: 1, rotationY: 6.28, glow: 0, positionX: 0 } },
]

// ========================
// INTERPOLATION
// ========================

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t
}

function interpolateState(scenes: Scene[], scrollPercent: number): SceneState {
  if (scenes.length === 0) return { opacity: 1, scale: 1, rotationY: 0, glow: 0, positionX: 0 }
  if (scenes.length === 1) return scenes[0].state

  const sorted = [...scenes].sort((a, b) => a.scrollPercent - b.scrollPercent)

  let before = sorted[0]
  let after = sorted[sorted.length - 1]

  for (let i = 0; i < sorted.length - 1; i++) {
    if (scrollPercent >= sorted[i].scrollPercent && scrollPercent <= sorted[i + 1].scrollPercent) {
      before = sorted[i]
      after = sorted[i + 1]
      break
    }
  }

  if (scrollPercent <= before.scrollPercent) return before.state
  if (scrollPercent >= after.scrollPercent) return after.state

  const range = after.scrollPercent - before.scrollPercent
  const t = range > 0 ? (scrollPercent - before.scrollPercent) / range : 0

  return {
    opacity: lerp(before.state.opacity, after.state.opacity, t),
    scale: lerp(before.state.scale, after.state.scale, t),
    rotationY: lerp(before.state.rotationY, after.state.rotationY, t),
    glow: lerp(before.state.glow, after.state.glow, t),
    positionX: lerp(before.state.positionX, after.state.positionX, t),
  }
}

// ========================
// MAIN COMPONENT
// ========================

export default function AnimationConsole() {
  const [scenes, setScenes] = useState<Scene[]>(defaultScenes)
  const [selectedScene, setSelectedScene] = useState<Scene | null>(scenes[0])
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)

  const currentState = interpolateState(scenes, currentTime)

  useEffect(() => {
    if (isPlaying) {
      const interval = setInterval(() => {
        setCurrentTime(t => (t >= 100 ? 0 : t + 0.5))
      }, 50)
      return () => clearInterval(interval)
    }
  }, [isPlaying])

  const updateScene = (id: number, updates: Partial<SceneState>) => {
    setScenes(prev => prev.map(s =>
      s.id === id ? { ...s, state: { ...s.state, ...updates } } : s
    ))
    if (selectedScene?.id === id) {
      setSelectedScene(prev => prev ? { ...prev, state: { ...prev.state, ...updates } } : null)
    }
  }

  const addScene = () => {
    const newId = Math.max(...scenes.map(s => s.id), 0) + 1
    const newScene: Scene = {
      id: newId,
      name: `Scene ${newId}`,
      scrollPercent: currentTime,
      state: { ...currentState }
    }
    setScenes([...scenes, newScene])
    setSelectedScene(newScene)
  }

  const deleteScene = (id: number) => {
    setScenes(prev => prev.filter(s => s.id !== id))
    if (selectedScene?.id === id) {
      setSelectedScene(scenes[0] || null)
    }
  }

  const exportConfig = () => {
    const config = { scenes, exportedAt: new Date().toISOString() }
    const blob = new Blob([JSON.stringify(config, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'ferrero-animation.json'
    a.click()
  }

  const keyframes = scenes.map(s => ({
    id: s.id,
    name: s.name,
    start: s.scrollPercent,
    end: Math.min(s.scrollPercent + 15, 100),
  }))

  return (
    <div className="h-screen bg-neutral-950 text-white flex flex-col overflow-hidden">
      <style>{`
        @keyframes rotate {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes twinkle {
          0%, 100% { opacity: 0.3; transform: scale(0.8); }
          50% { opacity: 1; transform: scale(1.2); }
        }
        @keyframes pulse-gold {
          0%, 100% { box-shadow: 0 0 15px rgba(212, 175, 55, 0.3); }
          50% { box-shadow: 0 0 30px rgba(212, 175, 55, 0.5); }
        }
        .gold-glow { animation: pulse-gold 2s ease-in-out infinite; }
      `}</style>

      {/* Header */}
      <header className="border-b border-white/10 px-6 py-4 flex-shrink-0 bg-black/60 backdrop-blur-md">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="text-amber-400">
              <SparkleIcon size={24} />
            </div>
            <div>
              <h1 className="text-lg font-semibold bg-gradient-to-r from-amber-200 via-amber-400 to-amber-300 bg-clip-text text-transparent">
                Ferrero Storyboard
              </h1>
              <p className="text-xs text-white/40">Animation Timeline Editor</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <IconButton onClick={() => window.location.href = '/'} title="Home" size="sm">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
            </IconButton>
            <LumaButton small onClick={exportConfig}>
              <span className="flex items-center gap-2">
                <SparkleIcon size={14} />
                Export JSON
              </span>
            </LumaButton>
          </div>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar - Scenes */}
        <aside className="w-72 border-r border-white/10 flex flex-col flex-shrink-0 bg-black/40">
          <div className="px-4 py-4 border-b border-white/10">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xs font-medium text-white/50 uppercase tracking-wider">
                Scene ({scenes.length})
              </h2>
              <LumaButton small active onClick={addScene}>
                + Aggiungi
              </LumaButton>
            </div>
          </div>

          <div className="flex-1 overflow-auto p-3 space-y-2">
            {scenes.map(scene => (
              <div
                key={scene.id}
                onClick={() => {
                  setSelectedScene(scene)
                  setCurrentTime(scene.scrollPercent)
                }}
                className={`p-4 rounded-xl cursor-pointer transition-all duration-200 ${
                  selectedScene?.id === scene.id
                    ? 'bg-gradient-to-br from-amber-500/20 to-amber-600/10 border border-amber-500/40 gold-glow'
                    : 'bg-white/5 border border-transparent hover:bg-white/10 hover:border-white/10'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className={`font-medium text-sm ${selectedScene?.id === scene.id ? 'text-amber-300' : 'text-white/90'}`}>
                    {scene.name}
                  </span>
                  <span className={`text-xs px-2 py-1 rounded-md font-mono ${
                    selectedScene?.id === scene.id
                      ? 'bg-amber-500/30 text-amber-300 border border-amber-500/40'
                      : 'bg-white/10 text-white/60'
                  }`}>
                    {scene.scrollPercent}%
                  </span>
                </div>
                <div className="flex gap-4 text-xs text-white/40">
                  <span>Scale: {scene.state.scale.toFixed(1)}</span>
                  <span>Rot: {(scene.state.rotationY * 57.3).toFixed(0)}°</span>
                </div>
              </div>
            ))}
          </div>
        </aside>

        {/* Main - 3D Preview */}
        <main className="flex-1 flex flex-col min-w-0">
          <div className="flex-1 p-4 min-h-0">
            <div className="h-full rounded-2xl overflow-hidden border border-white/10 relative bg-neutral-900 shadow-2xl">
              <Canvas
                camera={{ position: [0, 0, 6], fov: 45 }}
                style={{ background: 'linear-gradient(180deg, #0a0a0a 0%, #050505 100%)' }}
              >
                <ambientLight intensity={0.3} />
                <directionalLight position={[10, 10, 5]} intensity={1} />
                <pointLight
                  position={[currentState.positionX, 0, 2]}
                  intensity={currentState.glow * 2}
                  color="#d4a853"
                />
                <Environment preset="studio" />
                <FerreroBall
                  position={[currentState.positionX, 0, 0]}
                  rotation={[0, currentState.rotationY, 0]}
                  scale={currentState.scale}
                />
              </Canvas>

              {/* Time indicator */}
              <div className="absolute bottom-5 right-5 bg-black/80 backdrop-blur-md rounded-xl px-5 py-3 border border-white/10 shadow-lg">
                <span className="font-mono text-3xl font-light text-white/90">{currentTime.toFixed(0)}</span>
                <span className="font-mono text-lg text-amber-400 ml-1">%</span>
              </div>
            </div>
          </div>

          {/* Timeline */}
          <div className="h-48 border-t border-white/10 flex flex-col flex-shrink-0 bg-black/40">
            <div className="flex items-center justify-between px-5 py-3 border-b border-white/10">
              <div className="flex items-center gap-4">
                <IconButton onClick={() => setCurrentTime(0)} size="sm" title="Reset">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                    <rect x="4" y="4" width="6" height="16" />
                  </svg>
                </IconButton>

                <IconButton
                  onClick={() => setIsPlaying(!isPlaying)}
                  active={isPlaying}
                  size="md"
                  title={isPlaying ? 'Pause' : 'Play'}
                >
                  {isPlaying ? (
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                      <rect x="6" y="4" width="4" height="16" rx="1" />
                      <rect x="14" y="4" width="4" height="16" rx="1" />
                    </svg>
                  ) : (
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                      <polygon points="5,3 19,12 5,21" />
                    </svg>
                  )}
                </IconButton>

                <div className="flex items-center gap-2 bg-white/5 rounded-lg px-4 py-2 border border-white/10">
                  <span className="font-mono text-sm text-amber-400">
                    {(currentTime / 100 * 5).toFixed(2)}s
                  </span>
                  <span className="text-white/20">/</span>
                  <span className="font-mono text-sm text-white/40">5.00s</span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs text-white/40">Speed</span>
                <select className="bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-amber-500/50 cursor-pointer">
                  <option value="0.5">0.5x</option>
                  <option value="1" selected>1x</option>
                  <option value="2">2x</option>
                </select>
              </div>
            </div>

            {/* Timeline tracks */}
            <div className="flex-1 overflow-auto relative">
              <div className="sticky top-0 h-8 bg-neutral-900/95 backdrop-blur border-b border-white/10 flex items-end z-10">
                <div className="w-32 flex-shrink-0" />
                <div className="flex-1 relative pb-1">
                  {[0, 20, 40, 60, 80, 100].map(t => (
                    <span
                      key={t}
                      className="absolute text-[10px] text-white/30 -translate-x-1/2 font-mono"
                      style={{ left: `${t}%` }}
                    >
                      {t}%
                    </span>
                  ))}
                </div>
              </div>

              {/* Playhead */}
              <div
                className="absolute top-0 bottom-0 w-0.5 bg-amber-500 z-20 pointer-events-none shadow-lg shadow-amber-500/50"
                style={{ left: `calc(128px + ${currentTime}% * 0.82)` }}
              >
                <div className="absolute top-1 left-1/2 -translate-x-1/2 w-3 h-3 bg-amber-500 rounded-full shadow-lg shadow-amber-500/50" />
              </div>

              {/* Tracks */}
              <div className="py-2">
                {keyframes.map(kf => (
                  <div key={kf.id} className="flex items-center h-10 px-3 hover:bg-white/5 group transition-colors">
                    <div className="w-28 text-xs text-white/50 font-medium truncate pr-3 group-hover:text-white/70 transition-colors">
                      {kf.name}
                    </div>
                    <div className="flex-1 relative h-7 bg-white/5 rounded-lg mx-2 overflow-hidden">
                      <div
                        className="absolute h-full rounded-lg cursor-pointer hover:brightness-110 transition-all"
                        style={{
                          left: `${kf.start}%`,
                          width: `${kf.end - kf.start}%`,
                          background: 'linear-gradient(90deg, rgba(212, 175, 55, 0.3), rgba(212, 175, 55, 0.5))',
                          border: '1px solid rgba(212, 175, 55, 0.6)',
                          boxShadow: '0 0 12px rgba(212, 175, 55, 0.2)',
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </main>

        {/* Properties panel */}
        {selectedScene && (
          <aside className="w-80 border-l border-white/10 overflow-auto flex-shrink-0 bg-black/40">
            <div className="px-5 py-5 border-b border-white/10 bg-gradient-to-br from-amber-500/15 to-transparent">
              <p className="text-xs text-white/40 uppercase tracking-wider mb-1">Properties</p>
              <h3 className="text-xl font-semibold text-amber-400">{selectedScene.name}</h3>
              <div className="flex gap-2 mt-3">
                <span className="text-xs px-3 py-1.5 rounded-lg bg-amber-500/20 text-amber-300 border border-amber-500/30 font-mono">
                  {selectedScene.scrollPercent}%
                </span>
              </div>
            </div>

            <div className="p-5 space-y-6">
              <Slider
                label="Opacity"
                value={selectedScene.state.opacity}
                min={0}
                max={1}
                step={0.1}
                onChange={(v) => updateScene(selectedScene.id, { opacity: v })}
              />

              <Slider
                label="Scale"
                value={selectedScene.state.scale}
                min={0.1}
                max={2}
                step={0.1}
                onChange={(v) => updateScene(selectedScene.id, { scale: v })}
              />

              <Slider
                label="Rotation Y"
                value={selectedScene.state.rotationY}
                min={0}
                max={6.28}
                step={0.1}
                onChange={(v) => updateScene(selectedScene.id, { rotationY: v })}
                formatValue={(v) => `${(v * 57.3).toFixed(0)}°`}
              />

              <Slider
                label="Glow"
                value={selectedScene.state.glow}
                min={0}
                max={2}
                step={0.1}
                onChange={(v) => updateScene(selectedScene.id, { glow: v })}
              />

              <Slider
                label="Position X"
                value={selectedScene.state.positionX}
                min={-3}
                max={3}
                step={0.1}
                onChange={(v) => updateScene(selectedScene.id, { positionX: v })}
              />
            </div>

            <div className="p-5 border-t border-white/10 space-y-3">
              <LumaButton active className="w-full">
                <span className="flex items-center justify-center gap-2">
                  <SparkleIcon size={14} />
                  Applica a Timeline
                </span>
              </LumaButton>
              <button
                onClick={() => deleteScene(selectedScene.id)}
                className="w-full text-xs text-red-400/60 hover:text-red-400 py-2.5 transition-colors rounded-lg hover:bg-red-500/10"
              >
                Elimina Scena
              </button>
            </div>
          </aside>
        )}
      </div>
    </div>
  )
}
