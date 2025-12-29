import { useState, useRef, CSSProperties, useEffect, useCallback } from 'react'
import { Play, Pause, Home, RefreshCw, ChevronDown, Box, Type, Layers, Sun, Camera, Sparkles, Image, Palette, Plus, Trash2, Diamond, Zap, Download } from 'lucide-react'

// Colors - Dark theme like Figma
const c = {
  bg: '#1e1e1e',
  panel: '#252526',
  card: '#2d2d2d',
  border: 'rgba(255,255,255,0.08)',
  text: '#ffffff',
  muted: 'rgba(255,255,255,0.5)',
  dim: 'rgba(255,255,255,0.3)',
  accent: '#0d99ff',
  gold: '#d4a853',
  red: '#f24822',
  green: '#14ae5c',
  purple: '#9747ff',
  yellow: '#ffb800',
}

// Component types
type ComponentId = 'ferrero' | 'title' | 'cards' | 'lighting' | 'effects' | 'camera' | 'particles' | 'background'

interface LayerItem {
  id: ComponentId
  name: string
  icon: typeof Box
  color: string
}

const layers: LayerItem[] = [
  { id: 'ferrero', name: 'Ferrero 3D', icon: Box, color: c.gold },
  { id: 'title', name: 'Title', icon: Type, color: c.accent },
  { id: 'cards', name: 'Info Cards', icon: Layers, color: c.green },
  { id: 'lighting', name: 'Lighting', icon: Sun, color: c.yellow },
  { id: 'camera', name: 'Camera', icon: Camera, color: c.purple },
  { id: 'effects', name: 'Post FX', icon: Sparkles, color: c.red },
  { id: 'particles', name: 'Particles', icon: Sparkles, color: '#ff6b9d' },
  { id: 'background', name: 'Background', icon: Image, color: '#6366f1' },
]

// Keyframe type
interface Keyframe {
  id: string
  scroll: number
  values: Record<string, unknown>
}

interface KeyframeTrack {
  ferrero: Keyframe[]
  title: Keyframe[]
  cards: Keyframe[]
  lighting: Keyframe[]
}

// Animation presets
const presets = [
  { name: 'Hero Start', scroll: 0.05 },
  { name: 'La Copertura', scroll: 0.22 },
  { name: 'Il Cuore', scroll: 0.37 },
  { name: "L'Eleganza", scroll: 0.52 },
  { name: 'Transition', scroll: 0.70 },
  { name: 'End', scroll: 0.98 },
]

// Quick effect presets
const quickEffects = [
  { name: 'Spin', icon: '🔄', action: 'autoRotate' },
  { name: 'Float', icon: '🎈', action: 'float' },
  { name: 'Glow', icon: '✨', action: 'glow' },
  { name: 'Bloom', icon: '🌟', action: 'bloom' },
]

