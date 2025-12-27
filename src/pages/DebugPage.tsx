import { useState, useRef, Suspense, useEffect } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { useGLTF, Environment, OrbitControls } from '@react-three/drei'
import * as THREE from 'three'
import {
  Layers,
  CreditCard,
  RotateCcw,
  Move,
  Maximize2,
  Play,
  Pause,
  Home,
  Download,
  ChevronRight,
  Settings,
  Eye
} from 'lucide-react'

// Types
interface AnimationStage {
  name: string
  scrollStart: number
  scrollEnd: number
  rotX: number
  rotY: number
  rotZ: number
  posX: number
  posY: number
  posZ: number
  scale: number
}

interface InfoCard {
  id: number
  title: string
  description: string
  position: 'left' | 'right'
  startScroll: number
  endScroll: number
}

// Default data
const defaultStages: AnimationStage[] = [
  { name: "Intro", scrollStart: 0, scrollEnd: 0.15, rotX: 0, rotY: 0, rotZ: 0, posX: 0, posY: 0, posZ: 0, scale: 2.2 },
  { name: "Vista Sopra", scrollStart: 0.15, scrollEnd: 0.30, rotX: -0.6, rotY: 1.57, rotZ: 0, posX: -2, posY: 0, posZ: 0, scale: 2.2 },
  { name: "Vista Interna", scrollStart: 0.30, scrollEnd: 0.45, rotX: -0.3, rotY: 3.14, rotZ: 0, posX: 2, posY: 0, posZ: 0, scale: 2.2 },
  { name: "Vista Eleganza", scrollStart: 0.45, scrollEnd: 0.60, rotX: 0, rotY: 4.08, rotZ: 0, posX: 0, posY: 0, posZ: 0, scale: 2.2 },
]

const defaultCards: InfoCard[] = [
  { id: 1, title: 'La Copertura', description: 'Cioccolato al latte finissimo.', position: 'right', startScroll: 0.15, endScroll: 0.28 },
  { id: 2, title: 'Il Cuore', description: 'Una nocciola intera tostata.', position: 'left', startScroll: 0.30, endScroll: 0.43 },
  { id: 3, title: "L'Eleganza", description: "Avvolto in carta dorata.", position: 'right', startScroll: 0.45, endScroll: 0.58 },
]

// 3D Preview Component
function FerreroPreview({ stages, scroll }: { stages: AnimationStage[]; scroll: number }) {
  const ref = useRef<THREE.Group>(null)
  const { scene } = useGLTF('/models/ferrero.glb')

  useFrame(() => {
    if (!ref.current) return
    const s = stages.find(x => scroll >= x.scrollStart && scroll <= x.scrollEnd) || stages[0]
    ref.current.rotation.x = THREE.MathUtils.lerp(ref.current.rotation.x, s.rotX, 0.1)
    ref.current.rotation.y = THREE.MathUtils.lerp(ref.current.rotation.y, s.rotY, 0.1)
    ref.current.rotation.z = THREE.MathUtils.lerp(ref.current.rotation.z, s.rotZ, 0.1)
    ref.current.position.x = THREE.MathUtils.lerp(ref.current.position.x, s.posX, 0.1)
    ref.current.position.y = THREE.MathUtils.lerp(ref.current.position.y, s.posY, 0.1)
    ref.current.position.z = THREE.MathUtils.lerp(ref.current.position.z, s.posZ, 0.1)
    const sc = THREE.MathUtils.lerp(ref.current.scale.x, s.scale, 0.1)
    ref.current.scale.setScalar(sc)
  })

  return <primitive ref={ref} object={scene.clone()} />
}

// Navigation Button Component
function NavButton({
  icon: Icon,
  label,
  active,
  onClick,
}: {
  icon: React.ElementType
  label: string
  active?: boolean
  onClick?: () => void
}) {
  return (
    <button
      onClick={onClick}
      className={`
        w-full flex items-center gap-3 px-4 py-3 rounded-lg
        text-left text-sm font-medium transition-all duration-200
        ${active
          ? 'bg-amber-500/10 text-amber-500'
          : 'text-zinc-400 hover:text-white hover:bg-white/5'
        }
      `}
    >
      <Icon size={18} className={active ? 'text-amber-500' : 'text-zinc-500'} />
      <span className="flex-1">{label}</span>
      {active && <ChevronRight size={14} className="text-amber-500/50" />}
    </button>
  )
}

