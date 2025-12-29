import { useState, useRef, CSSProperties, useEffect, useCallback } from 'react'
import { Play, Pause, Home, RefreshCw, ChevronDown, ChevronRight, Box, Type, Layers, Sun, Camera, Sparkles, Image, Palette } from 'lucide-react'

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
  { id: 'lighting', name: 'Lighting', icon: Sun, color: '#ffb800' },
  { id: 'camera', name: 'Camera', icon: Camera, color: c.purple },
  { id: 'effects', name: 'Post FX', icon: Sparkles, color: c.red },
  { id: 'particles', name: 'Particles', icon: Sparkles, color: '#ff6b9d' },
  { id: 'background', name: 'Background', icon: Image, color: '#6366f1' },
]

// Animation presets
const presets = [
  { name: 'Hero Start', scroll: 0.05 },
  { name: 'La Copertura', scroll: 0.22 },
  { name: 'Il Cuore', scroll: 0.37 },
  { name: "L'Eleganza", scroll: 0.52 },
  { name: 'Transition', scroll: 0.70 },
  { name: 'End', scroll: 0.98 },
]

export function AnimationConsole() {
  const [scroll, setScroll] = useState(0)
  const [playing, setPlaying] = useState(false)
  const [showPresets, setShowPresets] = useState(false)
  const [selectedComponent, setSelectedComponent] = useState<ComponentId>('ferrero')
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    transform: true,
    animation: true,
    material: false,
  })

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

  const timelineRef = useRef<HTMLDivElement>(null)
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const [iframeReady, setIframeReady] = useState(false)

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
    const i = setInterval(() => setScroll(p => p >= 1 ? (setPlaying(false), 0) : p + 0.00015), 16)
    return () => clearInterval(i)
  }, [playing])

  // Timeline interaction
  const handleTimeline = (e: React.MouseEvent) => {
    if (!timelineRef.current) return
    const rect = timelineRef.current.getBoundingClientRect()
    setScroll(Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width)))
  }

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }))
  }

  // Property Section Component
  const PropertySection = ({ title, expanded, onToggle, children }: {
    title: string, expanded: boolean, onToggle: () => void, children: React.ReactNode
  }) => (
    <div style={styles.propertySection}>
      <button style={styles.sectionHeader} onClick={onToggle}>
        {expanded ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
        <span>{title}</span>
      </button>
      {expanded && <div style={styles.sectionContent}>{children}</div>}
    </div>
  )

  // Slider Row Component
  const SliderRow = ({ label, value, onChange, min, max, step = 0.1 }: {
    label: string, value: number, onChange: (v: number) => void, min: number, max: number, step?: number
  }) => (
    <div style={styles.propRow}>
      <span style={styles.propLabel}>{label}</span>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={e => onChange(parseFloat(e.target.value))}
        style={styles.slider}
      />
      <span style={styles.propValue}>{value.toFixed(step >= 1 ? 0 : step >= 0.1 ? 1 : 2)}</span>
    </div>
  )

  // Toggle Row Component
  const ToggleRow = ({ label, value, onChange }: {
    label: string, value: boolean, onChange: (v: boolean) => void
  }) => (
    <div style={styles.propRow}>
      <span style={styles.propLabel}>{label}</span>
      <button
        style={{ ...styles.toggle, backgroundColor: value ? c.accent : c.card }}
        onClick={() => onChange(!value)}
      >
        {value ? 'ON' : 'OFF'}
      </button>
    </div>
  )

  // Color Row Component
  const ColorRow = ({ label, value, onChange }: {
    label: string, value: string, onChange: (v: string) => void
  }) => (
    <div style={styles.propRow}>
      <span style={styles.propLabel}>{label}</span>
      <input type="color" value={value} onChange={e => onChange(e.target.value)} style={styles.colorInput} />
      <span style={styles.propValue}>{value}</span>
    </div>
  )

  // Render properties panel based on selected component
  const renderProperties = () => {
    switch (selectedComponent) {
      case 'ferrero':
        return (
          <>
            <ToggleRow label="Override" value={ferreroState.enabled} onChange={v => setFerreroState(p => ({ ...p, enabled: v }))} />

            <PropertySection title="Transform" expanded={expandedSections.transform} onToggle={() => toggleSection('transform')}>
              <SliderRow label="Rotation X" value={ferreroState.rotX} onChange={v => setFerreroState(p => ({ ...p, rotX: v, enabled: true }))} min={-Math.PI} max={Math.PI} step={0.1} />
              <SliderRow label="Rotation Y" value={ferreroState.rotY} onChange={v => setFerreroState(p => ({ ...p, rotY: v, enabled: true }))} min={-Math.PI} max={Math.PI} step={0.1} />
              <SliderRow label="Rotation Z" value={ferreroState.rotZ} onChange={v => setFerreroState(p => ({ ...p, rotZ: v, enabled: true }))} min={-Math.PI} max={Math.PI} step={0.1} />
              <div style={styles.divider} />
              <SliderRow label="Position X" value={ferreroState.posX} onChange={v => setFerreroState(p => ({ ...p, posX: v, enabled: true }))} min={-5} max={5} />
              <SliderRow label="Position Y" value={ferreroState.posY} onChange={v => setFerreroState(p => ({ ...p, posY: v, enabled: true }))} min={-5} max={5} />
              <SliderRow label="Position Z" value={ferreroState.posZ} onChange={v => setFerreroState(p => ({ ...p, posZ: v, enabled: true }))} min={-5} max={5} />
              <div style={styles.divider} />
              <SliderRow label="Scale" value={ferreroState.scale} onChange={v => setFerreroState(p => ({ ...p, scale: v, enabled: true }))} min={0.5} max={5} />
            </PropertySection>

            <PropertySection title="Animation" expanded={expandedSections.animation} onToggle={() => toggleSection('animation')}>
              <ToggleRow label="Auto Rotate" value={ferreroState.autoRotate} onChange={v => setFerreroState(p => ({ ...p, autoRotate: v, enabled: true }))} />
              {ferreroState.autoRotate && (
                <SliderRow label="Speed" value={ferreroState.autoRotateSpeed} onChange={v => setFerreroState(p => ({ ...p, autoRotateSpeed: v }))} min={0.1} max={5} />
              )}
              <ToggleRow label="Float" value={ferreroState.floatEnabled} onChange={v => setFerreroState(p => ({ ...p, floatEnabled: v, enabled: true }))} />
              {ferreroState.floatEnabled && (
                <>
                  <SliderRow label="Amplitude" value={ferreroState.floatAmplitude} onChange={v => setFerreroState(p => ({ ...p, floatAmplitude: v }))} min={0.05} max={1} step={0.05} />
                  <SliderRow label="Speed" value={ferreroState.floatSpeed} onChange={v => setFerreroState(p => ({ ...p, floatSpeed: v }))} min={0.1} max={3} />
                </>
              )}
            </PropertySection>

            <PropertySection title="Material" expanded={expandedSections.material} onToggle={() => toggleSection('material')}>
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

            <PropertySection title="Content" expanded={true} onToggle={() => {}}>
              <div style={styles.propRow}>
                <span style={styles.propLabel}>Title</span>
                <input
                  type="text"
                  value={titleState.titleText}
                  onChange={e => setTitleState(p => ({ ...p, titleText: e.target.value, enabled: true }))}
                  style={styles.textInput}
                />
              </div>
              <div style={styles.propRow}>
                <span style={styles.propLabel}>Subtitle</span>
                <input
                  type="text"
                  value={titleState.subtitleText}
                  onChange={e => setTitleState(p => ({ ...p, subtitleText: e.target.value, enabled: true }))}
                  style={styles.textInput}
                />
              </div>
            </PropertySection>

            <PropertySection title="Style" expanded={true} onToggle={() => {}}>
              <SliderRow label="Opacity" value={titleState.opacity} onChange={v => setTitleState(p => ({ ...p, opacity: v, enabled: true }))} min={0} max={1} step={0.05} />
              <ToggleRow label="Glow" value={titleState.glowEnabled} onChange={v => setTitleState(p => ({ ...p, glowEnabled: v, enabled: true }))} />
              {titleState.glowEnabled && (
                <>
                  <SliderRow label="Intensity" value={titleState.glowIntensity} onChange={v => setTitleState(p => ({ ...p, glowIntensity: v }))} min={1} max={30} step={1} />
                  <ColorRow label="Color" value={titleState.glowColor} onChange={v => setTitleState(p => ({ ...p, glowColor: v }))} />
                </>
              )}
            </PropertySection>

            <PropertySection title="Animation" expanded={true} onToggle={() => {}}>
              <div style={styles.propRow}>
                <span style={styles.propLabel}>Type</span>
                <select
                  value={titleState.animationType}
                  onChange={e => setTitleState(p => ({ ...p, animationType: e.target.value as typeof titleState.animationType, enabled: true }))}
                  style={styles.select}
                >
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

            <PropertySection title="Appearance" expanded={true} onToggle={() => {}}>
              <SliderRow label="Opacity" value={cardsState.globalOpacity} onChange={v => setCardsState(p => ({ ...p, globalOpacity: v, enabled: true }))} min={0} max={1} step={0.05} />
              <SliderRow label="Blur" value={cardsState.blur} onChange={v => setCardsState(p => ({ ...p, blur: v, enabled: true }))} min={0} max={40} step={2} />
              <SliderRow label="Radius" value={cardsState.borderRadius} onChange={v => setCardsState(p => ({ ...p, borderRadius: v, enabled: true }))} min={0} max={40} step={2} />
              <SliderRow label="Padding" value={cardsState.padding} onChange={v => setCardsState(p => ({ ...p, padding: v, enabled: true }))} min={0} max={50} step={2} />
              <ColorRow label="Accent" value={cardsState.accentColor} onChange={v => setCardsState(p => ({ ...p, accentColor: v, enabled: true }))} />
            </PropertySection>

            <PropertySection title="Animation" expanded={true} onToggle={() => {}}>
              <div style={styles.propRow}>
                <span style={styles.propLabel}>Enter</span>
                <select
                  value={cardsState.animateIn}
                  onChange={e => setCardsState(p => ({ ...p, animateIn: e.target.value as typeof cardsState.animateIn, enabled: true }))}
                  style={styles.select}
                >
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

            <PropertySection title="Ambient" expanded={true} onToggle={() => {}}>
              <SliderRow label="Intensity" value={lightingState.ambientIntensity} onChange={v => setLightingState(p => ({ ...p, ambientIntensity: v, enabled: true }))} min={0} max={2} step={0.05} />
            </PropertySection>

            <PropertySection title="Main Spot" expanded={true} onToggle={() => {}}>
              <SliderRow label="Intensity" value={lightingState.mainSpotIntensity} onChange={v => setLightingState(p => ({ ...p, mainSpotIntensity: v, enabled: true }))} min={0} max={10} step={0.5} />
              <ColorRow label="Color" value={lightingState.mainSpotColor} onChange={v => setLightingState(p => ({ ...p, mainSpotColor: v }))} />
            </PropertySection>

            <PropertySection title="Rim Light" expanded={true} onToggle={() => {}}>
              <SliderRow label="Intensity" value={lightingState.rimLightIntensity} onChange={v => setLightingState(p => ({ ...p, rimLightIntensity: v, enabled: true }))} min={0} max={10} step={0.5} />
              <ColorRow label="Color" value={lightingState.rimLightColor} onChange={v => setLightingState(p => ({ ...p, rimLightColor: v }))} />
            </PropertySection>

            <PropertySection title="Fill Light" expanded={true} onToggle={() => {}}>
              <SliderRow label="Intensity" value={lightingState.fillLightIntensity} onChange={v => setLightingState(p => ({ ...p, fillLightIntensity: v, enabled: true }))} min={0} max={10} step={0.5} />
              <ColorRow label="Color" value={lightingState.fillLightColor} onChange={v => setLightingState(p => ({ ...p, fillLightColor: v }))} />
            </PropertySection>
          </>
        )

      case 'camera':
        return (
          <>
            <ToggleRow label="Override" value={cameraState.enabled} onChange={v => setCameraState(p => ({ ...p, enabled: v }))} />

            <PropertySection title="Lens" expanded={true} onToggle={() => {}}>
              <SliderRow label="FOV" value={cameraState.fov} onChange={v => setCameraState(p => ({ ...p, fov: v, enabled: true }))} min={10} max={120} step={5} />
            </PropertySection>

            <PropertySection title="Position" expanded={true} onToggle={() => {}}>
              <SliderRow label="X" value={cameraState.positionX} onChange={v => setCameraState(p => ({ ...p, positionX: v, enabled: true }))} min={-10} max={10} step={0.5} />
              <SliderRow label="Y" value={cameraState.positionY} onChange={v => setCameraState(p => ({ ...p, positionY: v, enabled: true }))} min={-10} max={10} step={0.5} />
              <SliderRow label="Z" value={cameraState.positionZ} onChange={v => setCameraState(p => ({ ...p, positionZ: v, enabled: true }))} min={2} max={20} step={0.5} />
            </PropertySection>

            <PropertySection title="Animation" expanded={true} onToggle={() => {}}>
              <ToggleRow label="Auto Orbit" value={cameraState.autoOrbit} onChange={v => setCameraState(p => ({ ...p, autoOrbit: v, enabled: true }))} />
              {cameraState.autoOrbit && (
                <SliderRow label="Speed" value={cameraState.orbitSpeed} onChange={v => setCameraState(p => ({ ...p, orbitSpeed: v }))} min={0.1} max={3} />
              )}
            </PropertySection>
          </>
        )

      case 'effects':
        return (
          <>
            <ToggleRow label="Override" value={effectsState.enabled} onChange={v => setEffectsState(p => ({ ...p, enabled: v }))} />

            <PropertySection title="Bloom" expanded={true} onToggle={() => {}}>
              <ToggleRow label="Enabled" value={effectsState.bloomEnabled} onChange={v => setEffectsState(p => ({ ...p, bloomEnabled: v, enabled: true }))} />
              {effectsState.bloomEnabled && (
                <>
                  <SliderRow label="Intensity" value={effectsState.bloomIntensity} onChange={v => setEffectsState(p => ({ ...p, bloomIntensity: v }))} min={0} max={3} />
                  <SliderRow label="Threshold" value={effectsState.bloomThreshold} onChange={v => setEffectsState(p => ({ ...p, bloomThreshold: v }))} min={0} max={1} step={0.05} />
                </>
              )}
            </PropertySection>

            <PropertySection title="Vignette" expanded={true} onToggle={() => {}}>
              <ToggleRow label="Enabled" value={effectsState.vignetteEnabled} onChange={v => setEffectsState(p => ({ ...p, vignetteEnabled: v, enabled: true }))} />
              {effectsState.vignetteEnabled && (
                <SliderRow label="Intensity" value={effectsState.vignetteIntensity} onChange={v => setEffectsState(p => ({ ...p, vignetteIntensity: v }))} min={0} max={1} step={0.05} />
              )}
            </PropertySection>

            <PropertySection title="Chromatic Aberration" expanded={true} onToggle={() => {}}>
              <ToggleRow label="Enabled" value={effectsState.chromaticEnabled} onChange={v => setEffectsState(p => ({ ...p, chromaticEnabled: v, enabled: true }))} />
              {effectsState.chromaticEnabled && (
                <SliderRow label="Offset" value={effectsState.chromaticOffset} onChange={v => setEffectsState(p => ({ ...p, chromaticOffset: v }))} min={0} max={0.02} step={0.001} />
              )}
            </PropertySection>

            <PropertySection title="Noise" expanded={true} onToggle={() => {}}>
              <ToggleRow label="Enabled" value={effectsState.noiseEnabled} onChange={v => setEffectsState(p => ({ ...p, noiseEnabled: v, enabled: true }))} />
              {effectsState.noiseEnabled && (
                <SliderRow label="Intensity" value={effectsState.noiseIntensity} onChange={v => setEffectsState(p => ({ ...p, noiseIntensity: v }))} min={0} max={0.5} step={0.02} />
              )}
            </PropertySection>
          </>
        )

      case 'particles':
        return (
          <>
            <ToggleRow label="Override" value={particlesState.enabled} onChange={v => setParticlesState(p => ({ ...p, enabled: v }))} />

            <PropertySection title="Particles" expanded={true} onToggle={() => {}}>
              <div style={styles.propRow}>
                <span style={styles.propLabel}>Type</span>
                <select
                  value={particlesState.type}
                  onChange={e => setParticlesState(p => ({ ...p, type: e.target.value as typeof particlesState.type, enabled: true }))}
                  style={styles.select}
                >
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

            <PropertySection title="Color" expanded={true} onToggle={() => {}}>
              <ColorRow label="Background" value={backgroundState.color} onChange={v => setBackgroundState(p => ({ ...p, color: v, enabled: true }))} />
              <ToggleRow label="Gradient" value={backgroundState.gradientEnabled} onChange={v => setBackgroundState(p => ({ ...p, gradientEnabled: v, enabled: true }))} />
              {backgroundState.gradientEnabled && (
                <>
                  <ColorRow label="Top" value={backgroundState.gradientTop} onChange={v => setBackgroundState(p => ({ ...p, gradientTop: v }))} />
                  <ColorRow label="Bottom" value={backgroundState.gradientBottom} onChange={v => setBackgroundState(p => ({ ...p, gradientBottom: v }))} />
                </>
              )}
            </PropertySection>

            <PropertySection title="Effects" expanded={true} onToggle={() => {}}>
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
        <a href="/" style={styles.homeBtn}><Home size={18} /></a>

        <div style={styles.toolbarDivider} />

        <button style={{ ...styles.toolBtn, ...(playing ? styles.toolBtnActive : {}) }} onClick={() => setPlaying(!playing)}>
          {playing ? <Pause size={16} /> : <Play size={16} />}
        </button>

        <button style={styles.toolBtn} onClick={() => setScroll(0)}>
          <RefreshCw size={16} />
        </button>

        <div style={styles.toolbarDivider} />

        {/* Presets dropdown */}
        <div style={{ position: 'relative' }}>
          <button style={styles.presetBtn} onClick={() => setShowPresets(!showPresets)}>
            Jump to <ChevronDown size={14} />
          </button>
          {showPresets && (
            <div style={styles.presetMenu}>
              {presets.map(p => (
                <button key={p.name} style={styles.presetItem} onClick={() => { setScroll(p.scroll); setShowPresets(false) }}>
                  {p.name}
                  <span style={styles.presetPercent}>{(p.scroll * 100).toFixed(0)}%</span>
                </button>
              ))}
            </div>
          )}
        </div>

        <div style={{ flex: 1 }} />

        <div style={styles.scrollDisplay}>{(scroll * 100).toFixed(1)}%</div>
      </div>

      {/* Main Content */}
      <div style={styles.main}>
        {/* Canvas / Preview */}
        <div style={styles.canvas}>
          <iframe
            ref={iframeRef}
            src="/?debug=true"
            style={styles.iframe}
            onLoad={() => {
              setIframeReady(true)
              syncScrollToIframe(scroll)
            }}
          />
          {!iframeReady && (
            <div style={styles.loading}>Loading preview...</div>
          )}
        </div>

        {/* Right Panel - Figma Style */}
        <div style={styles.rightPanel}>
          {/* Layers Section */}
          <div style={styles.layersSection}>
            <div style={styles.panelTitle}>
              <Layers size={14} />
              <span>Layers</span>
            </div>
            <div style={styles.layersList}>
              {layers.map(layer => {
                const Icon = layer.icon
                const isSelected = selectedComponent === layer.id
                return (
                  <button
                    key={layer.id}
                    style={{
                      ...styles.layerItem,
                      backgroundColor: isSelected ? `${layer.color}22` : 'transparent',
                      borderLeft: isSelected ? `2px solid ${layer.color}` : '2px solid transparent',
                    }}
                    onClick={() => setSelectedComponent(layer.id)}
                  >
                    <Icon size={14} style={{ color: layer.color }} />
                    <span style={{ color: isSelected ? '#fff' : c.muted }}>{layer.name}</span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Properties Section */}
          <div style={styles.propertiesSection}>
            <div style={styles.panelTitle}>
              <Palette size={14} style={{ color: selectedLayer?.color }} />
              <span style={{ color: selectedLayer?.color }}>{selectedLayer?.name}</span>
            </div>
            <div style={styles.propertiesContent}>
              {renderProperties()}
            </div>
          </div>
        </div>
      </div>

      {/* Timeline */}
      <div style={styles.timeline}>
        <div style={styles.timelineTrack}
          ref={timelineRef}
          onClick={handleTimeline}
          onMouseDown={(e) => {
            handleTimeline(e)
            const move = (ev: MouseEvent) => handleTimeline(ev as unknown as React.MouseEvent)
            const up = () => {
              window.removeEventListener('mousemove', move)
              window.removeEventListener('mouseup', up)
            }
            window.addEventListener('mousemove', move)
            window.addEventListener('mouseup', up)
          }}
        >
          {/* Section markers */}
          {presets.map((p) => (
            <div key={p.name} style={{
              position: 'absolute',
              left: `${p.scroll * 100}%`,
              top: 0,
              bottom: 0,
              borderLeft: `1px dashed ${c.border}`,
            }}>
              <span style={styles.timelineMarker}>{p.name}</span>
            </div>
          ))}

          {/* Playhead */}
          <div style={{ ...styles.playhead, left: `${scroll * 100}%` }}>
            <div style={styles.playheadLine} />
            <div style={styles.playheadHandle} />
          </div>
        </div>

        {/* Time markers */}
        <div style={styles.timeMarkers}>
          {[0, 25, 50, 75, 100].map(p => (
            <span key={p} style={styles.timeMarker}>{p}%</span>
          ))}
        </div>
      </div>
    </div>
  )
}

const styles: Record<string, CSSProperties> = {
  page: {
    height: '100vh',
    display: 'flex',
    flexDirection: 'column',
    backgroundColor: c.bg,
    fontFamily: 'Inter, -apple-system, sans-serif',
    color: c.text,
    overflow: 'hidden',
  },

  // Toolbar
  toolbar: {
    height: 48,
    backgroundColor: c.panel,
    borderBottom: `1px solid ${c.border}`,
    display: 'flex',
    alignItems: 'center',
    padding: '0 12px',
    gap: 8,
  },
  homeBtn: {
    width: 32,
    height: 32,
    borderRadius: 6,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: c.muted,
    textDecoration: 'none',
    transition: 'all 0.15s',
  },
  toolbarDivider: {
    width: 1,
    height: 24,
    backgroundColor: c.border,
    margin: '0 4px',
  },
  toolBtn: {
    width: 32,
    height: 32,
    borderRadius: 6,
    border: 'none',
    background: 'transparent',
    color: c.muted,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    transition: 'all 0.15s',
  },
  toolBtnActive: {
    backgroundColor: c.accent,
    color: '#fff',
  },
  presetBtn: {
    height: 32,
    padding: '0 12px',
    borderRadius: 6,
    border: 'none',
    background: 'transparent',
    color: c.muted,
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    cursor: 'pointer',
    fontSize: 12,
  },
  presetMenu: {
    position: 'absolute',
    top: '100%',
    left: 0,
    marginTop: 4,
    backgroundColor: c.panel,
    border: `1px solid ${c.border}`,
    borderRadius: 8,
    overflow: 'hidden',
    zIndex: 100,
    minWidth: 160,
    boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
  },
  presetItem: {
    width: '100%',
    padding: '10px 12px',
    border: 'none',
    background: 'transparent',
    color: c.text,
    textAlign: 'left',
    cursor: 'pointer',
    fontSize: 12,
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  presetPercent: {
    color: c.muted,
    fontSize: 11,
    fontFamily: 'monospace',
  },
  scrollDisplay: {
    padding: '6px 12px',
    borderRadius: 6,
    backgroundColor: c.card,
    fontFamily: 'JetBrains Mono, monospace',
    fontSize: 12,
    color: c.accent,
  },

  // Main
  main: {
    flex: 1,
    display: 'flex',
    minHeight: 0,
  },

  // Canvas
  canvas: {
    flex: 1,
    position: 'relative',
    backgroundColor: '#0a0a0a',
  },
  iframe: {
    width: '100%',
    height: '100%',
    border: 'none',
  },
  loading: {
    position: 'absolute',
    inset: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: c.muted,
    fontSize: 14,
  },

  // Right Panel
  rightPanel: {
    width: 280,
    backgroundColor: c.panel,
    borderLeft: `1px solid ${c.border}`,
    display: 'flex',
    flexDirection: 'column',
  },

  // Layers Section
  layersSection: {
    borderBottom: `1px solid ${c.border}`,
  },
  panelTitle: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    padding: '12px 16px',
    fontSize: 11,
    fontWeight: 600,
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    color: c.muted,
  },
  layersList: {
    padding: '0 8px 8px',
  },
  layerItem: {
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    padding: '8px 12px',
    borderRadius: 6,
    border: 'none',
    background: 'transparent',
    cursor: 'pointer',
    fontSize: 12,
    textAlign: 'left',
    transition: 'all 0.15s',
  },

  // Properties Section
  propertiesSection: {
    flex: 1,
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
  },
  propertiesContent: {
    flex: 1,
    overflowY: 'auto',
    padding: '0 12px 12px',
  },

  // Property Section
  propertySection: {
    marginBottom: 8,
  },
  sectionHeader: {
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    padding: '8px 4px',
    border: 'none',
    background: 'transparent',
    color: c.muted,
    fontSize: 11,
    fontWeight: 600,
    cursor: 'pointer',
    textTransform: 'uppercase',
    letterSpacing: '0.03em',
  },
  sectionContent: {
    paddingLeft: 8,
  },

  // Property Row
  propRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  propLabel: {
    width: 80,
    fontSize: 11,
    color: c.muted,
    flexShrink: 0,
  },
  propValue: {
    width: 45,
    fontSize: 11,
    color: c.text,
    fontFamily: 'JetBrains Mono, monospace',
    textAlign: 'right',
  },
  slider: {
    flex: 1,
    height: 4,
    accentColor: c.accent,
  },
  toggle: {
    padding: '4px 10px',
    borderRadius: 4,
    border: 'none',
    fontSize: 10,
    fontWeight: 600,
    cursor: 'pointer',
    color: '#fff',
  },
  textInput: {
    flex: 1,
    padding: '6px 8px',
    borderRadius: 4,
    border: `1px solid ${c.border}`,
    backgroundColor: c.card,
    color: c.text,
    fontSize: 11,
  },
  select: {
    flex: 1,
    padding: '6px 8px',
    borderRadius: 4,
    border: `1px solid ${c.border}`,
    backgroundColor: c.card,
    color: c.text,
    fontSize: 11,
    cursor: 'pointer',
  },
  colorInput: {
    width: 24,
    height: 24,
    padding: 0,
    border: `1px solid ${c.border}`,
    borderRadius: 4,
    cursor: 'pointer',
  },
  divider: {
    height: 1,
    backgroundColor: c.border,
    margin: '8px 0',
  },

  // Timeline
  timeline: {
    height: 80,
    backgroundColor: c.panel,
    borderTop: `1px solid ${c.border}`,
    padding: '12px 16px',
  },
  timelineTrack: {
    position: 'relative',
    height: 40,
    backgroundColor: c.card,
    borderRadius: 6,
    cursor: 'pointer',
    overflow: 'hidden',
  },
  timelineMarker: {
    position: 'absolute',
    top: 4,
    left: 4,
    fontSize: 9,
    color: c.dim,
    whiteSpace: 'nowrap',
  },
  playhead: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 2,
    zIndex: 10,
  },
  playheadLine: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: '50%',
    width: 2,
    marginLeft: -1,
    backgroundColor: c.accent,
  },
  playheadHandle: {
    position: 'absolute',
    top: -4,
    left: '50%',
    width: 10,
    height: 10,
    marginLeft: -5,
    backgroundColor: c.accent,
    borderRadius: '50%',
    boxShadow: `0 0 8px ${c.accent}`,
  },
  timeMarkers: {
    display: 'flex',
    justifyContent: 'space-between',
    marginTop: 6,
  },
  timeMarker: {
    fontSize: 10,
    color: c.dim,
    fontFamily: 'JetBrains Mono, monospace',
  },
}