export function AnimationConsole() {
  const [scroll, setScroll] = useState(0)
  const [playing, setPlaying] = useState(false)
  const [speed, setSpeed] = useState(0.00015)
  const [showPresets, setShowPresets] = useState(false)
  const [selectedComponent, setSelectedComponent] = useState<ComponentId>('ferrero')
  const [showKeyframes, setShowKeyframes] = useState(false)
  const [selectedKeyframe, setSelectedKeyframe] = useState<string | null>(null)
  const [leftPanelTab, setLeftPanelTab] = useState<'structure' | 'live'>('structure')

  // Component states
  const [ferreroState, setFerreroState] = useState({
    enabled: false,
    rotX: 0, rotY: 0, rotZ: 0,
    posX: 0, posY: 0, posZ: 0,
    scale: 2.2,
    autoRotate: false,
    autoRotateSpeed: 1,
    floatEnabled: false,
    floatAmplitude: 0.2,
    floatSpeed: 1,
    metalness: 0.8,
    roughness: 0.2,
    emissiveIntensity: 0,
    emissiveColor: '#d4a853',
    wireframe: false,
  })

  const [titleState, setTitleState] = useState({
    enabled: false,
    opacity: 1,
    titleText: 'FERRERO ROCHER',
    subtitleText: "L'arte del cioccolato",
    glowEnabled: false,
    glowColor: '#d4a853',
    glowIntensity: 10,
    animationType: 'none' as 'none' | 'pulse' | 'wave' | 'typewriter',
  })

  const [cardsState, setCardsState] = useState({
    enabled: false,
    globalOpacity: 1,
    accentColor: '#d4a853',
    padding: 28,
    borderRadius: 20,
    blur: 20,
    glowEnabled: false,
    animateIn: 'fade' as 'fade' | 'slide' | 'scale' | 'flip',
  })

  const [lightingState, setLightingState] = useState({
    enabled: false,
    ambientIntensity: 0.15,
    mainSpotIntensity: 3,
    mainSpotColor: '#FFFFFF',
    rimLightIntensity: 2,
    rimLightColor: '#D4A853',
    fillLightIntensity: 1.5,
    fillLightColor: '#E8C878',
  })

  const [effectsState, setEffectsState] = useState({
    enabled: false,
    bloomEnabled: false,
    bloomIntensity: 1,
    bloomThreshold: 0.8,
    vignetteEnabled: false,
    vignetteIntensity: 0.5,
    chromaticEnabled: false,
    chromaticOffset: 0.002,
    noiseEnabled: false,
    noiseIntensity: 0.1,
  })

  const [cameraState, setCameraState] = useState({
    enabled: false,
    fov: 35,
    positionX: 0,
    positionY: 0,
    positionZ: 10,
    autoOrbit: false,
    orbitSpeed: 0.5,
  })

  const [particlesState, setParticlesState] = useState({
    enabled: false,
    count: 100,
    size: 0.02,
    color: '#d4a853',
    speed: 0.5,
    opacity: 0.6,
    type: 'sparkles' as 'dots' | 'sparkles' | 'snow' | 'stars',
  })

  const [backgroundState, setBackgroundState] = useState({
    enabled: false,
    color: '#0A0A0A',
    gradientEnabled: false,
    gradientTop: '#1a1a2e',
    gradientBottom: '#0a0a0a',
    starsEnabled: false,
  })

  // Keyframes
  const [keyframes, setKeyframes] = useState<KeyframeTrack>({
    ferrero: [],
    title: [],
    cards: [],
    lighting: [],
  })

  // Live data from iframe
  const [liveData, setLiveData] = useState<{
    rotX: number, rotY: number, rotZ: number,
    posX: number, posY: number, posZ: number,
    scale: number, scrollProgress: number, activeCard: string | null
  } | null>(null)

  // Code structure from iframe
  const [codeStructure, setCodeStructure] = useState<{
    sections: { id: string; name: string; file: string; scrollRange: string }[]
    cards: { id: number; title: string; startScroll: number; endScroll: number }[]
  } | null>(null)

  const timelineRef = useRef<HTMLDivElement>(null)
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const [iframeReady, setIframeReady] = useState(false)

  // Listen for messages from iframe
  useEffect(() => {
    const handler = (event: MessageEvent) => {
      if (event.data?.type === 'FERRERO_STATE') {
        setLiveData(event.data.state)
      }
      if (event.data?.type === 'CODE_STRUCTURE') {
        setCodeStructure(event.data.data)
      }
      if (event.data?.type === 'COMPONENT_SELECTED') {
        const componentId = event.data.componentId as ComponentId
        if (layers.find(l => l.id === componentId)) {
          setSelectedComponent(componentId)
        }
      }
    }
    window.addEventListener('message', handler)
    return () => window.removeEventListener('message', handler)
  }, [])

  // Send debug update to iframe
  const sendDebugUpdate = useCallback((component: string, values: Record<string, unknown>) => {
    if (!iframeRef.current?.contentWindow) return
    iframeRef.current.contentWindow.postMessage({
      type: 'DEBUG_UPDATE',
      component,
      values
    }, '*')
  }, [])

  // Sync states to iframe
  useEffect(() => { sendDebugUpdate('ferrero', ferreroState) }, [ferreroState, sendDebugUpdate])
  useEffect(() => { sendDebugUpdate('title', titleState) }, [titleState, sendDebugUpdate])
  useEffect(() => { sendDebugUpdate('cards', cardsState) }, [cardsState, sendDebugUpdate])
  useEffect(() => { sendDebugUpdate('lighting', lightingState) }, [lightingState, sendDebugUpdate])
  useEffect(() => { sendDebugUpdate('postProcessing', effectsState) }, [effectsState, sendDebugUpdate])
  useEffect(() => { sendDebugUpdate('camera', cameraState) }, [cameraState, sendDebugUpdate])
  useEffect(() => { sendDebugUpdate('particles', particlesState) }, [particlesState, sendDebugUpdate])
  useEffect(() => { sendDebugUpdate('background', backgroundState) }, [backgroundState, sendDebugUpdate])

  // Sync scroll to iframe
  const syncScrollToIframe = useCallback((scrollValue: number) => {
    if (!iframeRef.current?.contentWindow?.document) return
    const doc = iframeRef.current.contentWindow.document
    const maxScroll = doc.documentElement.scrollHeight - iframeRef.current.contentWindow.innerHeight
    iframeRef.current.contentWindow.scrollTo(0, scrollValue * maxScroll)
  }, [])

  useEffect(() => {
    if (iframeReady) syncScrollToIframe(scroll)
  }, [scroll, iframeReady, syncScrollToIframe])

  // Play animation
  useEffect(() => {
    if (!playing) return
    const i = setInterval(() => setScroll(p => p >= 1 ? (setPlaying(false), 0) : p + speed), 16)
    return () => clearInterval(i)
  }, [playing, speed])

  // Timeline interaction
  const handleTimeline = (e: React.MouseEvent) => {
    if (!timelineRef.current) return
    const rect = timelineRef.current.getBoundingClientRect()
    setScroll(Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width)))
  }

  // Keyframe functions
  const addKeyframe = useCallback((track: keyof KeyframeTrack) => {
    const id = `${track}-${Date.now()}`
    let values: Record<string, unknown> = {}
    if (track === 'ferrero') values = { ...ferreroState }
    else if (track === 'title') values = { ...titleState }
    else if (track === 'cards') values = { ...cardsState }
    else if (track === 'lighting') values = { ...lightingState }

    setKeyframes(prev => ({
      ...prev,
      [track]: [...prev[track], { id, scroll, values }].sort((a, b) => a.scroll - b.scroll)
    }))
  }, [scroll, ferreroState, titleState, cardsState, lightingState])

  const removeKeyframe = useCallback((track: keyof KeyframeTrack, id: string) => {
    setKeyframes(prev => ({
      ...prev,
      [track]: prev[track].filter(k => k.id !== id)
    }))
    if (selectedKeyframe === id) setSelectedKeyframe(null)
  }, [selectedKeyframe])

  // Quick effects
  const applyQuickEffect = (action: string) => {
    switch (action) {
      case 'autoRotate':
        setFerreroState(p => ({ ...p, enabled: true, autoRotate: !p.autoRotate, autoRotateSpeed: 1.5 }))
        break
      case 'float':
        setFerreroState(p => ({ ...p, enabled: true, floatEnabled: !p.floatEnabled, floatAmplitude: 0.3 }))
        break
      case 'glow':
        setTitleState(p => ({ ...p, enabled: true, glowEnabled: !p.glowEnabled, glowIntensity: 15 }))
        break
      case 'bloom':
        setEffectsState(p => ({ ...p, enabled: true, bloomEnabled: !p.bloomEnabled, bloomIntensity: 1.5 }))
        break
    }
  }

  // Export state
  const handleExport = () => {
    const data = {
      scroll,
      ferreroState,
      titleState,
      cardsState,
      lightingState,
      effectsState,
      cameraState,
      particlesState,
      backgroundState,
      keyframes,
      timestamp: new Date().toISOString(),
    }
    navigator.clipboard.writeText(JSON.stringify(data, null, 2))
    alert('State copied to clipboard!')
  }

  // Reset all
  const resetAll = () => {
    setFerreroState({ enabled: false, rotX: 0, rotY: 0, rotZ: 0, posX: 0, posY: 0, posZ: 0, scale: 2.2, autoRotate: false, autoRotateSpeed: 1, floatEnabled: false, floatAmplitude: 0.2, floatSpeed: 1, metalness: 0.8, roughness: 0.2, emissiveIntensity: 0, emissiveColor: '#d4a853', wireframe: false })
    setTitleState({ enabled: false, opacity: 1, titleText: 'FERRERO ROCHER', subtitleText: "L'arte del cioccolato", glowEnabled: false, glowColor: '#d4a853', glowIntensity: 10, animationType: 'none' })
    setCardsState({ enabled: false, globalOpacity: 1, accentColor: '#d4a853', padding: 28, borderRadius: 20, blur: 20, glowEnabled: false, animateIn: 'fade' })
    setLightingState({ enabled: false, ambientIntensity: 0.15, mainSpotIntensity: 3, mainSpotColor: '#FFFFFF', rimLightIntensity: 2, rimLightColor: '#D4A853', fillLightIntensity: 1.5, fillLightColor: '#E8C878' })
    setEffectsState({ enabled: false, bloomEnabled: false, bloomIntensity: 1, bloomThreshold: 0.8, vignetteEnabled: false, vignetteIntensity: 0.5, chromaticEnabled: false, chromaticOffset: 0.002, noiseEnabled: false, noiseIntensity: 0.1 })
    setCameraState({ enabled: false, fov: 35, positionX: 0, positionY: 0, positionZ: 10, autoOrbit: false, orbitSpeed: 0.5 })
    setParticlesState({ enabled: false, count: 100, size: 0.02, color: '#d4a853', speed: 0.5, opacity: 0.6, type: 'sparkles' })
    setBackgroundState({ enabled: false, color: '#0A0A0A', gradientEnabled: false, gradientTop: '#1a1a2e', gradientBottom: '#0a0a0a', starsEnabled: false })
  }

  // Components
  const SliderRow = ({ label, value, onChange, min, max, step = 0.1 }: {
    label: string, value: number, onChange: (v: number) => void, min: number, max: number, step?: number
  }) => (
    <div style={styles.propRow}>
      <span style={styles.propLabel}>{label}</span>
      <input type="range" min={min} max={max} step={step} value={value}
        onChange={e => onChange(parseFloat(e.target.value))} style={styles.slider} />
      <span style={styles.propValue}>{value.toFixed(step >= 1 ? 0 : step >= 0.1 ? 1 : 2)}</span>
    </div>
  )

  const ToggleRow = ({ label, value, onChange }: {
    label: string, value: boolean, onChange: (v: boolean) => void
  }) => (
    <div style={styles.propRow}>
      <span style={styles.propLabel}>{label}</span>
      <button style={{ ...styles.toggle, backgroundColor: value ? c.accent : c.card }} onClick={() => onChange(!value)}>
        {value ? 'ON' : 'OFF'}
      </button>
    </div>
  )

  const ColorRow = ({ label, value, onChange }: {
    label: string, value: string, onChange: (v: string) => void
  }) => (
    <div style={styles.propRow}>
      <span style={styles.propLabel}>{label}</span>
      <input type="color" value={value} onChange={e => onChange(e.target.value)} style={styles.colorInput} />
      <span style={styles.propValue}>{value}</span>
    </div>
  )

  const PropertySection = ({ title, children, color }: { title: string, children: React.ReactNode, color?: string }) => (
    <div style={styles.propertySection}>
      <div style={{ ...styles.sectionHeader, color: color || c.muted }}>{title}</div>
      <div style={styles.sectionContent}>{children}</div>
    </div>
  )

  // Render properties
  const renderProperties = () => {
    switch (selectedComponent) {
      case 'ferrero':
        return (
          <>
            <ToggleRow label="Override" value={ferreroState.enabled} onChange={v => setFerreroState(p => ({ ...p, enabled: v }))} />
            <PropertySection title="Transform" color={c.gold}>
              <SliderRow label="Rot X" value={ferreroState.rotX} onChange={v => setFerreroState(p => ({ ...p, rotX: v, enabled: true }))} min={-Math.PI} max={Math.PI} step={0.1} />
              <SliderRow label="Rot Y" value={ferreroState.rotY} onChange={v => setFerreroState(p => ({ ...p, rotY: v, enabled: true }))} min={-Math.PI} max={Math.PI} step={0.1} />
              <SliderRow label="Rot Z" value={ferreroState.rotZ} onChange={v => setFerreroState(p => ({ ...p, rotZ: v, enabled: true }))} min={-Math.PI} max={Math.PI} step={0.1} />
              <SliderRow label="Pos X" value={ferreroState.posX} onChange={v => setFerreroState(p => ({ ...p, posX: v, enabled: true }))} min={-5} max={5} />
              <SliderRow label="Pos Y" value={ferreroState.posY} onChange={v => setFerreroState(p => ({ ...p, posY: v, enabled: true }))} min={-5} max={5} />
              <SliderRow label="Pos Z" value={ferreroState.posZ} onChange={v => setFerreroState(p => ({ ...p, posZ: v, enabled: true }))} min={-5} max={5} />
              <SliderRow label="Scale" value={ferreroState.scale} onChange={v => setFerreroState(p => ({ ...p, scale: v, enabled: true }))} min={0.5} max={5} />
            </PropertySection>
            <PropertySection title="Animation">
              <ToggleRow label="Auto Rotate" value={ferreroState.autoRotate} onChange={v => setFerreroState(p => ({ ...p, autoRotate: v, enabled: true }))} />
              {ferreroState.autoRotate && <SliderRow label="Speed" value={ferreroState.autoRotateSpeed} onChange={v => setFerreroState(p => ({ ...p, autoRotateSpeed: v }))} min={0.1} max={5} />}
              <ToggleRow label="Float" value={ferreroState.floatEnabled} onChange={v => setFerreroState(p => ({ ...p, floatEnabled: v, enabled: true }))} />
              {ferreroState.floatEnabled && <>
                <SliderRow label="Amplitude" value={ferreroState.floatAmplitude} onChange={v => setFerreroState(p => ({ ...p, floatAmplitude: v }))} min={0.05} max={1} step={0.05} />
                <SliderRow label="Speed" value={ferreroState.floatSpeed} onChange={v => setFerreroState(p => ({ ...p, floatSpeed: v }))} min={0.1} max={3} />
              </>}
            </PropertySection>
            <PropertySection title="Material">
              <SliderRow label="Metalness" value={ferreroState.metalness} onChange={v => setFerreroState(p => ({ ...p, metalness: v, enabled: true }))} min={0} max={1} step={0.05} />
              <SliderRow label="Roughness" value={ferreroState.roughness} onChange={v => setFerreroState(p => ({ ...p, roughness: v, enabled: true }))} min={0} max={1} step={0.05} />
              <SliderRow label="Emissive" value={ferreroState.emissiveIntensity} onChange={v => setFerreroState(p => ({ ...p, emissiveIntensity: v, enabled: true }))} min={0} max={2} />
              <ColorRow label="Emissive Color" value={ferreroState.emissiveColor} onChange={v => setFerreroState(p => ({ ...p, emissiveColor: v }))} />
              <ToggleRow label="Wireframe" value={ferreroState.wireframe} onChange={v => setFerreroState(p => ({ ...p, wireframe: v, enabled: true }))} />
            </PropertySection>
          </>
        )
      case 'title':
        return (
          <>
            <ToggleRow label="Override" value={titleState.enabled} onChange={v => setTitleState(p => ({ ...p, enabled: v }))} />
            <PropertySection title="Content" color={c.accent}>
              <div style={styles.propRow}>
                <span style={styles.propLabel}>Title</span>
                <input type="text" value={titleState.titleText} onChange={e => setTitleState(p => ({ ...p, titleText: e.target.value, enabled: true }))} style={styles.textInput} />
              </div>
              <div style={styles.propRow}>
                <span style={styles.propLabel}>Subtitle</span>
                <input type="text" value={titleState.subtitleText} onChange={e => setTitleState(p => ({ ...p, subtitleText: e.target.value, enabled: true }))} style={styles.textInput} />
              </div>
            </PropertySection>
            <PropertySection title="Style">
              <SliderRow label="Opacity" value={titleState.opacity} onChange={v => setTitleState(p => ({ ...p, opacity: v, enabled: true }))} min={0} max={1} step={0.05} />
              <ToggleRow label="Glow" value={titleState.glowEnabled} onChange={v => setTitleState(p => ({ ...p, glowEnabled: v, enabled: true }))} />
              {titleState.glowEnabled && <>
                <SliderRow label="Intensity" value={titleState.glowIntensity} onChange={v => setTitleState(p => ({ ...p, glowIntensity: v }))} min={1} max={30} step={1} />
                <ColorRow label="Color" value={titleState.glowColor} onChange={v => setTitleState(p => ({ ...p, glowColor: v }))} />
              </>}
            </PropertySection>
            <PropertySection title="Animation">
              <div style={styles.propRow}>
                <span style={styles.propLabel}>Type</span>
                <select value={titleState.animationType} onChange={e => setTitleState(p => ({ ...p, animationType: e.target.value as typeof titleState.animationType, enabled: true }))} style={styles.select}>
                  <option value="none">None</option>
                  <option value="pulse">Pulse</option>
                  <option value="wave">Wave</option>
                  <option value="typewriter">Typewriter</option>
                </select>
              </div>
            </PropertySection>
          </>
        )
      case 'cards':
        return (
          <>
            <ToggleRow label="Override" value={cardsState.enabled} onChange={v => setCardsState(p => ({ ...p, enabled: v }))} />
            <PropertySection title="Appearance" color={c.green}>
              <SliderRow label="Opacity" value={cardsState.globalOpacity} onChange={v => setCardsState(p => ({ ...p, globalOpacity: v, enabled: true }))} min={0} max={1} step={0.05} />
              <SliderRow label="Blur" value={cardsState.blur} onChange={v => setCardsState(p => ({ ...p, blur: v, enabled: true }))} min={0} max={40} step={2} />
              <SliderRow label="Radius" value={cardsState.borderRadius} onChange={v => setCardsState(p => ({ ...p, borderRadius: v, enabled: true }))} min={0} max={40} step={2} />
              <SliderRow label="Padding" value={cardsState.padding} onChange={v => setCardsState(p => ({ ...p, padding: v, enabled: true }))} min={0} max={50} step={2} />
              <ColorRow label="Accent" value={cardsState.accentColor} onChange={v => setCardsState(p => ({ ...p, accentColor: v, enabled: true }))} />
            </PropertySection>
            <PropertySection title="Animation">
              <div style={styles.propRow}>
                <span style={styles.propLabel}>Enter</span>
                <select value={cardsState.animateIn} onChange={e => setCardsState(p => ({ ...p, animateIn: e.target.value as typeof cardsState.animateIn, enabled: true }))} style={styles.select}>
                  <option value="fade">Fade</option>
                  <option value="slide">Slide</option>
                  <option value="scale">Scale</option>
                  <option value="flip">Flip</option>
                </select>
              </div>
              <ToggleRow label="Glow" value={cardsState.glowEnabled} onChange={v => setCardsState(p => ({ ...p, glowEnabled: v, enabled: true }))} />
            </PropertySection>
          </>
        )
      case 'lighting':
        return (
          <>
            <ToggleRow label="Override" value={lightingState.enabled} onChange={v => setLightingState(p => ({ ...p, enabled: v }))} />
            <PropertySection title="Ambient" color={c.yellow}>
              <SliderRow label="Intensity" value={lightingState.ambientIntensity} onChange={v => setLightingState(p => ({ ...p, ambientIntensity: v, enabled: true }))} min={0} max={2} step={0.05} />
            </PropertySection>
            <PropertySection title="Main Spot">
              <SliderRow label="Intensity" value={lightingState.mainSpotIntensity} onChange={v => setLightingState(p => ({ ...p, mainSpotIntensity: v, enabled: true }))} min={0} max={10} step={0.5} />
              <ColorRow label="Color" value={lightingState.mainSpotColor} onChange={v => setLightingState(p => ({ ...p, mainSpotColor: v }))} />
            </PropertySection>
            <PropertySection title="Rim Light">
              <SliderRow label="Intensity" value={lightingState.rimLightIntensity} onChange={v => setLightingState(p => ({ ...p, rimLightIntensity: v, enabled: true }))} min={0} max={10} step={0.5} />
              <ColorRow label="Color" value={lightingState.rimLightColor} onChange={v => setLightingState(p => ({ ...p, rimLightColor: v }))} />
            </PropertySection>
            <PropertySection title="Fill Light">
              <SliderRow label="Intensity" value={lightingState.fillLightIntensity} onChange={v => setLightingState(p => ({ ...p, fillLightIntensity: v, enabled: true }))} min={0} max={10} step={0.5} />
              <ColorRow label="Color" value={lightingState.fillLightColor} onChange={v => setLightingState(p => ({ ...p, fillLightColor: v }))} />
            </PropertySection>
          </>
        )
      case 'camera':
        return (
          <>
            <ToggleRow label="Override" value={cameraState.enabled} onChange={v => setCameraState(p => ({ ...p, enabled: v }))} />
            <PropertySection title="Lens" color={c.purple}>
              <SliderRow label="FOV" value={cameraState.fov} onChange={v => setCameraState(p => ({ ...p, fov: v, enabled: true }))} min={10} max={120} step={5} />
            </PropertySection>
            <PropertySection title="Position">
              <SliderRow label="X" value={cameraState.positionX} onChange={v => setCameraState(p => ({ ...p, positionX: v, enabled: true }))} min={-10} max={10} step={0.5} />
              <SliderRow label="Y" value={cameraState.positionY} onChange={v => setCameraState(p => ({ ...p, positionY: v, enabled: true }))} min={-10} max={10} step={0.5} />
              <SliderRow label="Z" value={cameraState.positionZ} onChange={v => setCameraState(p => ({ ...p, positionZ: v, enabled: true }))} min={2} max={20} step={0.5} />
            </PropertySection>
            <PropertySection title="Animation">
              <ToggleRow label="Auto Orbit" value={cameraState.autoOrbit} onChange={v => setCameraState(p => ({ ...p, autoOrbit: v, enabled: true }))} />
              {cameraState.autoOrbit && <SliderRow label="Speed" value={cameraState.orbitSpeed} onChange={v => setCameraState(p => ({ ...p, orbitSpeed: v }))} min={0.1} max={3} />}
            </PropertySection>
          </>
        )
      case 'effects':
        return (
          <>
            <ToggleRow label="Override" value={effectsState.enabled} onChange={v => setEffectsState(p => ({ ...p, enabled: v }))} />
            <PropertySection title="Bloom" color={c.red}>
              <ToggleRow label="Enabled" value={effectsState.bloomEnabled} onChange={v => setEffectsState(p => ({ ...p, bloomEnabled: v, enabled: true }))} />
              {effectsState.bloomEnabled && <>
                <SliderRow label="Intensity" value={effectsState.bloomIntensity} onChange={v => setEffectsState(p => ({ ...p, bloomIntensity: v }))} min={0} max={3} />
                <SliderRow label="Threshold" value={effectsState.bloomThreshold} onChange={v => setEffectsState(p => ({ ...p, bloomThreshold: v }))} min={0} max={1} step={0.05} />
              </>}
            </PropertySection>
            <PropertySection title="Vignette">
              <ToggleRow label="Enabled" value={effectsState.vignetteEnabled} onChange={v => setEffectsState(p => ({ ...p, vignetteEnabled: v, enabled: true }))} />
              {effectsState.vignetteEnabled && <SliderRow label="Intensity" value={effectsState.vignetteIntensity} onChange={v => setEffectsState(p => ({ ...p, vignetteIntensity: v }))} min={0} max={1} step={0.05} />}
            </PropertySection>
            <PropertySection title="Chromatic">
              <ToggleRow label="Enabled" value={effectsState.chromaticEnabled} onChange={v => setEffectsState(p => ({ ...p, chromaticEnabled: v, enabled: true }))} />
              {effectsState.chromaticEnabled && <SliderRow label="Offset" value={effectsState.chromaticOffset} onChange={v => setEffectsState(p => ({ ...p, chromaticOffset: v }))} min={0} max={0.02} step={0.001} />}
            </PropertySection>
            <PropertySection title="Noise">
              <ToggleRow label="Enabled" value={effectsState.noiseEnabled} onChange={v => setEffectsState(p => ({ ...p, noiseEnabled: v, enabled: true }))} />
              {effectsState.noiseEnabled && <SliderRow label="Intensity" value={effectsState.noiseIntensity} onChange={v => setEffectsState(p => ({ ...p, noiseIntensity: v }))} min={0} max={0.5} step={0.02} />}
            </PropertySection>
          </>
        )
      case 'particles':
        return (
          <>
            <ToggleRow label="Override" value={particlesState.enabled} onChange={v => setParticlesState(p => ({ ...p, enabled: v }))} />
            <PropertySection title="Particles" color="#ff6b9d">
              <div style={styles.propRow}>
                <span style={styles.propLabel}>Type</span>
                <select value={particlesState.type} onChange={e => setParticlesState(p => ({ ...p, type: e.target.value as typeof particlesState.type, enabled: true }))} style={styles.select}>
                  <option value="dots">Dots</option>
                  <option value="sparkles">Sparkles</option>
                  <option value="snow">Snow</option>
                  <option value="stars">Stars</option>
                </select>
              </div>
              <SliderRow label="Count" value={particlesState.count} onChange={v => setParticlesState(p => ({ ...p, count: v, enabled: true }))} min={10} max={500} step={10} />
              <SliderRow label="Size" value={particlesState.size} onChange={v => setParticlesState(p => ({ ...p, size: v, enabled: true }))} min={0.01} max={0.1} step={0.01} />
              <SliderRow label="Speed" value={particlesState.speed} onChange={v => setParticlesState(p => ({ ...p, speed: v, enabled: true }))} min={0.1} max={2} />
              <SliderRow label="Opacity" value={particlesState.opacity} onChange={v => setParticlesState(p => ({ ...p, opacity: v, enabled: true }))} min={0} max={1} step={0.05} />
              <ColorRow label="Color" value={particlesState.color} onChange={v => setParticlesState(p => ({ ...p, color: v, enabled: true }))} />
            </PropertySection>
          </>
        )
      case 'background':
        return (
          <>
            <ToggleRow label="Override" value={backgroundState.enabled} onChange={v => setBackgroundState(p => ({ ...p, enabled: v }))} />
            <PropertySection title="Color" color="#6366f1">
              <ColorRow label="Background" value={backgroundState.color} onChange={v => setBackgroundState(p => ({ ...p, color: v, enabled: true }))} />
              <ToggleRow label="Gradient" value={backgroundState.gradientEnabled} onChange={v => setBackgroundState(p => ({ ...p, gradientEnabled: v, enabled: true }))} />
              {backgroundState.gradientEnabled && <>
                <ColorRow label="Top" value={backgroundState.gradientTop} onChange={v => setBackgroundState(p => ({ ...p, gradientTop: v }))} />
                <ColorRow label="Bottom" value={backgroundState.gradientBottom} onChange={v => setBackgroundState(p => ({ ...p, gradientBottom: v }))} />
              </>}
            </PropertySection>
            <PropertySection title="Effects">
              <ToggleRow label="Stars" value={backgroundState.starsEnabled} onChange={v => setBackgroundState(p => ({ ...p, starsEnabled: v, enabled: true }))} />
            </PropertySection>
          </>
        )
      default:
        return null
    }
  }

  const selectedLayer = layers.find(l => l.id === selectedComponent)

  return (
    <div style={styles.page}>
      {/* Top Toolbar */}
      <div style={styles.toolbar}>
        <a href="/" style={styles.homeBtn}><Home size={16} /></a>
        <div style={styles.toolbarDivider} />

        <button style={{ ...styles.toolBtn, ...(playing ? styles.toolBtnActive : {}) }} onClick={() => setPlaying(!playing)}>
          {playing ? <Pause size={14} /> : <Play size={14} />}
        </button>
        <button style={styles.toolBtn} onClick={() => setScroll(0)}><RefreshCw size={14} /></button>

        {/* Speed selector */}
        <select style={styles.speedSelect} value={speed} onChange={e => setSpeed(parseFloat(e.target.value))}>
          <option value={0.00004}>0.25x</option>
          <option value={0.00008}>0.5x</option>
          <option value={0.00015}>1x</option>
          <option value={0.0003}>2x</option>
          <option value={0.0006}>4x</option>
        </select>

        <div style={styles.toolbarDivider} />

        {/* Presets */}
        <div style={{ position: 'relative' }}>
          <button style={styles.presetBtn} onClick={() => setShowPresets(!showPresets)}>
            Jump <ChevronDown size={12} />
          </button>
          {showPresets && (
            <div style={styles.presetMenu}>
              {presets.map(p => (
                <button key={p.name} style={styles.presetItem} onClick={() => { setScroll(p.scroll); setShowPresets(false) }}>
                  {p.name}<span style={styles.presetPercent}>{(p.scroll * 100).toFixed(0)}%</span>
                </button>
              ))}
            </div>
          )}
        </div>

        <div style={styles.toolbarDivider} />

        {/* Quick Effects */}
        {quickEffects.map(fx => (
          <button key={fx.action} style={styles.fxBtn} onClick={() => applyQuickEffect(fx.action)} title={fx.name}>
            {fx.icon}
          </button>
        ))}

        <div style={{ flex: 1 }} />

        <button style={styles.toolBtn} onClick={handleExport} title="Export"><Download size={14} /></button>
        <button style={{ ...styles.toolBtn, color: c.red }} onClick={resetAll} title="Reset">
          <Zap size={14} />
        </button>

        <div style={styles.scrollDisplay}>{(scroll * 100).toFixed(1)}%</div>
      </div>

      {/* Main Content */}
      <div style={styles.main}>
        {/* Left Panel - Structure & Live Data */}
        <div style={styles.leftPanel}>
          <div style={styles.tabBar}>
            <button style={{ ...styles.tabBtn, ...(leftPanelTab === 'structure' ? styles.tabBtnActive : {}) }}
              onClick={() => setLeftPanelTab('structure')}>Structure</button>
            <button style={{ ...styles.tabBtn, ...(leftPanelTab === 'live' ? styles.tabBtnActive : {}) }}
              onClick={() => setLeftPanelTab('live')}>Live</button>
          </div>

          {leftPanelTab === 'structure' && (
            <div style={styles.leftPanelContent}>
              <div style={styles.panelTitle}>Sections</div>
              {codeStructure ? codeStructure.sections.map(sec => {
                const start = parseFloat(sec.scrollRange.split('-')[0]) / 100
                const end = parseFloat(sec.scrollRange.split('-')[1].replace('%', '')) / 100
                const isActive = scroll >= start && scroll < end
                return (
                  <div key={sec.id} style={{ ...styles.structureItem, backgroundColor: isActive ? `${c.accent}22` : 'transparent' }}
                    onClick={() => setScroll((start + end) / 2)}>
                    <span style={styles.structureName}>{sec.name}</span>
                    <span style={styles.structureRange}>{sec.scrollRange}</span>
                  </div>
                )
              }) : <div style={styles.loadingText}>Loading...</div>}

              <div style={{ ...styles.panelTitle, marginTop: 16 }}>Info Cards</div>
              {codeStructure ? codeStructure.cards.map(card => {
                const isActive = scroll >= card.startScroll && scroll < card.endScroll
                return (
                  <div key={card.id} style={{ ...styles.structureItem, backgroundColor: isActive ? `${c.gold}22` : 'transparent' }}
                    onClick={() => setScroll((card.startScroll + card.endScroll) / 2)}>
                    <span style={styles.structureName}>{card.title}</span>
                    <span style={styles.structureRange}>{(card.startScroll * 100).toFixed(0)}-{(card.endScroll * 100).toFixed(0)}%</span>
                  </div>
                )
              }) : <div style={styles.loadingText}>Loading...</div>}
            </div>
          )}

          {leftPanelTab === 'live' && liveData && (
            <div style={styles.leftPanelContent}>
              <div style={styles.panelTitle}>Ferrero State</div>
              <div style={styles.liveGrid}>
                <div style={styles.liveGroup}>
                  <span style={styles.liveLabel}>Rotation</span>
                  <div style={styles.liveRow}><span>X</span><span style={styles.liveValue}>{liveData.rotX.toFixed(2)}</span></div>
                  <div style={styles.liveRow}><span>Y</span><span style={styles.liveValue}>{liveData.rotY.toFixed(2)}</span></div>
                  <div style={styles.liveRow}><span>Z</span><span style={styles.liveValue}>{liveData.rotZ.toFixed(2)}</span></div>
                </div>
                <div style={styles.liveGroup}>
                  <span style={styles.liveLabel}>Position</span>
                  <div style={styles.liveRow}><span>X</span><span style={styles.liveValue}>{liveData.posX.toFixed(2)}</span></div>
                  <div style={styles.liveRow}><span>Y</span><span style={styles.liveValue}>{liveData.posY.toFixed(2)}</span></div>
                  <div style={styles.liveRow}><span>Z</span><span style={styles.liveValue}>{liveData.posZ.toFixed(2)}</span></div>
                </div>
              </div>
              <div style={styles.liveRow}><span>Scale</span><span style={styles.liveValue}>{liveData.scale.toFixed(2)}</span></div>
              {liveData.activeCard && (
                <div style={{ ...styles.liveRow, marginTop: 12, color: c.gold }}>
                  <span>Active Card</span><span style={styles.liveValue}>{liveData.activeCard}</span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Canvas */}
        <div style={styles.canvas}>
          <iframe ref={iframeRef} src="/?debug=true" style={styles.iframe}
            onLoad={() => { setIframeReady(true); syncScrollToIframe(scroll) }} />
          {!iframeReady && <div style={styles.loading}>Loading preview...</div>}
        </div>

        {/* Right Panel - Layers & Properties */}
        <div style={styles.rightPanel}>
          <div style={styles.panelTitle}><Layers size={12} /> Layers</div>
          <div style={styles.layersList}>
            {layers.map(layer => {
              const Icon = layer.icon
              const isSelected = selectedComponent === layer.id
              return (
                <button key={layer.id} style={{ ...styles.layerItem, backgroundColor: isSelected ? `${layer.color}22` : 'transparent', borderLeft: isSelected ? `2px solid ${layer.color}` : '2px solid transparent' }}
                  onClick={() => setSelectedComponent(layer.id)}>
                  <Icon size={12} style={{ color: layer.color }} />
                  <span style={{ color: isSelected ? '#fff' : c.muted }}>{layer.name}</span>
                </button>
              )
            })}
          </div>

          <div style={styles.propertiesSection}>
            <div style={{ ...styles.panelTitle, color: selectedLayer?.color }}>
              <Palette size={12} /> {selectedLayer?.name}
            </div>
            <div style={styles.propertiesContent}>{renderProperties()}</div>
          </div>
        </div>
      </div>

      {/* Timeline */}
      <div style={styles.timelineWrap}>
        <div style={styles.timelineHeader}>
          <span style={styles.timelineLabel}>Timeline</span>
          <button style={{ ...styles.keyframeToggle, backgroundColor: showKeyframes ? c.gold : c.card, color: showKeyframes ? '#000' : '#fff' }}
            onClick={() => setShowKeyframes(!showKeyframes)}>
            <Diamond size={10} /> Keyframes
          </button>
        </div>

        <div style={styles.timelineTrack} ref={timelineRef} onClick={handleTimeline}
          onMouseDown={e => {
            handleTimeline(e)
            const move = (ev: MouseEvent) => handleTimeline(ev as unknown as React.MouseEvent)
            const up = () => { window.removeEventListener('mousemove', move); window.removeEventListener('mouseup', up) }
            window.addEventListener('mousemove', move); window.addEventListener('mouseup', up)
          }}>
          {presets.map(p => (
            <div key={p.name} style={{ position: 'absolute', left: `${p.scroll * 100}%`, top: 0, bottom: 0, borderLeft: `1px dashed ${c.border}` }}>
              <span style={styles.timelineMarker}>{p.name}</span>
            </div>
          ))}
          <div style={{ ...styles.playhead, left: `${scroll * 100}%` }}>
            <div style={styles.playheadLine} />
            <div style={styles.playheadHandle} />
          </div>
        </div>

        {/* Keyframe Tracks */}
        {showKeyframes && (
          <div style={styles.keyframeTracks}>
            {(['ferrero', 'title', 'cards', 'lighting'] as const).map(track => {
              const trackColors: Record<string, string> = { ferrero: c.gold, title: c.accent, cards: c.green, lighting: c.yellow }
              return (
                <div key={track} style={styles.keyframeTrackRow}>
                  <div style={styles.trackLabel}>
                    <span style={{ color: trackColors[track] }}>{track}</span>
                    <button style={styles.addKfBtn} onClick={() => addKeyframe(track)}><Plus size={10} /></button>
                  </div>
                  <div style={styles.keyframeTrack}>
                    {keyframes[track].map(kf => (
                      <div key={kf.id} style={{ position: 'absolute', left: `${kf.scroll * 100}%`, top: '50%', transform: 'translate(-50%, -50%)', cursor: 'pointer' }}
                        onClick={() => { setScroll(kf.scroll); setSelectedKeyframe(kf.id) }}>
                        <Diamond size={12} fill={selectedKeyframe === kf.id ? trackColors[track] : 'transparent'} stroke={trackColors[track]} strokeWidth={2} />
                      </div>
                    ))}
                    <div style={{ position: 'absolute', left: `${scroll * 100}%`, top: 0, bottom: 0, width: 1, backgroundColor: c.red, opacity: 0.5 }} />
                  </div>
                  {selectedKeyframe?.startsWith(track) && (
                    <button style={styles.deleteKfBtn} onClick={() => removeKeyframe(track, selectedKeyframe)}><Trash2 size={10} /></button>
                  )}
                </div>
              )
            })}
          </div>
        )}

        <div style={styles.timeMarkers}>
          {[0, 25, 50, 75, 100].map(p => <span key={p} style={styles.timeMarker}>{p}%</span>)}
        </div>
      </div>
    </div>
  )
}

const styles: Record<string, CSSProperties> = {
  page: { height: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: c.bg, fontFamily: 'Inter, -apple-system, sans-serif', color: c.text, overflow: 'hidden' },

  // Toolbar
  toolbar: { height: 44, backgroundColor: c.panel, borderBottom: `1px solid ${c.border}`, display: 'flex', alignItems: 'center', padding: '0 12px', gap: 6 },
  homeBtn: { width: 28, height: 28, borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', color: c.muted, textDecoration: 'none' },
  toolbarDivider: { width: 1, height: 20, backgroundColor: c.border, margin: '0 4px' },
  toolBtn: { width: 28, height: 28, borderRadius: 6, border: 'none', background: 'transparent', color: c.muted, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' },
  toolBtnActive: { backgroundColor: c.accent, color: '#fff' },
  speedSelect: { height: 26, padding: '0 6px', borderRadius: 4, border: `1px solid ${c.border}`, backgroundColor: c.card, color: c.text, fontSize: 11, cursor: 'pointer' },
  presetBtn: { height: 26, padding: '0 10px', borderRadius: 4, border: 'none', background: 'transparent', color: c.muted, display: 'flex', alignItems: 'center', gap: 4, cursor: 'pointer', fontSize: 11 },
  presetMenu: { position: 'absolute', top: '100%', left: 0, marginTop: 4, backgroundColor: c.panel, border: `1px solid ${c.border}`, borderRadius: 6, overflow: 'hidden', zIndex: 100, minWidth: 140, boxShadow: '0 8px 32px rgba(0,0,0,0.4)' },
  presetItem: { width: '100%', padding: '8px 10px', border: 'none', background: 'transparent', color: c.text, textAlign: 'left', cursor: 'pointer', fontSize: 11, display: 'flex', justifyContent: 'space-between' },
  presetPercent: { color: c.muted, fontSize: 10, fontFamily: 'monospace' },
  fxBtn: { width: 28, height: 28, borderRadius: 6, border: `1px solid ${c.border}`, background: 'transparent', cursor: 'pointer', fontSize: 12, display: 'flex', alignItems: 'center', justifyContent: 'center' },
  scrollDisplay: { padding: '4px 10px', borderRadius: 4, backgroundColor: c.card, fontFamily: 'JetBrains Mono, monospace', fontSize: 11, color: c.accent },

  // Main
  main: { flex: 1, display: 'flex', minHeight: 0 },

  // Left Panel
  leftPanel: { width: 200, backgroundColor: c.panel, borderRight: `1px solid ${c.border}`, display: 'flex', flexDirection: 'column' },
  tabBar: { display: 'flex', borderBottom: `1px solid ${c.border}` },
  tabBtn: { flex: 1, padding: '8px', border: 'none', background: 'transparent', color: c.muted, fontSize: 11, cursor: 'pointer' },
  tabBtnActive: { backgroundColor: c.card, color: c.text },
  leftPanelContent: { flex: 1, overflowY: 'auto', padding: 12 },
  panelTitle: { fontSize: 10, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: c.muted, marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 },
  structureItem: { padding: '6px 8px', borderRadius: 4, marginBottom: 4, cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  structureName: { fontSize: 11, color: c.text },
  structureRange: { fontSize: 9, color: c.dim, fontFamily: 'monospace' },
  loadingText: { fontSize: 10, color: c.dim, fontStyle: 'italic' },
  liveGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 },
  liveGroup: { padding: 8, backgroundColor: c.card, borderRadius: 6 },
  liveLabel: { display: 'block', fontSize: 9, color: c.dim, textTransform: 'uppercase', marginBottom: 6 },
  liveRow: { display: 'flex', justifyContent: 'space-between', fontSize: 10, color: c.muted, padding: '2px 0' },
  liveValue: { color: c.text, fontFamily: 'JetBrains Mono, monospace' },

  // Canvas
  canvas: { flex: 1, position: 'relative', backgroundColor: '#0a0a0a' },
  iframe: { width: '100%', height: '100%', border: 'none' },
  loading: { position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', color: c.muted, fontSize: 12 },

  // Right Panel
  rightPanel: { width: 260, backgroundColor: c.panel, borderLeft: `1px solid ${c.border}`, display: 'flex', flexDirection: 'column' },
  layersList: { padding: '0 8px 8px', borderBottom: `1px solid ${c.border}` },
  layerItem: { width: '100%', display: 'flex', alignItems: 'center', gap: 8, padding: '6px 10px', borderRadius: 4, border: 'none', background: 'transparent', cursor: 'pointer', fontSize: 11, textAlign: 'left' },
  propertiesSection: { flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' },
  propertiesContent: { flex: 1, overflowY: 'auto', padding: '0 12px 12px' },

  // Property Section
  propertySection: { marginBottom: 12 },
  sectionHeader: { fontSize: 10, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.03em', padding: '8px 0 4px', color: c.muted },
  sectionContent: { paddingLeft: 4 },

  // Property Row
  propRow: { display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 },
  propLabel: { width: 70, fontSize: 10, color: c.muted, flexShrink: 0 },
  propValue: { width: 40, fontSize: 10, color: c.text, fontFamily: 'JetBrains Mono, monospace', textAlign: 'right' },
  slider: { flex: 1, height: 3, accentColor: c.accent },
  toggle: { padding: '3px 8px', borderRadius: 3, border: 'none', fontSize: 9, fontWeight: 600, cursor: 'pointer', color: '#fff' },
  textInput: { flex: 1, padding: '4px 6px', borderRadius: 3, border: `1px solid ${c.border}`, backgroundColor: c.card, color: c.text, fontSize: 10 },
  select: { flex: 1, padding: '4px 6px', borderRadius: 3, border: `1px solid ${c.border}`, backgroundColor: c.card, color: c.text, fontSize: 10, cursor: 'pointer' },
  colorInput: { width: 20, height: 20, padding: 0, border: `1px solid ${c.border}`, borderRadius: 3, cursor: 'pointer' },

  // Timeline
  timelineWrap: { backgroundColor: c.panel, borderTop: `1px solid ${c.border}`, padding: '8px 12px' },
  timelineHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  timelineLabel: { fontSize: 10, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: c.muted },
  keyframeToggle: { display: 'flex', alignItems: 'center', gap: 4, padding: '3px 8px', borderRadius: 4, border: 'none', fontSize: 9, fontWeight: 600, cursor: 'pointer' },
  timelineTrack: { position: 'relative', height: 32, backgroundColor: c.card, borderRadius: 4, cursor: 'pointer', overflow: 'hidden' },
  timelineMarker: { position: 'absolute', top: 2, left: 4, fontSize: 8, color: c.dim, whiteSpace: 'nowrap' },
  playhead: { position: 'absolute', top: 0, bottom: 0, width: 2, zIndex: 10 },
  playheadLine: { position: 'absolute', top: 0, bottom: 0, left: '50%', width: 2, marginLeft: -1, backgroundColor: c.accent },
  playheadHandle: { position: 'absolute', top: -3, left: '50%', width: 8, height: 8, marginLeft: -4, backgroundColor: c.accent, borderRadius: '50%', boxShadow: `0 0 6px ${c.accent}` },
  timeMarkers: { display: 'flex', justifyContent: 'space-between', marginTop: 4 },
  timeMarker: { fontSize: 9, color: c.dim, fontFamily: 'JetBrains Mono, monospace' },

  // Keyframe Tracks
  keyframeTracks: { marginTop: 8, display: 'flex', flexDirection: 'column', gap: 4, backgroundColor: c.bg, borderRadius: 4, padding: 8 },
  keyframeTrackRow: { display: 'flex', alignItems: 'center', gap: 8, height: 24 },
  trackLabel: { width: 60, display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 10, fontWeight: 600 },
  addKfBtn: { width: 16, height: 16, borderRadius: 3, border: `1px solid ${c.border}`, background: 'transparent', color: c.muted, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  keyframeTrack: { flex: 1, height: 20, backgroundColor: c.card, borderRadius: 3, border: `1px solid ${c.border}`, position: 'relative' },
  deleteKfBtn: { width: 20, height: 20, borderRadius: 3, border: 'none', background: `${c.red}33`, color: c.red, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' },
}
