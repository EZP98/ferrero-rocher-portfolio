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
import './DebugPage.css'

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
    <div className="debug-page">
      {/* Left Sidebar */}
      <aside className="debug-sidebar">
        {/* Header */}
        <div className="debug-sidebar-header">
          <div className="debug-logo">
            <span>F</span>
          </div>
          <div>
            <div className="debug-title">Animation Editor</div>
            <div className="debug-subtitle">Ferrero Rocher</div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="debug-nav">
          {/* Editor Section */}
          <div className="debug-section">
            <div className="debug-section-title">Editor</div>

            <button
              onClick={() => setPanel('stages')}
              className={`debug-nav-btn ${panel === 'stages' ? 'active' : ''}`}
            >
              <Layers size={18} className="icon" />
              <span className="label">Animation Stages</span>
              {panel === 'stages' && <ChevronRight size={14} className="chevron" />}
            </button>

            <button
              onClick={() => setPanel('cards')}
              className={`debug-nav-btn ${panel === 'cards' ? 'active' : ''}`}
            >
              <CreditCard size={18} className="icon" />
              <span className="label">Info Cards</span>
              {panel === 'cards' && <ChevronRight size={14} className="chevron" />}
            </button>
          </div>

          <div className="debug-divider" />

          {/* Transform Section */}
          <div className="debug-section">
            <div className="debug-section-title">Transform</div>

            <button
              onClick={() => setPanel('rotation')}
              className={`debug-nav-btn ${panel === 'rotation' ? 'active' : ''}`}
            >
              <RotateCcw size={18} className="icon" />
              <span className="label">Rotation</span>
              {panel === 'rotation' && <ChevronRight size={14} className="chevron" />}
            </button>

            <button
              onClick={() => setPanel('position')}
              className={`debug-nav-btn ${panel === 'position' ? 'active' : ''}`}
            >
              <Move size={18} className="icon" />
              <span className="label">Position</span>
              {panel === 'position' && <ChevronRight size={14} className="chevron" />}
            </button>

            <button
              onClick={() => setPanel('scale')}
              className={`debug-nav-btn ${panel === 'scale' ? 'active' : ''}`}
            >
              <Maximize2 size={18} className="icon" />
              <span className="label">Scale</span>
              {panel === 'scale' && <ChevronRight size={14} className="chevron" />}
            </button>
          </div>

          <div className="debug-divider" />

          {/* Active Stage Section */}
          <div className="debug-section">
            <div className="debug-section-title">Active Stage</div>

            {stages.map((s, i) => (
              <button
                key={i}
                onClick={() => { setActiveStage(i); setScroll((s.scrollStart + s.scrollEnd) / 2) }}
                className={`debug-stage-btn ${activeStage === i ? 'active' : ''}`}
              >
                <span>{s.name}</span>
                <span className="percent">
                  {(s.scrollStart * 100).toFixed(0)}-{(s.scrollEnd * 100).toFixed(0)}%
                </span>
              </button>
            ))}
          </div>
        </nav>

        {/* Footer */}
        <div className="debug-footer">
          <a href="/" className="debug-footer-btn">
            <Home size={16} />
            <span>Back to Home</span>
          </a>
          <button onClick={handleExport} className="debug-footer-btn">
            <Download size={16} />
            <span>Export Config</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="debug-main">
        {/* Top Bar */}
        <header className="debug-topbar">
          <div className="debug-controls">
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className={`debug-play-btn ${isPlaying ? 'playing' : ''}`}
            >
              {isPlaying ? <Pause size={18} /> : <Play size={18} />}
            </button>
            <button onClick={() => setScroll(0)} className="debug-reset-btn">
              Reset
            </button>
          </div>

          <div className="debug-timeline">
            <input
              type="range"
              min={0}
              max={100}
              step={0.1}
              value={scroll * 100}
              onChange={(e) => setScroll(parseFloat(e.target.value) / 100)}
            />
            <div className="debug-percent">{(scroll * 100).toFixed(0)}%</div>
          </div>

          <div className="debug-stage-badge">
            <Eye size={14} className="icon" />
            <span>{current.name}</span>
          </div>
        </header>

        {/* Content Area */}
        <div className="debug-content">
          {/* Properties Panel */}
          <div className="debug-properties">
            {/* Stages Panel */}
            {panel === 'stages' && (
              <>
                <h2 className="debug-panel-title">Animation Stages</h2>
                <p className="debug-panel-desc">
                  Configura le transizioni 3D per ogni sezione dello scroll.
                </p>

                <div className="debug-card">
                  <div className="debug-card-title">Quick Views</div>
                  <div className="debug-quick-views">
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
                        className="debug-quick-btn"
                      >
                        {p.n}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="debug-card">
                  <div className="debug-card-title">Scroll Range</div>
                  <div className="debug-slider-row">
                    <div className="debug-slider-header">
                      <label className="debug-slider-label">Start</label>
                      <input
                        type="number"
                        value={current.scrollStart.toFixed(2)}
                        onChange={(e) => update('scrollStart', parseFloat(e.target.value) || 0)}
                        step={0.01}
                        className="debug-slider-input"
                      />
                    </div>
                    <input
                      type="range"
                      min={0}
                      max={1}
                      step={0.01}
                      value={current.scrollStart}
                      onChange={(e) => update('scrollStart', parseFloat(e.target.value))}
                      className="debug-slider"
                    />
                  </div>
                  <div className="debug-slider-row">
                    <div className="debug-slider-header">
                      <label className="debug-slider-label">End</label>
                      <input
                        type="number"
                        value={current.scrollEnd.toFixed(2)}
                        onChange={(e) => update('scrollEnd', parseFloat(e.target.value) || 0)}
                        step={0.01}
                        className="debug-slider-input"
                      />
                    </div>
                    <input
                      type="range"
                      min={0}
                      max={1}
                      step={0.01}
                      value={current.scrollEnd}
                      onChange={(e) => update('scrollEnd', parseFloat(e.target.value))}
                      className="debug-slider"
                    />
                  </div>
                </div>
              </>
            )}

            {/* Rotation Panel */}
            {panel === 'rotation' && (
              <>
                <h2 className="debug-panel-title">Rotation</h2>
                <p className="debug-panel-desc">
                  Controlla la rotazione del modello su ogni asse.
                </p>
                <div className="debug-card">
                  {['X', 'Y', 'Z'].map((axis) => {
                    const key = `rot${axis}` as 'rotX' | 'rotY' | 'rotZ'
                    const max = axis === 'Y' ? 6.28 : 3.14
                    return (
                      <div key={axis} className="debug-slider-row">
                        <div className="debug-slider-header">
                          <label className="debug-slider-label">{axis} Axis</label>
                          <input
                            type="number"
                            value={current[key].toFixed(2)}
                            onChange={(e) => update(key, parseFloat(e.target.value) || 0)}
                            step={0.01}
                            className="debug-slider-input"
                          />
                        </div>
                        <input
                          type="range"
                          min={-max}
                          max={max}
                          step={0.01}
                          value={current[key]}
                          onChange={(e) => update(key, parseFloat(e.target.value))}
                          className="debug-slider"
                        />
                      </div>
                    )
                  })}
                </div>
              </>
            )}

            {/* Position Panel */}
            {panel === 'position' && (
              <>
                <h2 className="debug-panel-title">Position</h2>
                <p className="debug-panel-desc">
                  Sposta il modello nello spazio 3D.
                </p>
                <div className="debug-card">
                  {['X', 'Y', 'Z'].map((axis) => {
                    const key = `pos${axis}` as 'posX' | 'posY' | 'posZ'
                    return (
                      <div key={axis} className="debug-slider-row">
                        <div className="debug-slider-header">
                          <label className="debug-slider-label">{axis} Axis</label>
                          <input
                            type="number"
                            value={current[key].toFixed(2)}
                            onChange={(e) => update(key, parseFloat(e.target.value) || 0)}
                            step={0.1}
                            className="debug-slider-input"
                          />
                        </div>
                        <input
                          type="range"
                          min={-5}
                          max={5}
                          step={0.1}
                          value={current[key]}
                          onChange={(e) => update(key, parseFloat(e.target.value))}
                          className="debug-slider"
                        />
                      </div>
                    )
                  })}
                </div>
              </>
            )}

            {/* Scale Panel */}
            {panel === 'scale' && (
              <>
                <h2 className="debug-panel-title">Scale</h2>
                <p className="debug-panel-desc">
                  Ridimensiona il modello uniformemente.
                </p>
                <div className="debug-card">
                  <div className="debug-slider-row">
                    <div className="debug-slider-header">
                      <label className="debug-slider-label">Size</label>
                      <input
                        type="number"
                        value={current.scale.toFixed(2)}
                        onChange={(e) => update('scale', parseFloat(e.target.value) || 0)}
                        step={0.1}
                        className="debug-slider-input"
                      />
                    </div>
                    <input
                      type="range"
                      min={0.5}
                      max={5}
                      step={0.1}
                      value={current.scale}
                      onChange={(e) => update('scale', parseFloat(e.target.value))}
                      className="debug-slider"
                    />
                  </div>
                </div>
              </>
            )}

            {/* Cards Panel */}
            {panel === 'cards' && (
              <>
                <h2 className="debug-panel-title">Info Cards</h2>
                <p className="debug-panel-desc">
                  Modifica i contenuti e i timing delle info card.
                </p>

                {cards.map((card, i) => (
                  <div key={card.id} className="debug-card-editor">
                    <input
                      type="text"
                      value={card.title}
                      onChange={(e) => setCards(p => p.map((c, j) => j === i ? { ...c, title: e.target.value } : c))}
                      placeholder="Card Title"
                      className="debug-card-editor-title"
                    />
                    <textarea
                      value={card.description}
                      onChange={(e) => setCards(p => p.map((c, j) => j === i ? { ...c, description: e.target.value } : c))}
                      placeholder="Description..."
                      className="debug-card-editor-desc"
                    />

                    <div className="debug-position-btns">
                      <button
                        onClick={() => setCards(p => p.map((c, j) => j === i ? { ...c, position: 'left' } : c))}
                        className={`debug-position-btn ${card.position === 'left' ? 'active' : ''}`}
                      >
                        ← Left
                      </button>
                      <button
                        onClick={() => setCards(p => p.map((c, j) => j === i ? { ...c, position: 'right' } : c))}
                        className={`debug-position-btn ${card.position === 'right' ? 'active' : ''}`}
                      >
                        Right →
                      </button>
                    </div>

                    <div className="debug-card-divider">
                      <div className="debug-slider-row">
                        <div className="debug-slider-header">
                          <label className="debug-slider-label">Fade In</label>
                          <input
                            type="number"
                            value={card.startScroll.toFixed(2)}
                            onChange={(e) => setCards(p => p.map((c, j) => j === i ? { ...c, startScroll: parseFloat(e.target.value) || 0 } : c))}
                            step={0.01}
                            className="debug-slider-input"
                          />
                        </div>
                        <input
                          type="range"
                          min={0}
                          max={1}
                          step={0.01}
                          value={card.startScroll}
                          onChange={(e) => setCards(p => p.map((c, j) => j === i ? { ...c, startScroll: parseFloat(e.target.value) } : c))}
                          className="debug-slider"
                        />
                      </div>
                      <div className="debug-slider-row">
                        <div className="debug-slider-header">
                          <label className="debug-slider-label">Fade Out</label>
                          <input
                            type="number"
                            value={card.endScroll.toFixed(2)}
                            onChange={(e) => setCards(p => p.map((c, j) => j === i ? { ...c, endScroll: parseFloat(e.target.value) || 0 } : c))}
                            step={0.01}
                            className="debug-slider-input"
                          />
                        </div>
                        <input
                          type="range"
                          min={0}
                          max={1}
                          step={0.01}
                          value={card.endScroll}
                          onChange={(e) => setCards(p => p.map((c, j) => j === i ? { ...c, endScroll: parseFloat(e.target.value) } : c))}
                          className="debug-slider"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </>
            )}
          </div>

          {/* 3D Viewport */}
          <div className="debug-viewport">
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
              <div className="debug-intro-overlay" style={{ opacity: Math.max(0, 1 - scroll * 7) }}>
                <div style={{ textAlign: 'center' }}>
                  <span className="tagline">L'arte del cioccolato</span>
                  <h1>
                    <span className="brand">FERRERO</span>
                    <span className="product">ROCHER</span>
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
                  className={`debug-info-card ${card.position}`}
                  style={{ opacity }}
                >
                  <div className="debug-info-card-inner">
                    <div className="accent" />
                    <h3>{card.title}</h3>
                    <p>{card.description}</p>
                  </div>
                </div>
              )
            })}

            {/* Viewport Info */}
            <div className="debug-viewport-info">
              <Settings size={12} className="icon" />
              <span>Scroll to orbit • Drag to rotate</span>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

useGLTF.preload('/models/ferrero.glb')