// Slider Input Component
function SliderInput({
  label,
  value,
  onChange,
  min,
  max,
  step = 0.01,
}: {
  label: string
  value: number
  onChange: (v: number) => void
  min: number
  max: number
  step?: number
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-xs text-zinc-500 uppercase tracking-wider font-medium">
          {label}
        </label>
        <input
          type="number"
          value={value.toFixed(2)}
          onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
          step={step}
          className="w-20 px-2 py-1.5 bg-zinc-800/50 border border-zinc-700/50 rounded-md
                     text-xs text-zinc-300 font-mono text-right
                     focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/20"
        />
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="w-full h-1.5 bg-zinc-800 rounded-full appearance-none cursor-pointer
          [&::-webkit-slider-thumb]:appearance-none
          [&::-webkit-slider-thumb]:w-4
          [&::-webkit-slider-thumb]:h-4
          [&::-webkit-slider-thumb]:rounded-full
          [&::-webkit-slider-thumb]:bg-amber-500
          [&::-webkit-slider-thumb]:cursor-pointer
          [&::-webkit-slider-thumb]:transition-transform
          [&::-webkit-slider-thumb]:hover:scale-110
          [&::-webkit-slider-thumb]:shadow-lg
          [&::-webkit-slider-thumb]:shadow-amber-500/30"
      />
    </div>
  )
}

// Section Header Component
function SectionHeader({ title }: { title: string }) {
  return (
    <div className="px-4 py-3">
      <h3 className="text-[10px] text-zinc-500 uppercase tracking-widest font-semibold">
        {title}
      </h3>
    </div>
  )
}

// Divider Component
function Divider() {
  return <div className="h-px bg-zinc-800/80 mx-4 my-2" />
}

