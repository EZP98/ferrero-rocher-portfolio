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
  Eye,
  Sparkles
} from 'lucide-react'

// ReactBits-inspired design system
const colors = {
  bg: '#09090b',
  bgCard: '#0f0f11',
  bgHover: '#18181b',
  bgActive: 'rgba(139, 92, 246, 0.1)',
  border: 'rgba(255, 255, 255, 0.06)',
  borderHover: 'rgba(255, 255, 255, 0.1)',
  borderActive: 'rgba(139, 92, 246, 0.3)',
  text: '#fafafa',
  textMuted: 'rgba(255, 255, 255, 0.5)',
  textDim: 'rgba(255, 255, 255, 0.3)',
  accent: '#8b5cf6', // Purple glow
  accentLight: '#a78bfa',
  gold: '#f59e0b',
  glow: '0 0 20px rgba(139, 92, 246, 0.15)',
  glowStrong: '0 0 30px rgba(139, 92, 246, 0.25)',
}

// Inline styles
const s = {
  page: {
    height: '100vh',
    backgroundColor: colors.bg,
    display: 'flex',
    overflow: 'hidden',
    fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
  } as CSSProperties,

  sidebar: {
    width: '260px',
    minWidth: '260px',
    backgroundColor: colors.bgCard,
    borderRight: `1px solid ${colors.border}`,
    display: 'flex',
    flexDirection: 'column',
    boxSizing: 'border-box',
  } as CSSProperties,

  sidebarHeader: {
    padding: '24px 20px',
    borderBottom: `1px solid ${colors.border}`,
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  } as CSSProperties,

  logo: {
    width: '40px',
    height: '40px',
    borderRadius: '10px',
    background: `linear-gradient(135deg, ${colors.accent} 0%, #7c3aed 100%)`,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: colors.glow,
    flexShrink: 0,
  } as CSSProperties,

  logoText: {
    color: '#fff',
    fontWeight: 700,
    fontSize: '16px',
  } as CSSProperties,

  title: {
    fontSize: '15px',
    fontWeight: 600,
    color: colors.text,
    margin: 0,
    letterSpacing: '-0.01em',
  } as CSSProperties,

  subtitle: {
    fontSize: '12px',
    color: colors.textMuted,
    marginTop: '2px',
  } as CSSProperties,

  nav: {
    flex: 1,
    padding: '12px',
    overflowY: 'auto',
    boxSizing: 'border-box',
  } as CSSProperties,

  section: {
    marginBottom: '8px',
  } as CSSProperties,

  sectionTitle: {
    fontSize: '11px',
    color: colors.textDim,
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    fontWeight: 500,
    padding: '8px 12px 8px',
    margin: 0,
  } as CSSProperties,

  navBtn: {
    width: '100%',
    boxSizing: 'border-box',
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '10px 12px',
    borderRadius: '8px',
    border: 'none',
    background: 'transparent',
    color: colors.textMuted,
    fontSize: '13px',
    fontWeight: 500,
    cursor: 'pointer',
    textAlign: 'left',
    marginBottom: '2px',
    transition: 'all 0.15s ease',
  } as CSSProperties,

  navBtnActive: {
    background: colors.bgActive,
    color: colors.accent,
  } as CSSProperties,

  stageBtn: {
    width: '100%',
    boxSizing: 'border-box',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '10px 12px',
    borderRadius: '8px',
    border: `1px solid transparent`,
    background: 'transparent',
    color: colors.textMuted,
    fontSize: '13px',
    fontWeight: 500,
    cursor: 'pointer',
    textAlign: 'left',
    marginBottom: '2px',
    transition: 'all 0.15s ease',
  } as CSSProperties,

  stageBtnActive: {
    background: colors.bgActive,
    borderColor: colors.borderActive,
    color: colors.accent,
    boxShadow: colors.glow,
  } as CSSProperties,

  percent: {
    fontSize: '11px',
    opacity: 0.6,
    fontFamily: 'JetBrains Mono, monospace',
  } as CSSProperties,

  divider: {
    height: '1px',
    background: colors.border,
    margin: '12px',
  } as CSSProperties,

  footer: {
    padding: '12px',
    borderTop: `1px solid ${colors.border}`,
  } as CSSProperties,

  footerBtn: {
    width: '100%',
    boxSizing: 'border-box',
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '10px 12px',
    borderRadius: '8px',
    border: 'none',
    background: 'transparent',
    color: colors.textMuted,
    fontSize: '13px',
    cursor: 'pointer',
    textAlign: 'left',
    textDecoration: 'none',
    marginBottom: '2px',
    transition: 'all 0.15s ease',
  } as CSSProperties,

  main: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    backgroundColor: colors.bg,
  } as CSSProperties,

  topbar: {
    height: '56px',
    backgroundColor: colors.bgCard,
    borderBottom: `1px solid ${colors.border}`,
    display: 'flex',
    alignItems: 'center',
    padding: '0 20px',
    gap: '16px',
  } as CSSProperties,

  controls: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  } as CSSProperties,

  playBtn: {
    width: '40px',
    height: '40px',
    borderRadius: '10px',
    border: `1px solid ${colors.border}`,
    background: colors.bgCard,
    color: colors.textMuted,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    transition: 'all 0.15s ease',
  } as CSSProperties,

  playBtnActive: {
    background: colors.accent,
    borderColor: colors.accent,
    color: '#fff',
    boxShadow: colors.glowStrong,
  } as CSSProperties,

  timeline: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  } as CSSProperties,

  rangeInput: {
    flex: 1,
    height: '4px',
    borderRadius: '2px',
    WebkitAppearance: 'none',
    appearance: 'none',
    background: `linear-gradient(90deg, ${colors.accent} 0%, rgba(255,255,255,0.1) 0%)`,
    cursor: 'pointer',
  } as CSSProperties,

  percentText: {
    fontSize: '13px',
    fontFamily: 'JetBrains Mono, monospace',
    color: colors.accent,
    fontWeight: 500,
    minWidth: '40px',
    textAlign: 'right',
  } as CSSProperties,

  stageBadge: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '8px 14px',
    borderRadius: '8px',
    background: colors.bgHover,
    border: `1px solid ${colors.border}`,
  } as CSSProperties,

  content: {
    flex: 1,
    display: 'flex',
    overflow: 'hidden',
  } as CSSProperties,

  properties: {
    width: '320px',
    backgroundColor: colors.bgCard,
    borderRight: `1px solid ${colors.border}`,
    overflowY: 'auto',
    padding: '20px',
    boxSizing: 'border-box',
  } as CSSProperties,

  panelTitle: {
    fontSize: '16px',
    fontWeight: 600,
    color: colors.text,
    margin: '0 0 4px 0',
    letterSpacing: '-0.01em',
  } as CSSProperties,

  panelDesc: {
    fontSize: '13px',
    color: colors.textMuted,
    lineHeight: 1.5,
    margin: '0 0 20px 0',
  } as CSSProperties,

  card: {
    padding: '16px',
    borderRadius: '12px',
    background: colors.bg,
    border: `1px solid ${colors.border}`,
    marginBottom: '16px',
  } as CSSProperties,

  cardTitle: {
    fontSize: '11px',
    color: colors.textDim,
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    fontWeight: 500,
    margin: '0 0 12px 0',
  } as CSSProperties,

  quickViews: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '8px',
  } as CSSProperties,

  quickBtn: {
    padding: '10px 14px',
    borderRadius: '8px',
    border: `1px solid ${colors.border}`,
    background: 'transparent',
    color: colors.textMuted,
    fontSize: '12px',
    fontWeight: 500,
    cursor: 'pointer',
    transition: 'all 0.15s ease',
  } as CSSProperties,

  sliderRow: {
    marginBottom: '16px',
  } as CSSProperties,

  sliderHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '8px',
  } as CSSProperties,

  sliderLabel: {
    fontSize: '12px',
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: '0.03em',
    fontWeight: 500,
  } as CSSProperties,

  sliderInput: {
    width: '60px',
    padding: '6px 8px',
    borderRadius: '6px',
    border: `1px solid ${colors.border}`,
    background: colors.bg,
    color: colors.text,
    fontSize: '12px',
    fontFamily: 'JetBrains Mono, monospace',
    textAlign: 'center',
    outline: 'none',
  } as CSSProperties,

  slider: {
    width: '100%',
    height: '4px',
    borderRadius: '2px',
    WebkitAppearance: 'none',
    appearance: 'none',
    background: 'rgba(255,255,255,0.1)',
    cursor: 'pointer',
  } as CSSProperties,

  cardEditor: {
    padding: '16px',
    borderRadius: '12px',
    background: colors.bg,
    border: `1px solid ${colors.border}`,
    marginBottom: '12px',
  } as CSSProperties,

  cardEditorTitle: {
    width: '100%',
    padding: 0,
    marginBottom: '12px',
    border: 'none',
    background: 'transparent',
    color: colors.text,
    fontSize: '14px',
    fontWeight: 600,
    outline: 'none',
  } as CSSProperties,

  cardEditorDesc: {
    width: '100%',
    boxSizing: 'border-box',
    padding: '10px 12px',
    marginBottom: '12px',
    borderRadius: '8px',
    border: `1px solid ${colors.border}`,
    background: 'transparent',
    color: colors.textMuted,
    fontSize: '13px',
    resize: 'none',
    height: '70px',
    outline: 'none',
    fontFamily: 'inherit',
  } as CSSProperties,

  positionBtns: {
    display: 'flex',
    gap: '8px',
    marginBottom: '16px',
  } as CSSProperties,

  positionBtn: {
    flex: 1,
    padding: '10px 12px',
    borderRadius: '8px',
    border: `1px solid ${colors.border}`,
    background: 'transparent',
    color: colors.textMuted,
    fontSize: '12px',
    fontWeight: 500,
    cursor: 'pointer',
    transition: 'all 0.15s ease',
  } as CSSProperties,

  positionBtnActive: {
    background: colors.bgActive,
    borderColor: colors.borderActive,
    color: colors.accent,
  } as CSSProperties,

  cardDivider: {
    borderTop: `1px solid ${colors.border}`,
    paddingTop: '16px',
    marginTop: '4px',
  } as CSSProperties,

  viewport: {
    flex: 1,
    position: 'relative',
    backgroundColor: colors.bg,
  } as CSSProperties,

  viewportInfo: {
    position: 'absolute',
    bottom: '16px',
    left: '16px',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '8px 12px',
    borderRadius: '8px',
    backgroundColor: 'rgba(15, 15, 17, 0.9)',
    backdropFilter: 'blur(8px)',
    border: `1px solid ${colors.border}`,
    color: colors.textDim,
    fontSize: '11px',
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
    color: 'rgba(139, 92, 246, 0.6)',
    textTransform: 'uppercase',
    letterSpacing: '4px',
    fontSize: '11px',
    marginBottom: '12px',
  } as CSSProperties,

  h1: {
    fontSize: '40px',
    fontWeight: 300,
    letterSpacing: '2px',
    margin: 0,
  } as CSSProperties,

  brand: {
    display: 'block',
    color: '#fff',
  } as CSSProperties,

  product: {
    display: 'block',
    color: colors.gold,
    marginTop: '4px',
  } as CSSProperties,

  infoCard: {
    position: 'absolute',
    top: '50%',
    transform: 'translateY(-50%)',
  } as CSSProperties,

  infoCardInner: {
    backdropFilter: 'blur(20px)',
    backgroundColor: 'rgba(15, 15, 17, 0.8)',
    border: `1px solid ${colors.border}`,
    borderRadius: '16px',
    padding: '24px',
    maxWidth: '260px',
    boxShadow: '0 20px 40px rgba(0,0,0,0.4)',
  } as CSSProperties,

  accent: {
    width: '40px',
    height: '3px',
    background: `linear-gradient(90deg, ${colors.accent}, ${colors.accentLight})`,
    borderRadius: '2px',
    marginBottom: '16px',
  } as CSSProperties,

  infoH3: {
    fontSize: '18px',
    fontWeight: 600,
    color: colors.text,
    margin: '0 0 8px 0',
    letterSpacing: '-0.01em',
  } as CSSProperties,

  infoP: {
    fontSize: '13px',
    color: colors.textMuted,
    lineHeight: 1.5,
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
    alert('Config copied!')
  }

  return (
    <div style={s.page}>
      {/* Sidebar */}
      <aside style={s.sidebar}>
        <div style={s.sidebarHeader}>
          <div style={s.logo}>
            <Sparkles size={18} color="#fff" />
          </div>
          <div>
            <div style={s.title}>Animation Editor</div>
            <div style={s.subtitle}>Ferrero Rocher</div>
          </div>
        </div>

        <nav style={s.nav}>
          <div style={s.section}>
            <div style={s.sectionTitle}>Editor</div>
            <button
              onClick={() => setPanel('stages')}
              style={{ ...s.navBtn, ...(panel === 'stages' ? s.navBtnActive : {}) }}
            >
              <Layers size={16} />
              <span style={{ flex: 1 }}>Animation Stages</span>
              {panel === 'stages' && <ChevronRight size={14} style={{ opacity: 0.5 }} />}
            </button>
            <button
              onClick={() => setPanel('cards')}
              style={{ ...s.navBtn, ...(panel === 'cards' ? s.navBtnActive : {}) }}
            >
              <CreditCard size={16} />
              <span style={{ flex: 1 }}>Info Cards</span>
              {panel === 'cards' && <ChevronRight size={14} style={{ opacity: 0.5 }} />}
            </button>
          </div>

          <div style={s.divider} />

          <div style={s.section}>
            <div style={s.sectionTitle}>Transform</div>
            <button
              onClick={() => setPanel('rotation')}
              style={{ ...s.navBtn, ...(panel === 'rotation' ? s.navBtnActive : {}) }}
            >
              <RotateCcw size={16} />
              <span style={{ flex: 1 }}>Rotation</span>
            </button>
            <button
              onClick={() => setPanel('position')}
              style={{ ...s.navBtn, ...(panel === 'position' ? s.navBtnActive : {}) }}
            >
              <Move size={16} />
              <span style={{ flex: 1 }}>Position</span>
            </button>
            <button
              onClick={() => setPanel('scale')}
              style={{ ...s.navBtn, ...(panel === 'scale' ? s.navBtnActive : {}) }}
            >
              <Maximize2 size={16} />
              <span style={{ flex: 1 }}>Scale</span>
            </button>
          </div>

          <div style={s.divider} />

          <div style={s.section}>
            <div style={s.sectionTitle}>Stages</div>
            {stages.map((st, i) => (
              <button
                key={i}
                onClick={() => { setActiveStage(i); setScroll((st.scrollStart + st.scrollEnd) / 2) }}
                style={{ ...s.stageBtn, ...(activeStage === i ? s.stageBtnActive : {}) }}
              >
                <span>{st.name}</span>
                <span style={s.percent}>
                  {(st.scrollStart * 100).toFixed(0)}–{(st.scrollEnd * 100).toFixed(0)}%
                </span>
              </button>
            ))}
          </div>
        </nav>

        <div style={s.footer}>
          <a href="/" style={s.footerBtn}>
            <Home size={16} />
            <span>Home</span>
          </a>
          <button onClick={handleExport} style={s.footerBtn}>
            <Download size={16} />
            <span>Export</span>
          </button>
        </div>
      </aside>

      {/* Main */}
      <main style={s.main}>
        <header style={s.topbar}>
          <div style={s.controls}>
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              style={{ ...s.playBtn, ...(isPlaying ? s.playBtnActive : {}) }}
            >
              {isPlaying ? <Pause size={16} /> : <Play size={16} />}
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
              style={{ ...s.rangeInput, background: `linear-gradient(90deg, ${colors.accent} ${scroll * 100}%, rgba(255,255,255,0.1) ${scroll * 100}%)` }}
            />
            <div style={s.percentText}>{(scroll * 100).toFixed(0)}%</div>
          </div>

          <div style={s.stageBadge}>
            <Eye size={14} style={{ color: colors.textDim }} />
            <span style={{ fontSize: '12px', color: colors.text, fontWeight: 500 }}>{current.name}</span>
          </div>
        </header>

        <div style={s.content}>
          <div style={s.properties}>
            {panel === 'stages' && (
              <>
                <h2 style={s.panelTitle}>Animation Stages</h2>
                <p style={s.panelDesc}>Configure 3D transitions for each scroll section.</p>

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

            {panel === 'rotation' && (
              <>
                <h2 style={s.panelTitle}>Rotation</h2>
                <p style={s.panelDesc}>Control model rotation on each axis.</p>
                <div style={s.card}>
                  {['X', 'Y', 'Z'].map((axis, idx) => {
                    const key = `rot${axis}` as 'rotX' | 'rotY' | 'rotZ'
                    const max = axis === 'Y' ? 6.28 : 3.14
                    return (
                      <div key={axis} style={{ ...s.sliderRow, marginBottom: idx === 2 ? 0 : 16 }}>
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

            {panel === 'position' && (
              <>
                <h2 style={s.panelTitle}>Position</h2>
                <p style={s.panelDesc}>Move the model in 3D space.</p>
                <div style={s.card}>
                  {['X', 'Y', 'Z'].map((axis, idx) => {
                    const key = `pos${axis}` as 'posX' | 'posY' | 'posZ'
                    return (
                      <div key={axis} style={{ ...s.sliderRow, marginBottom: idx === 2 ? 0 : 16 }}>
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

            {panel === 'scale' && (
              <>
                <h2 style={s.panelTitle}>Scale</h2>
                <p style={s.panelDesc}>Resize the model uniformly.</p>
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

            {panel === 'cards' && (
              <>
                <h2 style={s.panelTitle}>Info Cards</h2>
                <p style={s.panelDesc}>Edit card content and timing.</p>

                {cards.map((card, i) => (
                  <div key={card.id} style={s.cardEditor}>
                    <input
                      type="text"
                      value={card.title}
                      onChange={(e) => setCards(p => p.map((c, j) => j === i ? { ...c, title: e.target.value } : c))}
                      placeholder="Title"
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

            <div style={s.viewportInfo}>
              <Settings size={12} />
              <span>Drag to rotate • Scroll to zoom</span>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

useGLTF.preload('/models/ferrero.glb')
