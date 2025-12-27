import { useState, useRef, Suspense, useEffect, CSSProperties } from 'react'
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

// Inline styles - cannot be overridden by CSS
const s = {
  page: {
    height: '100vh',
    backgroundColor: '#0c0c0c',
    display: 'flex',
    overflow: 'hidden',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  } as CSSProperties,

  sidebar: {
    width: '280px',
    minWidth: '280px',
    backgroundColor: '#141414',
    borderRight: '1px solid rgba(255,255,255,0.06)',
    display: 'flex',
    flexDirection: 'column',
    boxSizing: 'border-box',
  } as CSSProperties,

  sidebarHeader: {
    padding: 20,
    borderBottom: '1px solid rgba(255,255,255,0.06)',
    display: 'flex',
    alignItems: 'center',
    gap: 14,
  } as CSSProperties,

  logo: {
    width: 44,
    height: 44,
    borderRadius: 12,
    background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 4px 12px rgba(245, 158, 11, 0.3)',
    flexShrink: 0,
  } as CSSProperties,

  logoText: {
    color: '#000',
    fontWeight: 700,
    fontSize: 18,
  } as CSSProperties,

  title: {
    fontSize: 14,
    fontWeight: 600,
    color: '#fff',
    margin: 0,
  } as CSSProperties,

  subtitle: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.4)',
    marginTop: 2,
  } as CSSProperties,

  nav: {
    flex: 1,
    padding: '16px',
    overflowY: 'auto',
    boxSizing: 'border-box',
    width: '100%',
  } as CSSProperties,

  section: {
    marginBottom: '24px',
    width: '100%',
  } as CSSProperties,

  sectionTitle: {
    fontSize: 10,
    color: 'rgba(255,255,255,0.3)',
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    fontWeight: 600,
    padding: '0 12px',
    marginBottom: 12,
  } as CSSProperties,

  divider: {
    height: 1,
    background: 'rgba(255,255,255,0.06)',
    margin: '8px 12px 20px',
  } as CSSProperties,

  navBtn: {
    width: '100%',
    boxSizing: 'border-box',
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '12px 14px',
    borderRadius: '10px',
    border: 'none',
    background: 'transparent',
    color: 'rgba(255,255,255,0.5)',
    fontSize: '14px',
    fontWeight: 500,
    cursor: 'pointer',
    textAlign: 'left',
    marginBottom: '4px',
  } as CSSProperties,

  navBtnActive: {
    background: 'rgba(245, 158, 11, 0.12)',
    color: '#f59e0b',
  } as CSSProperties,

  stageBtn: {
    width: '100%',
    boxSizing: 'border-box',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '12px 14px',
    borderRadius: '10px',
    border: '1px solid transparent',
    background: 'transparent',
    color: 'rgba(255,255,255,0.5)',
    fontSize: '14px',
    fontWeight: 500,
    cursor: 'pointer',
    textAlign: 'left',
    marginBottom: '6px',
  } as CSSProperties,

  stageBtnActive: {
    background: 'rgba(245, 158, 11, 0.1)',
    borderColor: 'rgba(245, 158, 11, 0.3)',
    color: '#f59e0b',
  } as CSSProperties,

  percent: {
    fontSize: 11,
    opacity: 0.6,
    fontFamily: 'monospace',
  } as CSSProperties,

  footer: {
    padding: 16,
    borderTop: '1px solid rgba(255,255,255,0.06)',
  } as CSSProperties,

  footerBtn: {
    width: '100%',
    boxSizing: 'border-box',
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '12px 14px',
    borderRadius: '10px',
    border: 'none',
    background: 'transparent',
    color: 'rgba(255,255,255,0.5)',
    fontSize: '14px',
    cursor: 'pointer',
    textAlign: 'left',
    textDecoration: 'none',
    marginBottom: '6px',
  } as CSSProperties,

  main: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
  } as CSSProperties,

  topbar: {
    height: 64,
    backgroundColor: 'rgba(20, 20, 20, 0.8)',
    borderBottom: '1px solid rgba(255,255,255,0.06)',
    display: 'flex',
    alignItems: 'center',
    padding: '0 24px',
    gap: 24,
  } as CSSProperties,

  controls: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
  } as CSSProperties,

  playBtn: {
    width: 44,
    height: 44,
    borderRadius: 12,
    border: 'none',
    background: 'rgba(255,255,255,0.08)',
    color: 'rgba(255,255,255,0.6)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
  } as CSSProperties,

  playBtnActive: {
    background: '#f59e0b',
    color: '#000',
    boxShadow: '0 4px 12px rgba(245, 158, 11, 0.4)',
  } as CSSProperties,

  resetBtn: {
    height: 44,
    padding: '0 18px',
    borderRadius: 12,
    border: 'none',
    background: 'rgba(255,255,255,0.08)',
    color: 'rgba(255,255,255,0.6)',
    fontSize: 13,
    fontWeight: 500,
    cursor: 'pointer',
  } as CSSProperties,

  timeline: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    gap: 16,
  } as CSSProperties,

  rangeInput: {
    flex: 1,
    height: 6,
    borderRadius: 3,
    WebkitAppearance: 'none',
    appearance: 'none',
    background: 'rgba(255,255,255,0.1)',
    cursor: 'pointer',
  } as CSSProperties,

  percentText: {
    fontSize: 15,
    fontFamily: 'monospace',
    color: '#f59e0b',
    fontWeight: 600,
    minWidth: 50,
    textAlign: 'right',
  } as CSSProperties,

  stageBadge: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    padding: '10px 16px',
    borderRadius: 12,
    background: 'rgba(255,255,255,0.06)',
    border: '1px solid rgba(255,255,255,0.08)',
  } as CSSProperties,

  content: {
    flex: 1,
    display: 'flex',
    overflow: 'hidden',
  } as CSSProperties,

  properties: {
    width: 340,
    backgroundColor: 'rgba(17, 17, 17, 0.9)',
    borderRight: '1px solid rgba(255,255,255,0.06)',
    overflowY: 'auto',
    padding: 24,
  } as CSSProperties,

  panelTitle: {
    fontSize: 18,
    fontWeight: 600,
    color: '#fff',
    margin: '0 0 8px 0',
  } as CSSProperties,

  panelDesc: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.5)',
    lineHeight: 1.6,
    margin: '0 0 28px 0',
  } as CSSProperties,

  card: {
    padding: 20,
    borderRadius: 14,
    background: 'rgba(255,255,255,0.03)',
    border: '1px solid rgba(255,255,255,0.06)',
    marginBottom: 20,
  } as CSSProperties,

  cardTitle: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.4)',
    textTransform: 'uppercase',
    letterSpacing: 1,
    fontWeight: 600,
    margin: '0 0 14px 0',
  } as CSSProperties,

  quickViews: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: 10,
  } as CSSProperties,

  quickBtn: {
    padding: '12px 16px',
    borderRadius: 10,
    border: '1px solid rgba(255,255,255,0.08)',
    background: 'rgba(255,255,255,0.04)',
    color: 'rgba(255,255,255,0.6)',
    fontSize: 13,
    fontWeight: 500,
    cursor: 'pointer',
  } as CSSProperties,

  sliderRow: {
    marginBottom: 20,
  } as CSSProperties,

  sliderHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  } as CSSProperties,

  sliderLabel: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.5)',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  } as CSSProperties,

  sliderInput: {
    width: 70,
    padding: '8px 12px',
    borderRadius: 8,
    border: '1px solid rgba(255,255,255,0.1)',
    background: 'rgba(255,255,255,0.05)',
    color: 'rgba(255,255,255,0.8)',
    fontSize: 13,
    fontFamily: 'monospace',
    textAlign: 'center',
  } as CSSProperties,

  slider: {
    width: '100%',
    height: 6,
    borderRadius: 3,
    WebkitAppearance: 'none',
    appearance: 'none',
    background: 'rgba(255,255,255,0.1)',
    cursor: 'pointer',
  } as CSSProperties,

  cardEditor: {
    padding: 20,
    borderRadius: 14,
    background: 'rgba(255,255,255,0.03)',
    border: '1px solid rgba(255,255,255,0.06)',
    marginBottom: 16,
  } as CSSProperties,

  cardEditorTitle: {
    width: '100%',
    padding: 0,
    marginBottom: 14,
    border: 'none',
    background: 'transparent',
    color: '#fff',
    fontSize: 16,
    fontWeight: 600,
    outline: 'none',
  } as CSSProperties,

  cardEditorDesc: {
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
    fontFamily: 'inherit',
  } as CSSProperties,

  positionBtns: {
    display: 'flex',
    gap: 10,
    marginBottom: 20,
  } as CSSProperties,

  positionBtn: {
    flex: 1,
    padding: '12px 16px',
    borderRadius: 10,
    border: '1px solid rgba(255,255,255,0.08)',
    background: 'rgba(255,255,255,0.04)',
    color: 'rgba(255,255,255,0.5)',
    fontSize: 13,
    fontWeight: 500,
    cursor: 'pointer',
  } as CSSProperties,

  positionBtnActive: {
    background: 'rgba(245, 158, 11, 0.1)',
    borderColor: 'rgba(245, 158, 11, 0.4)',
    color: '#f59e0b',
  } as CSSProperties,

  cardDivider: {
    borderTop: '1px solid rgba(255,255,255,0.06)',
    paddingTop: 20,
  } as CSSProperties,

  viewport: {
    flex: 1,
    position: 'relative',
    backgroundColor: '#09090b',
  } as CSSProperties,

  viewportInfo: {
    position: 'absolute',
    bottom: 16,
    left: 16,
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    padding: '10px 14px',
    borderRadius: 10,
    backgroundColor: 'rgba(20, 20, 20, 0.9)',
    border: '1px solid rgba(255,255,255,0.08)',
    color: 'rgba(255,255,255,0.4)',
    fontSize: 12,
  } as CSSProperties,

  introOverlay: {
    position: 'absolute',
    inset: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    pointerEvents: 'none',
  } as CSSProperties,

  tagline: {
    display: 'block',
    color: 'rgba(245, 158, 11, 0.6)',
    textTransform: 'uppercase',
    letterSpacing: 6,
    fontSize: 11,
    marginBottom: 12,
  } as CSSProperties,

  h1: {
    fontSize: 42,
    fontWeight: 300,
    letterSpacing: 4,
    margin: 0,
  } as CSSProperties,

  brand: {
    display: 'block',
    color: '#fff',
  } as CSSProperties,

  product: {
    display: 'block',
    color: '#f59e0b',
    marginTop: 4,
  } as CSSProperties,

  infoCard: {
    position: 'absolute',
    top: '50%',
    transform: 'translateY(-50%)',
  } as CSSProperties,

  infoCardInner: {
    backdropFilter: 'blur(24px)',
    backgroundColor: 'rgba(20, 20, 20, 0.7)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: 20,
    padding: 28,
    maxWidth: 280,
    boxShadow: '0 20px 40px rgba(0,0,0,0.4)',
  } as CSSProperties,

  accent: {
    width: 48,
    height: 4,
    background: 'linear-gradient(90deg, #f59e0b, #d97706)',
    borderRadius: 2,
    marginBottom: 18,
  } as CSSProperties,

  infoH3: {
    fontSize: 22,
    fontWeight: 600,
    color: '#fff',
    margin: '0 0 10px 0',
  } as CSSProperties,

  infoP: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.6)',
    lineHeight: 1.6,
    margin: 0,
  } as CSSProperties,
}

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
    const st = stages.find(x => scroll >= x.scrollStart && scroll <= x.scrollEnd) || stages[0]
    ref.current.rotation.x = THREE.MathUtils.lerp(ref.current.rotation.x, st.rotX, 0.1)
    ref.current.rotation.y = THREE.MathUtils.lerp(ref.current.rotation.y, st.rotY, 0.1)
    ref.current.rotation.z = THREE.MathUtils.lerp(ref.current.rotation.z, st.rotZ, 0.1)
    ref.current.position.x = THREE.MathUtils.lerp(ref.current.position.x, st.posX, 0.1)
    ref.current.position.y = THREE.MathUtils.lerp(ref.current.position.y, st.posY, 0.1)
    ref.current.position.z = THREE.MathUtils.lerp(ref.current.position.z, st.posZ, 0.1)
    const sc = THREE.MathUtils.lerp(ref.current.scale.x, st.scale, 0.1)
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
    setStages(p => p.map((st, i) => i === activeStage ? { ...st, [key]: val } : st))
  }

  const current = stages[activeStage]

  const handleExport = () => {
    navigator.clipboard.writeText(JSON.stringify({ stages, cards }, null, 2))
    alert('Configurazione copiata negli appunti!')
  }

  return (
    <div style={s.page}>
      {/* Left Sidebar */}
      <aside style={s.sidebar}>
        {/* Header */}
        <div style={s.sidebarHeader}>
          <div style={s.logo}>
            <span style={s.logoText}>F</span>
          </div>
          <div>
            <div style={s.title}>Animation Editor</div>
            <div style={s.subtitle}>Ferrero Rocher</div>
          </div>
        </div>

        {/* Navigation */}
        <nav style={s.nav}>
          {/* Editor Section */}
          <div style={s.section}>
            <div style={s.sectionTitle}>Editor</div>

            <button
              onClick={() => setPanel('stages')}
              style={{ ...s.navBtn, ...(panel === 'stages' ? s.navBtnActive : {}) }}
            >
              <Layers size={18} style={{ opacity: panel === 'stages' ? 1 : 0.5 }} />
              <span style={{ flex: 1 }}>Animation Stages</span>
              {panel === 'stages' && <ChevronRight size={14} style={{ opacity: 0.5 }} />}
            </button>

            <button
              onClick={() => setPanel('cards')}
              style={{ ...s.navBtn, ...(panel === 'cards' ? s.navBtnActive : {}) }}
            >
              <CreditCard size={18} style={{ opacity: panel === 'cards' ? 1 : 0.5 }} />
              <span style={{ flex: 1 }}>Info Cards</span>
              {panel === 'cards' && <ChevronRight size={14} style={{ opacity: 0.5 }} />}
            </button>
          </div>

          <div style={s.divider} />

          {/* Transform Section */}
          <div style={s.section}>
            <div style={s.sectionTitle}>Transform</div>

            <button
              onClick={() => setPanel('rotation')}
              style={{ ...s.navBtn, ...(panel === 'rotation' ? s.navBtnActive : {}) }}
            >
              <RotateCcw size={18} style={{ opacity: panel === 'rotation' ? 1 : 0.5 }} />
              <span style={{ flex: 1 }}>Rotation</span>
              {panel === 'rotation' && <ChevronRight size={14} style={{ opacity: 0.5 }} />}
            </button>

            <button
              onClick={() => setPanel('position')}
              style={{ ...s.navBtn, ...(panel === 'position' ? s.navBtnActive : {}) }}
            >
              <Move size={18} style={{ opacity: panel === 'position' ? 1 : 0.5 }} />
              <span style={{ flex: 1 }}>Position</span>
              {panel === 'position' && <ChevronRight size={14} style={{ opacity: 0.5 }} />}
            </button>

            <button
              onClick={() => setPanel('scale')}
              style={{ ...s.navBtn, ...(panel === 'scale' ? s.navBtnActive : {}) }}
            >
              <Maximize2 size={18} style={{ opacity: panel === 'scale' ? 1 : 0.5 }} />
              <span style={{ flex: 1 }}>Scale</span>
              {panel === 'scale' && <ChevronRight size={14} style={{ opacity: 0.5 }} />}
            </button>
          </div>

          <div style={s.divider} />

          {/* Active Stage Section */}
          <div style={s.section}>
            <div style={s.sectionTitle}>Active Stage</div>

            {stages.map((st, i) => (
              <button
                key={i}
                onClick={() => { setActiveStage(i); setScroll((st.scrollStart + st.scrollEnd) / 2) }}
                style={{ ...s.stageBtn, ...(activeStage === i ? s.stageBtnActive : {}) }}
              >
                <span>{st.name}</span>
                <span style={s.percent}>
                  {(st.scrollStart * 100).toFixed(0)}-{(st.scrollEnd * 100).toFixed(0)}%
                </span>
              </button>
            ))}
          </div>
        </nav>

        {/* Footer */}
        <div style={s.footer}>
          <a href="/" style={s.footerBtn}>
            <Home size={16} />
            <span>Back to Home</span>
          </a>
          <button onClick={handleExport} style={s.footerBtn}>
            <Download size={16} />
            <span>Export Config</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main style={s.main}>
        {/* Top Bar */}
        <header style={s.topbar}>
          <div style={s.controls}>
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              style={{ ...s.playBtn, ...(isPlaying ? s.playBtnActive : {}) }}
            >
              {isPlaying ? <Pause size={18} /> : <Play size={18} />}
            </button>
            <button onClick={() => setScroll(0)} style={s.resetBtn}>
              Reset
            </button>
          </div>

          <div style={s.timeline}>
            <input
              type="range"
              min={0}
              max={100}
              step={0.1}
              value={scroll * 100}
              onChange={(e) => setScroll(parseFloat(e.target.value) / 100)}
              style={s.rangeInput}
            />
            <div style={s.percentText}>{(scroll * 100).toFixed(0)}%</div>
          </div>

          <div style={s.stageBadge}>
            <Eye size={14} style={{ color: 'rgba(255,255,255,0.4)' }} />
            <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.8)', fontWeight: 500 }}>{current.name}</span>
          </div>
        </header>

        {/* Content Area */}
        <div style={s.content}>
          {/* Properties Panel */}
          <div style={s.properties}>
            {/* Stages Panel */}
            {panel === 'stages' && (
              <>
                <h2 style={s.panelTitle}>Animation Stages</h2>
                <p style={s.panelDesc}>
                  Configura le transizioni 3D per ogni sezione dello scroll.
                </p>

                <div style={s.card}>
                  <div style={s.cardTitle}>Quick Views</div>
                  <div style={s.quickViews}>
                    {[
                      { n: 'Front', r: [0, 0, 0] },
                      { n: 'Top', r: [-1.57, 0, 0] },
                      { n: 'Side', r: [0, 1.57, 0] },
                      { n: 'Back', r: [0, 3.14, 0] },
                    ].map(p => (
                      <button
                        key={p.n}
                        onClick={() => setStages(prev => prev.map((st, i) =>
                          i === activeStage ? { ...st, rotX: p.r[0], rotY: p.r[1], rotZ: p.r[2] } : st
                        ))}
                        style={s.quickBtn}
                      >
                        {p.n}
                      </button>
                    ))}
                  </div>
                </div>

                <div style={s.card}>
                  <div style={s.cardTitle}>Scroll Range</div>
                  <div style={s.sliderRow}>
                    <div style={s.sliderHeader}>
                      <label style={s.sliderLabel}>Start</label>
                      <input
                        type="number"
                        value={current.scrollStart.toFixed(2)}
                        onChange={(e) => update('scrollStart', parseFloat(e.target.value) || 0)}
                        step={0.01}
                        style={s.sliderInput}
                      />
                    </div>
                    <input
                      type="range"
                      min={0}
                      max={1}
                      step={0.01}
                      value={current.scrollStart}
                      onChange={(e) => update('scrollStart', parseFloat(e.target.value))}
                      style={s.slider}
                    />
                  </div>
                  <div style={{ ...s.sliderRow, marginBottom: 0 }}>
                    <div style={s.sliderHeader}>
                      <label style={s.sliderLabel}>End</label>
                      <input
                        type="number"
                        value={current.scrollEnd.toFixed(2)}
                        onChange={(e) => update('scrollEnd', parseFloat(e.target.value) || 0)}
                        step={0.01}
                        style={s.sliderInput}
                      />
                    </div>
                    <input
                      type="range"
                      min={0}
                      max={1}
                      step={0.01}
                      value={current.scrollEnd}
                      onChange={(e) => update('scrollEnd', parseFloat(e.target.value))}
                      style={s.slider}
                    />
                  </div>
                </div>
              </>
            )}

            {/* Rotation Panel */}
            {panel === 'rotation' && (
              <>
                <h2 style={s.panelTitle}>Rotation</h2>
                <p style={s.panelDesc}>
                  Controlla la rotazione del modello su ogni asse.
                </p>
                <div style={s.card}>
                  {['X', 'Y', 'Z'].map((axis, idx) => {
                    const key = `rot${axis}` as 'rotX' | 'rotY' | 'rotZ'
                    const max = axis === 'Y' ? 6.28 : 3.14
                    return (
                      <div key={axis} style={{ ...s.sliderRow, marginBottom: idx === 2 ? 0 : 20 }}>
                        <div style={s.sliderHeader}>
                          <label style={s.sliderLabel}>{axis} Axis</label>
                          <input
                            type="number"
                            value={current[key].toFixed(2)}
                            onChange={(e) => update(key, parseFloat(e.target.value) || 0)}
                            step={0.01}
                            style={s.sliderInput}
                          />
                        </div>
                        <input
                          type="range"
                          min={-max}
                          max={max}
                          step={0.01}
                          value={current[key]}
                          onChange={(e) => update(key, parseFloat(e.target.value))}
                          style={s.slider}
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
                <h2 style={s.panelTitle}>Position</h2>
                <p style={s.panelDesc}>
                  Sposta il modello nello spazio 3D.
                </p>
                <div style={s.card}>
                  {['X', 'Y', 'Z'].map((axis, idx) => {
                    const key = `pos${axis}` as 'posX' | 'posY' | 'posZ'
                    return (
                      <div key={axis} style={{ ...s.sliderRow, marginBottom: idx === 2 ? 0 : 20 }}>
                        <div style={s.sliderHeader}>
                          <label style={s.sliderLabel}>{axis} Axis</label>
                          <input
                            type="number"
                            value={current[key].toFixed(2)}
                            onChange={(e) => update(key, parseFloat(e.target.value) || 0)}
                            step={0.1}
                            style={s.sliderInput}
                          />
                        </div>
                        <input
                          type="range"
                          min={-5}
                          max={5}
                          step={0.1}
                          value={current[key]}
                          onChange={(e) => update(key, parseFloat(e.target.value))}
                          style={s.slider}
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
                <h2 style={s.panelTitle}>Scale</h2>
                <p style={s.panelDesc}>
                  Ridimensiona il modello uniformemente.
                </p>
                <div style={s.card}>
                  <div style={{ ...s.sliderRow, marginBottom: 0 }}>
                    <div style={s.sliderHeader}>
                      <label style={s.sliderLabel}>Size</label>
                      <input
                        type="number"
                        value={current.scale.toFixed(2)}
                        onChange={(e) => update('scale', parseFloat(e.target.value) || 0)}
                        step={0.1}
                        style={s.sliderInput}
                      />
                    </div>
                    <input
                      type="range"
                      min={0.5}
                      max={5}
                      step={0.1}
                      value={current.scale}
                      onChange={(e) => update('scale', parseFloat(e.target.value))}
                      style={s.slider}
                    />
                  </div>
                </div>
              </>
            )}

            {/* Cards Panel */}
            {panel === 'cards' && (
              <>
                <h2 style={s.panelTitle}>Info Cards</h2>
                <p style={s.panelDesc}>
                  Modifica i contenuti e i timing delle info card.
                </p>

                {cards.map((card, i) => (
                  <div key={card.id} style={s.cardEditor}>
                    <input
                      type="text"
                      value={card.title}
                      onChange={(e) => setCards(p => p.map((c, j) => j === i ? { ...c, title: e.target.value } : c))}
                      placeholder="Card Title"
                      style={s.cardEditorTitle}
                    />
                    <textarea
                      value={card.description}
                      onChange={(e) => setCards(p => p.map((c, j) => j === i ? { ...c, description: e.target.value } : c))}
                      placeholder="Description..."
                      style={s.cardEditorDesc}
                    />

                    <div style={s.positionBtns}>
                      <button
                        onClick={() => setCards(p => p.map((c, j) => j === i ? { ...c, position: 'left' } : c))}
                        style={{ ...s.positionBtn, ...(card.position === 'left' ? s.positionBtnActive : {}) }}
                      >
                        ← Left
                      </button>
                      <button
                        onClick={() => setCards(p => p.map((c, j) => j === i ? { ...c, position: 'right' } : c))}
                        style={{ ...s.positionBtn, ...(card.position === 'right' ? s.positionBtnActive : {}) }}
                      >
                        Right →
                      </button>
                    </div>

                    <div style={s.cardDivider}>
                      <div style={s.sliderRow}>
                        <div style={s.sliderHeader}>
                          <label style={s.sliderLabel}>Fade In</label>
                          <input
                            type="number"
                            value={card.startScroll.toFixed(2)}
                            onChange={(e) => setCards(p => p.map((c, j) => j === i ? { ...c, startScroll: parseFloat(e.target.value) || 0 } : c))}
                            step={0.01}
                            style={s.sliderInput}
                          />
                        </div>
                        <input
                          type="range"
                          min={0}
                          max={1}
                          step={0.01}
                          value={card.startScroll}
                          onChange={(e) => setCards(p => p.map((c, j) => j === i ? { ...c, startScroll: parseFloat(e.target.value) } : c))}
                          style={s.slider}
                        />
                      </div>
                      <div style={{ ...s.sliderRow, marginBottom: 0 }}>
                        <div style={s.sliderHeader}>
                          <label style={s.sliderLabel}>Fade Out</label>
                          <input
                            type="number"
                            value={card.endScroll.toFixed(2)}
                            onChange={(e) => setCards(p => p.map((c, j) => j === i ? { ...c, endScroll: parseFloat(e.target.value) || 0 } : c))}
                            step={0.01}
                            style={s.sliderInput}
                          />
                        </div>
                        <input
                          type="range"
                          min={0}
                          max={1}
                          step={0.01}
                          value={card.endScroll}
                          onChange={(e) => setCards(p => p.map((c, j) => j === i ? { ...c, endScroll: parseFloat(e.target.value) } : c))}
                          style={s.slider}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </>
            )}
          </div>

          {/* 3D Viewport */}
          <div style={s.viewport}>
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
              <div style={{ ...s.introOverlay, opacity: Math.max(0, 1 - scroll * 7) }}>
                <div style={{ textAlign: 'center' }}>
                  <span style={s.tagline}>L'arte del cioccolato</span>
                  <h1 style={s.h1}>
                    <span style={s.brand}>FERRERO</span>
                    <span style={s.product}>ROCHER</span>
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
                    ...s.infoCard,
                    ...(card.position === 'left' ? { left: 40 } : { right: 40 }),
                    opacity,
                  }}
                >
                  <div style={s.infoCardInner}>
                    <div style={s.accent} />
                    <h3 style={s.infoH3}>{card.title}</h3>
                    <p style={s.infoP}>{card.description}</p>
                  </div>
                </div>
              )
            })}

            {/* Viewport Info */}
            <div style={s.viewportInfo}>
              <Settings size={12} />
              <span>Scroll to orbit • Drag to rotate</span>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

useGLTF.preload('/models/ferrero.glb')