export function DebugPage() {
  const [stages, setStages] = useState(defaultStages)
  const [cards, setCards] = useState(defaultCards)
  const [activeStage, setActiveStage] = useState(0)
  const [scroll, setScroll] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [panel, setPanel] = useState<'stages' | 'cards' | 'rotation' | 'position' | 'scale'>('stages')

  useEffect(() => {
    if (!isPlaying) return
    const i = setInterval(() => {
      setScroll(p => p >= 1 ? (setIsPlaying(false), 0) : p + 0.003)
    }, 16)
    return () => clearInterval(i)
  }, [isPlaying])

  const update = (key: keyof AnimationStage, val: number) => {
    setStages(p => p.map((s, i) => i === activeStage ? { ...s, [key]: val } : s))
  }

  const current = stages[activeStage]

  const handleExport = () => {
    navigator.clipboard.writeText(JSON.stringify({ stages, cards }, null, 2))
    alert('Configurazione copiata negli appunti!')
  }

  return (
    <div className="h-screen bg-zinc-950 flex overflow-hidden">

      {/* Left Sidebar */}
      <aside className="w-64 bg-zinc-900 border-r border-zinc-800 flex flex-col">

        {/* Header */}
        <div className="p-4 border-b border-zinc-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center shadow-lg shadow-amber-500/20">
              <span className="text-zinc-900 font-bold text-lg">F</span>
            </div>
            <div>
              <h1 className="text-sm font-semibold text-white">Animation Editor</h1>
              <p className="text-xs text-zinc-500">Ferrero Rocher</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-4 overflow-y-auto">

          <SectionHeader title="Editor" />
          <div className="px-2 space-y-1">
            <NavButton
              icon={Layers}
              label="Animation Stages"
              active={panel === 'stages'}
              onClick={() => setPanel('stages')}
            />
            <NavButton
              icon={CreditCard}
              label="Info Cards"
              active={panel === 'cards'}
              onClick={() => setPanel('cards')}
            />
          </div>

          <Divider />

          <SectionHeader title="Transform" />
          <div className="px-2 space-y-1">
            <NavButton
              icon={RotateCcw}
              label="Rotation"
              active={panel === 'rotation'}
              onClick={() => setPanel('rotation')}
            />
            <NavButton
              icon={Move}
              label="Position"
              active={panel === 'position'}
              onClick={() => setPanel('position')}
            />
            <NavButton
              icon={Maximize2}
              label="Scale"
              active={panel === 'scale'}
              onClick={() => setPanel('scale')}
            />
          </div>

          <Divider />

          <SectionHeader title="Active Stage" />
          <div className="px-2 space-y-1">
            {stages.map((s, i) => (
              <button
                key={i}
                onClick={() => { setActiveStage(i); setScroll((s.scrollStart + s.scrollEnd) / 2) }}
                className={`
                  w-full flex items-center justify-between px-4 py-2.5 rounded-lg
                  text-left text-sm transition-all duration-200
                  ${activeStage === i
                    ? 'bg-amber-500/10 text-amber-500 ring-1 ring-amber-500/20'
                    : 'text-zinc-400 hover:text-white hover:bg-white/5'
                  }
                `}
              >
                <span className="font-medium">{s.name}</span>
                <span className="text-[10px] text-zinc-500 font-mono">
                  {(s.scrollStart * 100).toFixed(0)}-{(s.scrollEnd * 100).toFixed(0)}%
                </span>
              </button>
            ))}
          </div>

        </nav>

        {/* Footer Actions */}
        <div className="p-4 border-t border-zinc-800 space-y-2">
          <a
            href="/"
            className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm text-zinc-400
                       hover:text-white hover:bg-white/5 transition-all"
          >
            <Home size={16} />
            <span>Back to Home</span>
          </a>
          <button
            onClick={handleExport}
            className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm
                       text-zinc-400 hover:text-white hover:bg-white/5 transition-all"
          >
            <Download size={16} />
            <span>Export Config</span>
          </button>
        </div>

      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col">

        {/* Top Bar */}
        <header className="h-16 bg-zinc-900/50 border-b border-zinc-800 flex items-center px-6 gap-6">

          {/* Play Controls */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className={`
                w-10 h-10 rounded-xl flex items-center justify-center transition-all
                ${isPlaying
                  ? 'bg-amber-500 text-zinc-900 shadow-lg shadow-amber-500/30'
                  : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-white'
                }
              `}
            >
              {isPlaying ? <Pause size={18} /> : <Play size={18} />}
            </button>
            <button
              onClick={() => setScroll(0)}
              className="h-10 px-4 rounded-xl bg-zinc-800 text-zinc-400 hover:bg-zinc-700
                         hover:text-white text-xs font-medium transition-all"
            >
              Reset
            </button>
          </div>

          {/* Timeline */}
          <div className="flex-1 flex items-center gap-4">
            <div className="flex-1 relative">
              {/* Stage markers */}
              <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-2 flex">
                {stages.map((s, i) => (
                  <div
                    key={i}
                    className="h-full bg-zinc-700/30 first:rounded-l last:rounded-r"
                    style={{
                      width: `${(s.scrollEnd - s.scrollStart) * 100}%`,
                      marginLeft: i === 0 ? `${s.scrollStart * 100}%` : 0
                    }}
                  />
                ))}
              </div>
              <input
                type="range"
                min={0}
                max={100}
                step={0.1}
                value={scroll * 100}
                onChange={(e) => setScroll(parseFloat(e.target.value) / 100)}
                className="relative w-full h-2 bg-transparent rounded-full appearance-none cursor-pointer z-10
                  [&::-webkit-slider-thumb]:appearance-none
                  [&::-webkit-slider-thumb]:w-5
                  [&::-webkit-slider-thumb]:h-5
                  [&::-webkit-slider-thumb]:rounded-full
                  [&::-webkit-slider-thumb]:bg-amber-500
                  [&::-webkit-slider-thumb]:cursor-pointer
                  [&::-webkit-slider-thumb]:shadow-lg
                  [&::-webkit-slider-thumb]:shadow-amber-500/40
                  [&::-webkit-slider-thumb]:border-2
                  [&::-webkit-slider-thumb]:border-amber-400"
              />
            </div>
            <div className="text-base font-mono text-amber-500 w-14 text-right font-semibold">
              {(scroll * 100).toFixed(0)}%
            </div>
          </div>

          {/* Current Stage Badge */}
          <div className="flex items-center gap-3 px-4 py-2 rounded-xl bg-zinc-800/50 border border-zinc-700/50">
            <Eye size={14} className="text-zinc-500" />
            <span className="text-sm text-zinc-300 font-medium">{current.name}</span>
          </div>

        </header>

        {/* Content Area */}
        <div className="flex-1 flex overflow-hidden">

          {/* Properties Panel */}
          <div className="w-80 bg-zinc-900/50 border-r border-zinc-800 overflow-y-auto">
            <div className="p-6 space-y-6">

              {/* Stages Panel */}
              {panel === 'stages' && (
                <>
                  <div>
                    <h2 className="text-lg font-semibold text-white mb-2">Animation Stages</h2>
                    <p className="text-sm text-zinc-500 leading-relaxed">
                      Configura le transizioni 3D per ogni sezione dello scroll.
                    </p>
                  </div>

                  <div className="p-4 rounded-xl bg-zinc-800/30 border border-zinc-700/30 space-y-4">
                    <h3 className="text-xs text-zinc-400 uppercase tracking-wider font-semibold">Quick Views</h3>
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        { n: 'Front', r: [0, 0, 0] },
                        { n: 'Top', r: [-1.57, 0, 0] },
                        { n: 'Side', r: [0, 1.57, 0] },
                        { n: 'Back', r: [0, 3.14, 0] },
                      ].map(p => (
                        <button
                          key={p.n}
                          onClick={() => setStages(prev => prev.map((s, i) =>
                            i === activeStage ? { ...s, rotX: p.r[0], rotY: p.r[1], rotZ: p.r[2] } : s
                          ))}
                          className="py-2.5 rounded-lg text-sm font-medium bg-zinc-800/50 text-zinc-400
                                     hover:bg-zinc-700 hover:text-white transition-all border border-zinc-700/50"
                        >
                          {p.n}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-zinc-800/30 border border-zinc-700/30 space-y-4">
                    <h3 className="text-xs text-zinc-400 uppercase tracking-wider font-semibold">Scroll Range</h3>
                    <SliderInput label="Start" value={current.scrollStart} onChange={v => update('scrollStart', v)} min={0} max={1} />
                    <SliderInput label="End" value={current.scrollEnd} onChange={v => update('scrollEnd', v)} min={0} max={1} />
                  </div>
                </>
              )}

              {/* Rotation Panel */}
              {panel === 'rotation' && (
                <>
                  <div>
                    <h2 className="text-lg font-semibold text-white mb-2">Rotation</h2>
                    <p className="text-sm text-zinc-500 leading-relaxed">
                      Controlla la rotazione del modello su ogni asse.
                    </p>
                  </div>
                  <div className="p-4 rounded-xl bg-zinc-800/30 border border-zinc-700/30 space-y-4">
                    <SliderInput label="X Axis" value={current.rotX} onChange={v => update('rotX', v)} min={-3.14} max={3.14} />
                    <SliderInput label="Y Axis" value={current.rotY} onChange={v => update('rotY', v)} min={-6.28} max={6.28} />
                    <SliderInput label="Z Axis" value={current.rotZ} onChange={v => update('rotZ', v)} min={-3.14} max={3.14} />
                  </div>
                </>
              )}

              {/* Position Panel */}
              {panel === 'position' && (
                <>
                  <div>
                    <h2 className="text-lg font-semibold text-white mb-2">Position</h2>
                    <p className="text-sm text-zinc-500 leading-relaxed">
                      Sposta il modello nello spazio 3D.
                    </p>
                  </div>
                  <div className="p-4 rounded-xl bg-zinc-800/30 border border-zinc-700/30 space-y-4">
                    <SliderInput label="X Axis" value={current.posX} onChange={v => update('posX', v)} min={-5} max={5} step={0.1} />
                    <SliderInput label="Y Axis" value={current.posY} onChange={v => update('posY', v)} min={-5} max={5} step={0.1} />
                    <SliderInput label="Z Axis" value={current.posZ} onChange={v => update('posZ', v)} min={-5} max={5} step={0.1} />
                  </div>
                </>
              )}

              {/* Scale Panel */}
              {panel === 'scale' && (
                <>
                  <div>
                    <h2 className="text-lg font-semibold text-white mb-2">Scale</h2>
                    <p className="text-sm text-zinc-500 leading-relaxed">
                      Ridimensiona il modello uniformemente.
                    </p>
                  </div>
                  <div className="p-4 rounded-xl bg-zinc-800/30 border border-zinc-700/30">
                    <SliderInput label="Size" value={current.scale} onChange={v => update('scale', v)} min={0.5} max={5} step={0.1} />
                  </div>
                </>
              )}

              {/* Cards Panel */}
              {panel === 'cards' && (
                <>
                  <div>
                    <h2 className="text-lg font-semibold text-white mb-2">Info Cards</h2>
                    <p className="text-sm text-zinc-500 leading-relaxed">
                      Modifica i contenuti e i timing delle info card.
                    </p>
                  </div>

                  {cards.map((card, i) => (
                    <div key={card.id} className="p-4 rounded-xl bg-zinc-800/30 border border-zinc-700/30 space-y-4">
                      <input
                        type="text"
                        value={card.title}
                        onChange={(e) => setCards(p => p.map((c, j) => j === i ? { ...c, title: e.target.value } : c))}
                        className="w-full bg-transparent text-base font-semibold text-white border-none outline-none placeholder:text-zinc-600"
                        placeholder="Card Title"
                      />
                      <textarea
                        value={card.description}
                        onChange={(e) => setCards(p => p.map((c, j) => j === i ? { ...c, description: e.target.value } : c))}
                        className="w-full bg-zinc-800/50 rounded-lg px-3 py-2.5 text-sm text-zinc-300
                                   border border-zinc-700/50 outline-none resize-none h-20
                                   focus:border-amber-500/30 focus:ring-1 focus:ring-amber-500/20"
                        placeholder="Description..."
                      />

                      <div className="flex gap-2">
                        {(['left', 'right'] as const).map(pos => (
                          <button
                            key={pos}
                            onClick={() => setCards(p => p.map((c, j) => j === i ? { ...c, position: pos } : c))}
                            className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all border ${
                              card.position === pos
                                ? 'bg-amber-500/10 text-amber-500 border-amber-500/30'
                                : 'bg-zinc-800/50 text-zinc-500 border-zinc-700/50 hover:text-white hover:border-zinc-600'
                            }`}
                          >
                            {pos === 'left' ? '← Left' : 'Right →'}
                          </button>
                        ))}
                      </div>

                      <div className="pt-4 border-t border-zinc-700/30 space-y-4">
                        <SliderInput
                          label="Fade In"
                          value={card.startScroll}
                          onChange={v => setCards(p => p.map((c, j) => j === i ? { ...c, startScroll: v } : c))}
                          min={0} max={1}
                        />
                        <SliderInput
                          label="Fade Out"
                          value={card.endScroll}
                          onChange={v => setCards(p => p.map((c, j) => j === i ? { ...c, endScroll: v } : c))}
                          min={0} max={1}
                        />
                      </div>
                    </div>
                  ))}
                </>
              )}

            </div>
          </div>

          {/* 3D Viewport */}
          <div className="flex-1 relative bg-zinc-950">
            <Canvas camera={{ position: [0, 0, 10], fov: 35 }} dpr={[1, 2]}>
              <color attach="background" args={['#09090b']} />
              <ambientLight intensity={0.15} />
              <spotLight position={[0, 12, 5]} angle={0.4} penumbra={0.8} intensity={3} />
              <spotLight position={[8, 2, 4]} angle={0.5} penumbra={1} intensity={2} color="#D4A853" />
              <spotLight position={[-8, 0, 4]} angle={0.5} penumbra={1} intensity={1.5} color="#E8C878" />
              <pointLight position={[0, -8, 2]} intensity={0.4} color="#5A3A28" />
              <Suspense fallback={null}>
                <FerreroPreview stages={stages} scroll={scroll} />
                <Environment preset="apartment" />
              </Suspense>
              <OrbitControls enableZoom enablePan />
            </Canvas>

            {/* Intro Title Overlay */}
            {scroll < 0.15 && (
              <div
                className="absolute inset-0 flex items-center justify-center pointer-events-none"
                style={{ opacity: Math.max(0, 1 - scroll * 7) }}
              >
                <div className="text-center">
                  <span className="block text-amber-500/60 uppercase tracking-[0.4em] text-xs mb-3">
                    L'arte del cioccolato
                  </span>
                  <h1 className="text-4xl font-light tracking-wide">
                    <span className="block text-white">FERRERO</span>
                    <span className="block text-amber-500 mt-1">ROCHER</span>
                  </h1>
                </div>
              </div>
            )}

            {/* Info Card Overlays */}
            {cards.map(card => {
              if (scroll < card.startScroll || scroll > card.endScroll) return null
              const fadeIn = card.startScroll + 0.03
              const fadeOut = card.endScroll - 0.03
              let opacity = 1
              if (scroll <= fadeIn) opacity = (scroll - card.startScroll) / 0.03
              else if (scroll >= fadeOut) opacity = 1 - (scroll - fadeOut) / 0.03

              return (
                <div
                  key={card.id}
                  className={`absolute top-1/2 -translate-y-1/2 ${card.position === 'right' ? 'right-10' : 'left-10'}`}
                  style={{ opacity }}
                >
                  <div className="backdrop-blur-2xl bg-zinc-900/60 border border-zinc-700/50 rounded-2xl p-6 max-w-xs shadow-2xl">
                    <div className="w-12 h-1 bg-gradient-to-r from-amber-500 to-amber-600 rounded-full mb-4" />
                    <h3 className="text-xl font-semibold text-white mb-2">{card.title}</h3>
                    <p className="text-zinc-400 text-sm leading-relaxed">{card.description}</p>
                  </div>
                </div>
              )
            })}

            {/* Viewport Info */}
            <div className="absolute bottom-4 left-4 flex items-center gap-2 px-3 py-2 rounded-lg bg-zinc-900/80 border border-zinc-800">
              <Settings size={12} className="text-zinc-500" />
              <span className="text-xs text-zinc-500">Scroll to orbit • Drag to rotate</span>
            </div>
          </div>

        </div>
      </main>

    </div>
  )
}

useGLTF.preload('/models/ferrero.glb')
