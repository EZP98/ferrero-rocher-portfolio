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
    <div style={{
      height: '100vh',
      backgroundColor: '#0c0c0c',
      display: 'flex',
      overflow: 'hidden',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    }}>

      {/* Left Sidebar */}
      <aside style={{
        width: 280,
        backgroundColor: '#141414',
        borderRight: '1px solid rgba(255,255,255,0.06)',
        display: 'flex',
        flexDirection: 'column'
      }}>

        {/* Header */}
        <div style={{
          padding: 20,
          borderBottom: '1px solid rgba(255,255,255,0.06)',
          display: 'flex',
          alignItems: 'center',
          gap: 14
        }}>
          <div style={{
            width: 44,
            height: 44,
            borderRadius: 12,
            background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 12px rgba(245, 158, 11, 0.3)'
          }}>
            <span style={{ color: '#000', fontWeight: 700, fontSize: 18 }}>F</span>
          </div>
          <div>
            <div style={{ fontSize: 14, fontWeight: 600, color: '#fff' }}>Animation Editor</div>
            <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', marginTop: 2 }}>Ferrero Rocher</div>
          </div>
        </div>

        {/* Navigation */}
        <nav style={{ flex: 1, padding: 16, overflowY: 'auto' }}>

          {/* Editor Section */}
          <div style={{ marginBottom: 24 }}>
            <div style={{
              fontSize: 10,
              color: 'rgba(255,255,255,0.3)',
              textTransform: 'uppercase',
              letterSpacing: 1.5,
              fontWeight: 600,
              padding: '0 12px',
              marginBottom: 12
            }}>
              Editor
            </div>

            <button
              onClick={() => setPanel('stages')}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                padding: '12px 14px',
                borderRadius: 10,
                border: 'none',
                background: panel === 'stages' ? 'rgba(245, 158, 11, 0.12)' : 'transparent',
                color: panel === 'stages' ? '#f59e0b' : 'rgba(255,255,255,0.5)',
                fontSize: 14,
                fontWeight: 500,
                cursor: 'pointer',
                textAlign: 'left',
                marginBottom: 4,
                transition: 'all 0.15s ease'
              }}
            >
              <Layers size={18} style={{ opacity: panel === 'stages' ? 1 : 0.5 }} />
              <span style={{ flex: 1 }}>Animation Stages</span>
              {panel === 'stages' && <ChevronRight size={14} style={{ opacity: 0.5 }} />}
            </button>

            <button
              onClick={() => setPanel('cards')}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                padding: '12px 14px',
                borderRadius: 10,
                border: 'none',
                background: panel === 'cards' ? 'rgba(245, 158, 11, 0.12)' : 'transparent',
                color: panel === 'cards' ? '#f59e0b' : 'rgba(255,255,255,0.5)',
                fontSize: 14,
                fontWeight: 500,
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'all 0.15s ease'
              }}
            >
              <CreditCard size={18} style={{ opacity: panel === 'cards' ? 1 : 0.5 }} />
              <span style={{ flex: 1 }}>Info Cards</span>
              {panel === 'cards' && <ChevronRight size={14} style={{ opacity: 0.5 }} />}
            </button>
          </div>

          {/* Divider */}
          <div style={{ height: 1, background: 'rgba(255,255,255,0.06)', margin: '8px 12px 20px' }} />

          {/* Transform Section */}
          <div style={{ marginBottom: 24 }}>
            <div style={{
              fontSize: 10,
              color: 'rgba(255,255,255,0.3)',
              textTransform: 'uppercase',
              letterSpacing: 1.5,
              fontWeight: 600,
              padding: '0 12px',
              marginBottom: 12
            }}>
              Transform
            </div>

            {[
              { id: 'rotation', icon: RotateCcw, label: 'Rotation' },
              { id: 'position', icon: Move, label: 'Position' },
              { id: 'scale', icon: Maximize2, label: 'Scale' },
            ].map(item => (
              <button
                key={item.id}
                onClick={() => setPanel(item.id as typeof panel)}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  padding: '12px 14px',
                  borderRadius: 10,
                  border: 'none',
                  background: panel === item.id ? 'rgba(245, 158, 11, 0.12)' : 'transparent',
                  color: panel === item.id ? '#f59e0b' : 'rgba(255,255,255,0.5)',
                  fontSize: 14,
                  fontWeight: 500,
                  cursor: 'pointer',
                  textAlign: 'left',
                  marginBottom: 4,
                  transition: 'all 0.15s ease'
                }}
              >
                <item.icon size={18} style={{ opacity: panel === item.id ? 1 : 0.5 }} />
                <span style={{ flex: 1 }}>{item.label}</span>
                {panel === item.id && <ChevronRight size={14} style={{ opacity: 0.5 }} />}
              </button>
            ))}
          </div>

          {/* Divider */}
          <div style={{ height: 1, background: 'rgba(255,255,255,0.06)', margin: '8px 12px 20px' }} />

          {/* Active Stage Section */}
          <div>
            <div style={{
              fontSize: 10,
              color: 'rgba(255,255,255,0.3)',
              textTransform: 'uppercase',
              letterSpacing: 1.5,
              fontWeight: 600,
              padding: '0 12px',
              marginBottom: 12
            }}>
              Active Stage
            </div>

            {stages.map((s, i) => (
              <button
                key={i}
                onClick={() => { setActiveStage(i); setScroll((s.scrollStart + s.scrollEnd) / 2) }}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '12px 14px',
                  borderRadius: 10,
                  border: activeStage === i ? '1px solid rgba(245, 158, 11, 0.3)' : '1px solid transparent',
                  background: activeStage === i ? 'rgba(245, 158, 11, 0.1)' : 'transparent',
                  color: activeStage === i ? '#f59e0b' : 'rgba(255,255,255,0.5)',
                  fontSize: 14,
                  fontWeight: 500,
                  cursor: 'pointer',
                  textAlign: 'left',
                  marginBottom: 6,
                  transition: 'all 0.15s ease'
                }}
              >
                <span>{s.name}</span>
                <span style={{ fontSize: 11, opacity: 0.6, fontFamily: 'monospace' }}>
                  {(s.scrollStart * 100).toFixed(0)}-{(s.scrollEnd * 100).toFixed(0)}%
                </span>
              </button>
            ))}
          </div>
        </nav>

        {/* Footer Actions */}
        <div style={{
          padding: 16,
          borderTop: '1px solid rgba(255,255,255,0.06)'
        }}>
          <a
            href="/"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              padding: '12px 14px',
              borderRadius: 10,
              color: 'rgba(255,255,255,0.5)',
              fontSize: 14,
              textDecoration: 'none',
              marginBottom: 6,
              transition: 'all 0.15s ease'
            }}
          >
            <Home size={16} />
            <span>Back to Home</span>
          </a>
          <button
            onClick={handleExport}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              padding: '12px 14px',
              borderRadius: 10,
              border: 'none',
              background: 'transparent',
              color: 'rgba(255,255,255,0.5)',
              fontSize: 14,
              cursor: 'pointer',
              textAlign: 'left',
              transition: 'all 0.15s ease'
            }}
          >
            <Download size={16} />
            <span>Export Config</span>
          </button>
        </div>

      </aside>

      {/* Main Content */}
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>

        {/* Top Bar */}
        <header style={{
          height: 64,
          backgroundColor: 'rgba(20, 20, 20, 0.8)',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
          display: 'flex',
          alignItems: 'center',
          padding: '0 24px',
          gap: 24
        }}>

          {/* Play Controls */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              style={{
                width: 44,
                height: 44,
                borderRadius: 12,
                border: 'none',
                background: isPlaying ? '#f59e0b' : 'rgba(255,255,255,0.08)',
                color: isPlaying ? '#000' : 'rgba(255,255,255,0.6)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                boxShadow: isPlaying ? '0 4px 12px rgba(245, 158, 11, 0.4)' : 'none',
                transition: 'all 0.2s ease'
              }}
            >
              {isPlaying ? <Pause size={18} /> : <Play size={18} />}
            </button>
            <button
              onClick={() => setScroll(0)}
              style={{
                height: 44,
                padding: '0 18px',
                borderRadius: 12,
                border: 'none',
                background: 'rgba(255,255,255,0.08)',
                color: 'rgba(255,255,255,0.6)',
                fontSize: 13,
                fontWeight: 500,
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              Reset
            </button>
          </div>

          {/* Timeline */}
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 16 }}>
            <input
              type="range"
              min={0}
              max={100}
              step={0.1}
              value={scroll * 100}
              onChange={(e) => setScroll(parseFloat(e.target.value) / 100)}
              style={{
                flex: 1,
                height: 6,
                borderRadius: 3,
                appearance: 'none',
                background: 'rgba(255,255,255,0.1)',
                cursor: 'pointer',
                accentColor: '#f59e0b'
              }}
            />
            <div style={{
              fontSize: 15,
              fontFamily: 'monospace',
              color: '#f59e0b',
              fontWeight: 600,
              minWidth: 50,
              textAlign: 'right'
            }}>
              {(scroll * 100).toFixed(0)}%
            </div>
          </div>

          {/* Current Stage Badge */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            padding: '10px 16px',
            borderRadius: 12,
            background: 'rgba(255,255,255,0.06)',
            border: '1px solid rgba(255,255,255,0.08)'
          }}>
            <Eye size={14} style={{ color: 'rgba(255,255,255,0.4)' }} />
            <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.8)', fontWeight: 500 }}>
              {current.name}
            </span>
          </div>

        </header>

        {/* Content Area */}
        <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>

          {/* Properties Panel */}
          <div style={{
            width: 340,
            backgroundColor: 'rgba(17, 17, 17, 0.9)',
            borderRight: '1px solid rgba(255,255,255,0.06)',
            overflowY: 'auto',
            padding: 24
          }}>

            {/* Stages Panel */}
            {panel === 'stages' && (
              <div>
                <h2 style={{ fontSize: 18, fontWeight: 600, color: '#fff', marginBottom: 8 }}>
                  Animation Stages
                </h2>
                <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.5)', lineHeight: 1.6, marginBottom: 28 }}>
                  Configura le transizioni 3D per ogni sezione dello scroll.
                </p>

                {/* Quick Views */}
                <div style={{
                  padding: 20,
                  borderRadius: 14,
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px solid rgba(255,255,255,0.06)',
                  marginBottom: 20
                }}>
                  <div style={{
                    fontSize: 11,
                    color: 'rgba(255,255,255,0.4)',
                    textTransform: 'uppercase',
                    letterSpacing: 1,
                    fontWeight: 600,
                    marginBottom: 14
                  }}>
                    Quick Views
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
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
                        style={{
                          padding: '12px 16px',
                          borderRadius: 10,
                          border: '1px solid rgba(255,255,255,0.08)',
                          background: 'rgba(255,255,255,0.04)',
                          color: 'rgba(255,255,255,0.6)',
                          fontSize: 13,
                          fontWeight: 500,
                          cursor: 'pointer',
                          transition: 'all 0.15s ease'
                        }}
                      >
                        {p.n}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Scroll Range */}
                <div style={{
                  padding: 20,
                  borderRadius: 14,
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px solid rgba(255,255,255,0.06)'
                }}>
                  <div style={{
                    fontSize: 11,
                    color: 'rgba(255,255,255,0.4)',
                    textTransform: 'uppercase',
                    letterSpacing: 1,
                    fontWeight: 600,
                    marginBottom: 20
                  }}>
                    Scroll Range
                  </div>

                  {/* Start */}
                  <div style={{ marginBottom: 20 }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                      <label style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: 0.5 }}>Start</label>
                      <input
                        type="number"
                        value={current.scrollStart.toFixed(2)}
                        onChange={(e) => update('scrollStart', parseFloat(e.target.value) || 0)}
                        step={0.01}
                        style={{
                          width: 70,
                          padding: '8px 12px',
                          borderRadius: 8,
                          border: '1px solid rgba(255,255,255,0.1)',
                          background: 'rgba(255,255,255,0.05)',
                          color: 'rgba(255,255,255,0.8)',
                          fontSize: 13,
                          fontFamily: 'monospace',
                          textAlign: 'center'
                        }}
                      />
                    </div>
                    <input
                      type="range"
                      min={0}
                      max={1}
                      step={0.01}
                      value={current.scrollStart}
                      onChange={(e) => update('scrollStart', parseFloat(e.target.value))}
                      style={{ width: '100%', accentColor: '#f59e0b' }}
                    />
                  </div>

                  {/* End */}
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                      <label style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: 0.5 }}>End</label>
                      <input
                        type="number"
                        value={current.scrollEnd.toFixed(2)}
                        onChange={(e) => update('scrollEnd', parseFloat(e.target.value) || 0)}
                        step={0.01}
                        style={{
                          width: 70,
                          padding: '8px 12px',
                          borderRadius: 8,
                          border: '1px solid rgba(255,255,255,0.1)',
                          background: 'rgba(255,255,255,0.05)',
                          color: 'rgba(255,255,255,0.8)',
                          fontSize: 13,
                          fontFamily: 'monospace',
                          textAlign: 'center'
                        }}
                      />
                    </div>
                    <input
                      type="range"
                      min={0}
                      max={1}
                      step={0.01}
                      value={current.scrollEnd}
                      onChange={(e) => update('scrollEnd', parseFloat(e.target.value))}
                      style={{ width: '100%', accentColor: '#f59e0b' }}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Rotation Panel */}
            {panel === 'rotation' && (
              <div>
                <h2 style={{ fontSize: 18, fontWeight: 600, color: '#fff', marginBottom: 8 }}>
                  Rotation
                </h2>
                <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.5)', lineHeight: 1.6, marginBottom: 28 }}>
                  Controlla la rotazione del modello su ogni asse.
                </p>

                <div style={{
                  padding: 20,
                  borderRadius: 14,
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px solid rgba(255,255,255,0.06)'
                }}>
                  {['X', 'Y', 'Z'].map((axis, idx) => {
                    const key = `rot${axis}` as 'rotX' | 'rotY' | 'rotZ'
                    const max = axis === 'Y' ? 6.28 : 3.14
                    return (
                      <div key={axis} style={{ marginBottom: idx < 2 ? 24 : 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                          <label style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: 0.5 }}>{axis} Axis</label>
                          <input
                            type="number"
                            value={current[key].toFixed(2)}
                            onChange={(e) => update(key, parseFloat(e.target.value) || 0)}
                            step={0.01}
                            style={{
                              width: 70,
                              padding: '8px 12px',
                              borderRadius: 8,
                              border: '1px solid rgba(255,255,255,0.1)',
                              background: 'rgba(255,255,255,0.05)',
                              color: 'rgba(255,255,255,0.8)',
                              fontSize: 13,
                              fontFamily: 'monospace',
                              textAlign: 'center'
                            }}
                          />
                        </div>
                        <input
                          type="range"
                          min={-max}
                          max={max}
                          step={0.01}
                          value={current[key]}
                          onChange={(e) => update(key, parseFloat(e.target.value))}
                          style={{ width: '100%', accentColor: '#f59e0b' }}
                        />
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Position Panel */}
            {panel === 'position' && (
              <div>
                <h2 style={{ fontSize: 18, fontWeight: 600, color: '#fff', marginBottom: 8 }}>
                  Position
                </h2>
                <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.5)', lineHeight: 1.6, marginBottom: 28 }}>
                  Sposta il modello nello spazio 3D.
                </p>

                <div style={{
                  padding: 20,
                  borderRadius: 14,
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px solid rgba(255,255,255,0.06)'
                }}>
                  {['X', 'Y', 'Z'].map((axis, idx) => {
                    const key = `pos${axis}` as 'posX' | 'posY' | 'posZ'
                    return (
                      <div key={axis} style={{ marginBottom: idx < 2 ? 24 : 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                          <label style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: 0.5 }}>{axis} Axis</label>
                          <input
                            type="number"
                            value={current[key].toFixed(2)}
                            onChange={(e) => update(key, parseFloat(e.target.value) || 0)}
                            step={0.1}
                            style={{
                              width: 70,
                              padding: '8px 12px',
                              borderRadius: 8,
                              border: '1px solid rgba(255,255,255,0.1)',
                              background: 'rgba(255,255,255,0.05)',
                              color: 'rgba(255,255,255,0.8)',
                              fontSize: 13,
                              fontFamily: 'monospace',
                              textAlign: 'center'
                            }}
                          />
                        </div>
                        <input
                          type="range"
                          min={-5}
                          max={5}
                          step={0.1}
                          value={current[key]}
                          onChange={(e) => update(key, parseFloat(e.target.value))}
                          style={{ width: '100%', accentColor: '#f59e0b' }}
                        />
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Scale Panel */}
            {panel === 'scale' && (
              <div>
                <h2 style={{ fontSize: 18, fontWeight: 600, color: '#fff', marginBottom: 8 }}>
                  Scale
                </h2>
                <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.5)', lineHeight: 1.6, marginBottom: 28 }}>
                  Ridimensiona il modello uniformemente.
                </p>

                <div style={{
                  padding: 20,
                  borderRadius: 14,
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px solid rgba(255,255,255,0.06)'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                    <label style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: 0.5 }}>Size</label>
                    <input
                      type="number"
                      value={current.scale.toFixed(2)}
                      onChange={(e) => update('scale', parseFloat(e.target.value) || 0)}
                      step={0.1}
                      style={{
                        width: 70,
                        padding: '8px 12px',
                        borderRadius: 8,
                        border: '1px solid rgba(255,255,255,0.1)',
                        background: 'rgba(255,255,255,0.05)',
                        color: 'rgba(255,255,255,0.8)',
                        fontSize: 13,
                        fontFamily: 'monospace',
                        textAlign: 'center'
                      }}
                    />
                  </div>
                  <input
                    type="range"
                    min={0.5}
                    max={5}
                    step={0.1}
                    value={current.scale}
                    onChange={(e) => update('scale', parseFloat(e.target.value))}
                    style={{ width: '100%', accentColor: '#f59e0b' }}
                  />
                </div>
              </div>
            )}

            {/* Cards Panel */}
            {panel === 'cards' && (
              <div>
                <h2 style={{ fontSize: 18, fontWeight: 600, color: '#fff', marginBottom: 8 }}>
                  Info Cards
                </h2>
                <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.5)', lineHeight: 1.6, marginBottom: 28 }}>
                  Modifica i contenuti e i timing delle info card.
                </p>

                {cards.map((card, i) => (
                  <div key={card.id} style={{
                    padding: 20,
                    borderRadius: 14,
                    background: 'rgba(255,255,255,0.03)',
                    border: '1px solid rgba(255,255,255,0.06)',
                    marginBottom: 16
                  }}>
                    <input
                      type="text"
                      value={card.title}
                      onChange={(e) => setCards(p => p.map((c, j) => j === i ? { ...c, title: e.target.value } : c))}
                      placeholder="Card Title"
                      style={{
                        width: '100%',
                        padding: 0,
                        marginBottom: 14,
                        border: 'none',
                        background: 'transparent',
                        color: '#fff',
                        fontSize: 16,
                        fontWeight: 600,
                        outline: 'none'
                      }}
                    />
                    <textarea
                      value={card.description}
                      onChange={(e) => setCards(p => p.map((c, j) => j === i ? { ...c, description: e.target.value } : c))}
                      placeholder="Description..."
                      style={{
                        width: '100%',
                        padding: '12px 14px',
                        marginBottom: 14,
                        borderRadius: 10,
                        border: '1px solid rgba(255,255,255,0.08)',
                        background: 'rgba(255,255,255,0.04)',
                        color: 'rgba(255,255,255,0.8)',
                        fontSize: 13,
                        resize: 'none',
                        height: 80,
                        outline: 'none',
                        fontFamily: 'inherit'
                      }}
                    />

                    <div style={{ display: 'flex', gap: 10, marginBottom: 20 }}>
                      {(['left', 'right'] as const).map(pos => (
                        <button
                          key={pos}
                          onClick={() => setCards(p => p.map((c, j) => j === i ? { ...c, position: pos } : c))}
                          style={{
                            flex: 1,
                            padding: '12px 16px',
                            borderRadius: 10,
                            border: card.position === pos ? '1px solid rgba(245, 158, 11, 0.4)' : '1px solid rgba(255,255,255,0.08)',
                            background: card.position === pos ? 'rgba(245, 158, 11, 0.1)' : 'rgba(255,255,255,0.04)',
                            color: card.position === pos ? '#f59e0b' : 'rgba(255,255,255,0.5)',
                            fontSize: 13,
                            fontWeight: 500,
                            cursor: 'pointer'
                          }}
                        >
                          {pos === 'left' ? '← Left' : 'Right →'}
                        </button>
                      ))}
                    </div>

                    <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: 20 }}>
                      {/* Fade In */}
                      <div style={{ marginBottom: 20 }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                          <label style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: 0.5 }}>Fade In</label>
                          <input
                            type="number"
                            value={card.startScroll.toFixed(2)}
                            onChange={(e) => setCards(p => p.map((c, j) => j === i ? { ...c, startScroll: parseFloat(e.target.value) || 0 } : c))}
                            step={0.01}
                            style={{
                              width: 70,
                              padding: '8px 12px',
                              borderRadius: 8,
                              border: '1px solid rgba(255,255,255,0.1)',
                              background: 'rgba(255,255,255,0.05)',
                              color: 'rgba(255,255,255,0.8)',
                              fontSize: 13,
                              fontFamily: 'monospace',
                              textAlign: 'center'
                            }}
                          />
                        </div>
                        <input
                          type="range"
                          min={0}
                          max={1}
                          step={0.01}
                          value={card.startScroll}
                          onChange={(e) => setCards(p => p.map((c, j) => j === i ? { ...c, startScroll: parseFloat(e.target.value) } : c))}
                          style={{ width: '100%', accentColor: '#f59e0b' }}
                        />
                      </div>

                      {/* Fade Out */}
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                          <label style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: 0.5 }}>Fade Out</label>
                          <input
                            type="number"
                            value={card.endScroll.toFixed(2)}
                            onChange={(e) => setCards(p => p.map((c, j) => j === i ? { ...c, endScroll: parseFloat(e.target.value) || 0 } : c))}
                            step={0.01}
                            style={{
                              width: 70,
                              padding: '8px 12px',
                              borderRadius: 8,
                              border: '1px solid rgba(255,255,255,0.1)',
                              background: 'rgba(255,255,255,0.05)',
                              color: 'rgba(255,255,255,0.8)',
                              fontSize: 13,
                              fontFamily: 'monospace',
                              textAlign: 'center'
                            }}
                          />
                        </div>
                        <input
                          type="range"
                          min={0}
                          max={1}
                          step={0.01}
                          value={card.endScroll}
                          onChange={(e) => setCards(p => p.map((c, j) => j === i ? { ...c, endScroll: parseFloat(e.target.value) } : c))}
                          style={{ width: '100%', accentColor: '#f59e0b' }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

          </div>

          {/* 3D Viewport */}
          <div style={{ flex: 1, position: 'relative', backgroundColor: '#09090b' }}>
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
                style={{
                  position: 'absolute',
                  inset: 0,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  pointerEvents: 'none',
                  opacity: Math.max(0, 1 - scroll * 7)
                }}
              >
                <div style={{ textAlign: 'center' }}>
                  <span style={{
                    display: 'block',
                    color: 'rgba(245, 158, 11, 0.6)',
                    textTransform: 'uppercase',
                    letterSpacing: 6,
                    fontSize: 11,
                    marginBottom: 12
                  }}>
                    L'arte del cioccolato
                  </span>
                  <h1 style={{ fontSize: 42, fontWeight: 300, letterSpacing: 4 }}>
                    <span style={{ display: 'block', color: '#fff' }}>FERRERO</span>
                    <span style={{ display: 'block', color: '#f59e0b', marginTop: 4 }}>ROCHER</span>
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
                  style={{
                    position: 'absolute',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    [card.position === 'right' ? 'right' : 'left']: 40,
                    opacity
                  }}
                >
                  <div style={{
                    backdropFilter: 'blur(24px)',
                    backgroundColor: 'rgba(20, 20, 20, 0.7)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: 20,
                    padding: 28,
                    maxWidth: 280,
                    boxShadow: '0 20px 40px rgba(0,0,0,0.4)'
                  }}>
                    <div style={{
                      width: 48,
                      height: 4,
                      background: 'linear-gradient(90deg, #f59e0b, #d97706)',
                      borderRadius: 2,
                      marginBottom: 18
                    }} />
                    <h3 style={{ fontSize: 22, fontWeight: 600, color: '#fff', marginBottom: 10 }}>{card.title}</h3>
                    <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.6)', lineHeight: 1.6 }}>{card.description}</p>
                  </div>
                </div>
              )
            })}

            {/* Viewport Info */}
            <div style={{
              position: 'absolute',
              bottom: 16,
              left: 16,
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: '10px 14px',
              borderRadius: 10,
              backgroundColor: 'rgba(20, 20, 20, 0.9)',
              border: '1px solid rgba(255,255,255,0.08)'
            }}>
              <Settings size={12} style={{ color: 'rgba(255,255,255,0.4)' }} />
              <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)' }}>Scroll to orbit • Drag to rotate</span>
            </div>
          </div>

        </div>
      </main>

    </div>
  )
}

useGLTF.preload('/models/ferrero.glb')
