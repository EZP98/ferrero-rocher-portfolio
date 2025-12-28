import { useState, useRef, CSSProperties, useEffect, useCallback } from 'react'
import { Play, Pause, Home, Download, RefreshCw, ChevronDown, Sliders, X, Plus, Trash2, Diamond } from 'lucide-react'

// Keyframe type
interface Keyframe {
  id: string
  scroll: number
  values: Record<string, unknown>
}

// Keyframes per component
interface KeyframeTrack {
  ferrero: Keyframe[]
  title: Keyframe[]
  cards: Keyframe[]
  lighting: Keyframe[]
}

// Colors
const c = {
  bg: '#0a0a0a',
  card: '#141414',
  border: 'rgba(255,255,255,0.08)',
  text: '#fff',
  muted: 'rgba(255,255,255,0.5)',
  dim: 'rgba(255,255,255,0.3)',
  accent: '#8b5cf6',
  gold: '#d4a853',
  red: '#ef4444',
  green: '#22c55e',
  blue: '#3b82f6',
}

// Animation presets for quick testing
const presets = [
  { name: 'Hero Start', scroll: 0.05 },
  { name: 'La Copertura', scroll: 0.22 },
  { name: 'Il Cuore', scroll: 0.37 },
  { name: "L'Eleganza", scroll: 0.52 },
  { name: 'Transition Start', scroll: 0.62 },
  { name: 'Transition Mid', scroll: 0.80 },
  { name: 'End', scroll: 0.98 },
]

// Speed presets (scroll increment per 16ms frame)
const speedOptions = [
  { label: '0.25x', value: 0.00004 },
  { label: '0.5x', value: 0.00008 },
  { label: '1x', value: 0.00015 },
  { label: '2x', value: 0.0003 },
  { label: '4x', value: 0.0006 },
]

export function DebugPage() {
  const [scroll, setScroll] = useState(0)
  const [playing, setPlaying] = useState(false)
  const [showPresets, setShowPresets] = useState(false)
  const [speed, setSpeed] = useState(0.00015) // 1x default
  const [showSpeed, setShowSpeed] = useState(false)
  const [showControls, setShowControls] = useState(false)
  const [activeTab, setActiveTab] = useState<'ferrero' | 'title' | 'cards' | 'lighting' | 'effects' | 'camera' | 'particles' | 'background'>('ferrero')

  // Component debug states
  const [ferreroState, setFerreroState] = useState({
    enabled: false,
    rotX: 0, rotY: 0, rotZ: 0,
    posX: 0, posY: 0, posZ: 0,
    scale: 2.2,
    // Animation effects
    autoRotate: false,
    autoRotateSpeed: 1,
    floatEnabled: false,
    floatAmplitude: 0.2,
    floatSpeed: 1,
    bounceEnabled: false,
    bounceAmplitude: 0.1,
    bounceSpeed: 2,
    // Material properties
    metalness: 0.8,
    roughness: 0.2,
    emissiveIntensity: 0,
    emissiveColor: '#d4a853',
    wireframe: false,
    // Visual effects
    explodeEnabled: false,
    explodeAmount: 0,
  })
  const [titleState, setTitleState] = useState({
    enabled: false,
    opacity: 1,
    fadeSpeed: 7,
    titleText: 'FERRERO ROCHER',
    subtitleText: "L'arte del cioccolato",
    glowEnabled: false,
    glowColor: '#d4a853',
    glowIntensity: 10,
    animateEnabled: false,
    animationType: 'none' as 'none' | 'pulse' | 'wave' | 'typewriter',
  })
  const [cardsState, setCardsState] = useState({
    enabled: false,
    globalOpacity: 1,
    backgroundColor: 'rgba(20, 20, 20, 0.85)',
    borderColor: 'rgba(255, 255, 255, 0.08)',
    accentColor: '#d4a853',
    padding: 28,
    borderRadius: 20,
    blur: 20,
    glowEnabled: false,
    glowColor: '#d4a853',
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
    topLightEnabled: false,
    topLightIntensity: 2,
    topLightColor: '#FFD700',
    bottomLightEnabled: false,
    bottomLightIntensity: 1,
    bottomLightColor: '#5A3A28',
  })
  const [postProcessingState, setPostProcessingState] = useState({
    enabled: false,
    bloomEnabled: false,
    bloomIntensity: 1,
    bloomThreshold: 0.8,
    bloomRadius: 0.4,
    vignetteEnabled: false,
    vignetteIntensity: 0.5,
    vignetteOffset: 0.5,
    chromaticAberrationEnabled: false,
    chromaticAberrationOffset: 0.002,
    noiseEnabled: false,
    noiseIntensity: 0.1,
  })
  const [cameraState, setCameraState] = useState({
    enabled: false,
    fov: 35,
    positionX: 0,
    positionY: 0,
    positionZ: 10,
    targetX: 0,
    targetY: 0,
    targetZ: 0,
    autoOrbit: false,
    orbitSpeed: 0.5,
  })
  const [particlesState, setParticlesState] = useState({
    enabled: false,
    count: 100,
    size: 0.02,
    color: '#d4a853',
    speed: 0.5,
    spread: 10,
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
    starsCount: 200,
    starsSpeed: 0.1,
  })

  // Keyframe animation system
  const [keyframes, setKeyframes] = useState<KeyframeTrack>({
    ferrero: [],
    title: [],
    cards: [],
    lighting: [],
  })
  const [showAdvancedTimeline, setShowAdvancedTimeline] = useState(false)
  const [selectedKeyframe, setSelectedKeyframe] = useState<string | null>(null)

  const timelineRef = useRef<HTMLDivElement>(null)
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const [iframeReady, setIframeReady] = useState(false)
  const [ferreroLive, setFerreroLive] = useState<{
    rotX: number
    rotY: number
    rotZ: number
    posX: number
    posY: number
    posZ: number
    scale: number
    scrollProgress: number
    activeCard: string | null
  } | null>(null)

  // Code structure from iframe
  const [codeStructure, setCodeStructure] = useState<{
    sections: { id: string; name: string; component: string; file: string; height: string; scrollRange: string }[]
    cards: { id: number; title: string; startScroll: number; endScroll: number; position: string }[]
    ferreroStages: { name: string; range: string; rotX: number | string; rotY: number | string; posX: number | string }[]
  } | null>(null)

  // Listen for messages from iframe
  useEffect(() => {
    const handler = (event: MessageEvent) => {
      if (event.data?.type === 'FERRERO_STATE') {
        setFerreroLive(event.data.state)
      }
      if (event.data?.type === 'CODE_STRUCTURE') {
        setCodeStructure(event.data.data)
      }
      // Handle component selection from iframe clicks
      if (event.data?.type === 'COMPONENT_SELECTED') {
        const componentId = event.data.componentId as 'ferrero' | 'title' | 'cards' | 'lighting'
        setActiveTab(componentId)
        setShowControls(true)
        // Auto-enable override for the selected component
        if (componentId === 'ferrero') {
          setFerreroState(prev => ({ ...prev, enabled: true }))
        } else if (componentId === 'title') {
          setTitleState(prev => ({ ...prev, enabled: true }))
        } else if (componentId === 'cards') {
          setCardsState(prev => ({ ...prev, enabled: true }))
        } else if (componentId === 'lighting') {
          setLightingState(prev => ({ ...prev, enabled: true }))
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

  // When component states change, send to iframe
  useEffect(() => {
    sendDebugUpdate('ferrero', ferreroState)
  }, [ferreroState, sendDebugUpdate])

  useEffect(() => {
    sendDebugUpdate('title', titleState)
  }, [titleState, sendDebugUpdate])

  useEffect(() => {
    sendDebugUpdate('cards', cardsState)
  }, [cardsState, sendDebugUpdate])

  useEffect(() => {
    sendDebugUpdate('lighting', lightingState)
  }, [lightingState, sendDebugUpdate])

  useEffect(() => {
    sendDebugUpdate('postProcessing', postProcessingState)
  }, [postProcessingState, sendDebugUpdate])

  useEffect(() => {
    sendDebugUpdate('camera', cameraState)
  }, [cameraState, sendDebugUpdate])

  useEffect(() => {
    sendDebugUpdate('particles', particlesState)
  }, [particlesState, sendDebugUpdate])

  useEffect(() => {
    sendDebugUpdate('background', backgroundState)
  }, [backgroundState, sendDebugUpdate])


  // Sync scroll to iframe
  const syncScrollToIframe = useCallback((scrollValue: number) => {
    if (!iframeRef.current?.contentWindow?.document) return
    const doc = iframeRef.current.contentWindow.document
    const maxScroll = doc.documentElement.scrollHeight - iframeRef.current.contentWindow.innerHeight
    iframeRef.current.contentWindow.scrollTo(0, scrollValue * maxScroll)
  }, [])

  // When scroll changes, sync to iframe
  useEffect(() => {
    if (iframeReady) {
      syncScrollToIframe(scroll)
    }
  }, [scroll, iframeReady, syncScrollToIframe])

  // Play animation with selected speed
  useEffect(() => {
    if (!playing) return
    const i = setInterval(() => setScroll(p => p >= 1 ? (setPlaying(false), 0) : p + speed), 16)
    return () => clearInterval(i)
  }, [playing, speed])

  // Timeline click/drag
  const handleTimeline = (e: React.MouseEvent) => {
    if (!timelineRef.current) return
    const rect = timelineRef.current.getBoundingClientRect()
    setScroll(Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width)))
  }

  // Add keyframe at current scroll position
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

  // Remove keyframe
  const removeKeyframe = useCallback((track: keyof KeyframeTrack, id: string) => {
    setKeyframes(prev => ({
      ...prev,
      [track]: prev[track].filter(k => k.id !== id)
    }))
    if (selectedKeyframe === id) setSelectedKeyframe(null)
  }, [selectedKeyframe])

  // Jump to keyframe
  const jumpToKeyframe = useCallback((kf: Keyframe) => {
    setScroll(kf.scroll)
    setSelectedKeyframe(kf.id)
  }, [])

  // Interpolate between two values
  const lerp = (a: number, b: number, t: number) => a + (b - a) * t

  // Interpolate keyframes for a track at current scroll position
  const interpolateTrack = useCallback((track: Keyframe[], currentScroll: number): Record<string, unknown> | null => {
    if (track.length === 0) return null
    if (track.length === 1) return track[0].values

    // Find surrounding keyframes
    let before: Keyframe | null = null
    let after: Keyframe | null = null

    for (const kf of track) {
      if (kf.scroll <= currentScroll) before = kf
      if (kf.scroll > currentScroll && !after) after = kf
    }

    // Edge cases
    if (!before) return track[0].values
    if (!after) return before.values

    // Calculate interpolation factor (0-1)
    const t = (currentScroll - before.scroll) / (after.scroll - before.scroll)

    // Interpolate numeric values
    const result: Record<string, unknown> = {}
    for (const key of Object.keys(before.values)) {
      const valA = before.values[key]
      const valB = after.values[key]

      if (typeof valA === 'number' && typeof valB === 'number') {
        result[key] = lerp(valA, valB, t)
      } else if (typeof valA === 'boolean') {
        // For booleans, use "before" value until halfway, then "after"
        result[key] = t < 0.5 ? valA : valB
      } else {
        // For strings/other, use "before" until we pass the keyframe
        result[key] = t < 0.5 ? valA : valB
      }
    }
    return result
  }, [])

  // Auto-apply interpolated keyframes when playing
  useEffect(() => {
    if (!showAdvancedTimeline) return

    // Interpolate each track and apply
    const ferreroInterp = interpolateTrack(keyframes.ferrero, scroll)
    const titleInterp = interpolateTrack(keyframes.title, scroll)
    const cardsInterp = interpolateTrack(keyframes.cards, scroll)
    const lightingInterp = interpolateTrack(keyframes.lighting, scroll)

    if (ferreroInterp && keyframes.ferrero.length > 0) {
      setFerreroState(prev => ({ ...prev, ...(ferreroInterp as Partial<typeof prev>), enabled: true }))
    }
    if (titleInterp && keyframes.title.length > 0) {
      setTitleState(prev => ({ ...prev, ...(titleInterp as Partial<typeof prev>), enabled: true }))
    }
    if (cardsInterp && keyframes.cards.length > 0) {
      setCardsState(prev => ({ ...prev, ...(cardsInterp as Partial<typeof prev>), enabled: true }))
    }
    if (lightingInterp && keyframes.lighting.length > 0) {
      setLightingState(prev => ({ ...prev, ...(lightingInterp as Partial<typeof prev>), enabled: true }))
    }
  }, [scroll, showAdvancedTimeline, keyframes, interpolateTrack])

  const handleExport = () => {
    const currentSection = codeStructure?.sections.find(s => {
      const start = parseFloat(s.scrollRange.split('-')[0]) / 100
      const end = parseFloat(s.scrollRange.split('-')[1].replace('%', '')) / 100
      return scroll >= start && scroll < end
    })
    const data = {
      scroll,
      section: currentSection?.name,
      card: ferreroLive?.activeCard,
      ferreroState: ferreroLive,
      timestamp: new Date().toISOString(),
    }
    navigator.clipboard.writeText(JSON.stringify(data, null, 2))
    alert('Scroll state copied!')
  }

  return (
    <div style={styles.page}>
      {/* Toolbar */}
      <div style={styles.toolbar}>
        <a href="/" style={styles.homeBtn}><Home size={18} /></a>

        <button
          style={{ ...styles.btn, ...(playing ? styles.btnActive : {}) }}
          onClick={() => setPlaying(!playing)}
        >
          {playing ? <Pause size={16} /> : <Play size={16} />}
        </button>

        <div style={styles.presetWrap}>
          <button style={styles.presetBtn} onClick={() => setShowPresets(!showPresets)}>
            Jump to <ChevronDown size={14} />
          </button>
          {showPresets && (
            <div style={styles.presetMenu}>
              {presets.map(p => (
                <button
                  key={p.name}
                  style={styles.presetItem}
                  onClick={() => { setScroll(p.scroll); setShowPresets(false) }}
                >
                  {p.name} ({(p.scroll * 100).toFixed(0)}%)
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Speed selector */}
        <div style={styles.presetWrap}>
          <button style={styles.presetBtn} onClick={() => setShowSpeed(!showSpeed)}>
            Speed: {speedOptions.find(s => s.value === speed)?.label || '1x'} <ChevronDown size={14} />
          </button>
          {showSpeed && (
            <div style={styles.presetMenu}>
              {speedOptions.map(s => (
                <button
                  key={s.label}
                  style={{
                    ...styles.presetItem,
                    backgroundColor: s.value === speed ? c.accent + '33' : 'transparent',
                  }}
                  onClick={() => { setSpeed(s.value); setShowSpeed(false) }}
                >
                  {s.label}
                </button>
              ))}
            </div>
          )}
        </div>

        <button style={styles.btn} onClick={handleExport}><Download size={16} /></button>
        <button style={styles.btn} onClick={() => setScroll(0)}><RefreshCw size={16} /></button>

        {/* Ferrero Controls toggle */}
        <button
          style={{ ...styles.btn, ...(showControls ? styles.btnActive : {}) }}
          onClick={() => setShowControls(!showControls)}
          title="Ferrero Controls"
        >
          <Sliders size={16} />
        </button>

        <div style={styles.spacer} />

        <div style={styles.scrollDisplay}>{(scroll * 100).toFixed(1)}%</div>
      </div>

      {/* Main content */}
      <div style={styles.main}>
        {/* Left: Sections from iframe */}
        <div style={styles.pagePreview}>
          {/* Sections */}
          <div style={styles.previewLabel}>SECTIONS</div>
          <div style={styles.sectionList}>
            {codeStructure ? (
              codeStructure.sections.map(sec => {
                const start = parseFloat(sec.scrollRange.split('-')[0]) / 100
                const end = parseFloat(sec.scrollRange.split('-')[1].replace('%', '')) / 100
                const isActive = scroll >= start && scroll < end
                return (
                  <div
                    key={sec.id}
                    style={{
                      ...styles.sectionItem,
                      backgroundColor: isActive ? `${c.accent}22` : 'transparent',
                      borderColor: isActive ? c.accent : c.border,
                    }}
                    onClick={() => setScroll((start + end) / 2)}
                  >
                    <div style={styles.sectionHeader}>
                      <span style={styles.sectionName}>{sec.name}</span>
                      <span style={styles.sectionFile}>{sec.file}</span>
                    </div>
                    <span style={styles.sectionRange}>{sec.scrollRange}</span>
                  </div>
                )
              })
            ) : (
              <div style={styles.loadingText}>Loading from iframe...</div>
            )}
          </div>

          {/* Info Cards */}
          <div style={{ marginTop: 16 }}>
            <div style={styles.previewLabel}>INFO CARDS</div>
            <div style={styles.sectionList}>
              {codeStructure ? (
                codeStructure.cards.map(card => {
                  const isActive = scroll >= card.startScroll && scroll < card.endScroll
                  return (
                    <div
                      key={card.id}
                      style={{
                        ...styles.sectionItem,
                        backgroundColor: isActive ? `${c.gold}22` : 'transparent',
                        borderColor: isActive ? c.gold : c.border,
                      }}
                      onClick={() => setScroll((card.startScroll + card.endScroll) / 2)}
                    >
                      <span style={styles.sectionName}>{card.title}</span>
                      <span style={styles.sectionRange}>
                        {(card.startScroll * 100).toFixed(0)}-{(card.endScroll * 100).toFixed(0)}%
                      </span>
                    </div>
                  )
                })
              ) : (
                <div style={styles.loadingText}>Loading...</div>
              )}
            </div>
          </div>

          {/* Live Ferrero Data */}
          {ferreroLive && (
            <div style={styles.liveData}>
              <div style={styles.previewLabel}>LIVE DATA</div>

              {ferreroLive.activeCard && (
                <div style={styles.liveCard}>
                  <span style={styles.liveCardLabel}>Card:</span>
                  <span style={styles.liveCardValue}>{ferreroLive.activeCard}</span>
                </div>
              )}

              <div style={styles.liveGroup}>
                <span style={styles.liveGroupLabel}>Rotation</span>
                <div style={styles.liveRow}>
                  <span>X:</span><span style={styles.liveValue}>{ferreroLive.rotX.toFixed(2)}</span>
                </div>
                <div style={styles.liveRow}>
                  <span>Y:</span><span style={styles.liveValue}>{ferreroLive.rotY.toFixed(2)}</span>
                </div>
                <div style={styles.liveRow}>
                  <span>Z:</span><span style={styles.liveValue}>{ferreroLive.rotZ.toFixed(2)}</span>
                </div>
              </div>

              <div style={styles.liveGroup}>
                <span style={styles.liveGroupLabel}>Position</span>
                <div style={styles.liveRow}>
                  <span>X:</span><span style={styles.liveValue}>{ferreroLive.posX.toFixed(2)}</span>
                </div>
                <div style={styles.liveRow}>
                  <span>Y:</span><span style={styles.liveValue}>{ferreroLive.posY.toFixed(2)}</span>
                </div>
                <div style={styles.liveRow}>
                  <span>Z:</span><span style={styles.liveValue}>{ferreroLive.posZ.toFixed(2)}</span>
                </div>
              </div>

              <div style={styles.liveGroup}>
                <span style={styles.liveGroupLabel}>Scale</span>
                <div style={styles.liveRow}>
                  <span style={styles.liveValue}>{ferreroLive.scale.toFixed(2)}</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right: ACTUAL Frontend in iframe */}
        <div style={styles.preview3d}>
          <iframe
            ref={iframeRef}
            src="/?debug=true"
            style={{
              width: '100%',
              height: '100%',
              border: 'none',
              backgroundColor: c.bg,
            }}
            onLoad={() => {
              setIframeReady(true)
              // Initial sync
              syncScrollToIframe(scroll)
            }}
          />
          {!iframeReady && (
            <div style={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: c.muted,
            }}>
              Loading...
            </div>
          )}

          {/* Component Control Panel */}
          {showControls && (
            <div style={styles.controlPanel}>
              <div style={styles.controlHeader}>
                <span style={styles.controlTitle}>Component Controls</span>
                <button style={styles.closeBtn} onClick={() => setShowControls(false)}>
                  <X size={14} />
                </button>
              </div>

              {/* Tabs - Two Rows */}
              <div style={{ marginBottom: 8 }}>
                <div style={styles.tabBar}>
                  {(['ferrero', 'title', 'cards', 'lighting'] as const).map(tab => (
                    <button
                      key={tab}
                      style={{
                        ...styles.tab,
                        backgroundColor: activeTab === tab ? c.accent : 'transparent',
                        color: activeTab === tab ? '#fff' : c.muted,
                      }}
                      onClick={() => setActiveTab(tab)}
                    >
                      {tab.charAt(0).toUpperCase() + tab.slice(1)}
                    </button>
                  ))}
                </div>
                <div style={{ ...styles.tabBar, marginTop: 4 }}>
                  {(['effects', 'camera', 'particles', 'background'] as const).map(tab => (
                    <button
                      key={tab}
                      style={{
                        ...styles.tab,
                        backgroundColor: activeTab === tab ? c.gold : 'transparent',
                        color: activeTab === tab ? '#000' : c.muted,
                      }}
                      onClick={() => setActiveTab(tab)}
                    >
                      {tab.charAt(0).toUpperCase() + tab.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              {/* FERRERO TAB */}
              {activeTab === 'ferrero' && (
                <div style={styles.tabContent}>
                  <div style={styles.controlRow}>
                    <label style={styles.controlLabel}>Override</label>
                    <button
                      style={{ ...styles.toggleBtn, backgroundColor: ferreroState.enabled ? c.accent : c.bg }}
                      onClick={() => setFerreroState(prev => ({ ...prev, enabled: !prev.enabled }))}
                    >
                      {ferreroState.enabled ? 'ON' : 'OFF'}
                    </button>
                  </div>
                  <div style={{ opacity: ferreroState.enabled ? 1 : 0.4, pointerEvents: ferreroState.enabled ? 'auto' : 'none' }}>
                    {/* Transform */}
                    <div style={styles.controlGroup}>
                      <span style={styles.groupLabel}>Rotation</span>
                      {(['rotX', 'rotY', 'rotZ'] as const).map(key => (
                        <div key={key} style={styles.sliderRow}>
                          <span style={styles.sliderLabel}>{key}</span>
                          <input type="range" min={-Math.PI} max={Math.PI} step={0.01}
                            value={ferreroState[key]}
                            onChange={e => setFerreroState(prev => ({ ...prev, [key]: parseFloat(e.target.value) }))}
                            style={styles.slider} />
                          <span style={styles.sliderValue}>{ferreroState[key].toFixed(2)}</span>
                        </div>
                      ))}
                    </div>
                    <div style={styles.controlGroup}>
                      <span style={styles.groupLabel}>Position</span>
                      {(['posX', 'posY', 'posZ'] as const).map(key => (
                        <div key={key} style={styles.sliderRow}>
                          <span style={styles.sliderLabel}>{key}</span>
                          <input type="range" min={-5} max={5} step={0.1}
                            value={ferreroState[key]}
                            onChange={e => setFerreroState(prev => ({ ...prev, [key]: parseFloat(e.target.value) }))}
                            style={styles.slider} />
                          <span style={styles.sliderValue}>{ferreroState[key].toFixed(1)}</span>
                        </div>
                      ))}
                    </div>
                    <div style={styles.sliderRow}>
                      <span style={styles.sliderLabel}>Scale</span>
                      <input type="range" min={0.5} max={5} step={0.1}
                        value={ferreroState.scale}
                        onChange={e => setFerreroState(prev => ({ ...prev, scale: parseFloat(e.target.value) }))}
                        style={styles.slider} />
                      <span style={styles.sliderValue}>{ferreroState.scale.toFixed(1)}</span>
                    </div>

                    {/* Animation Effects */}
                    <div style={{ ...styles.controlGroup, marginTop: 12 }}>
                      <span style={styles.groupLabel}>Animation</span>
                      <div style={styles.controlRow}>
                        <span style={styles.sliderLabel}>Auto Rotate</span>
                        <button
                          style={{ ...styles.miniToggle, backgroundColor: ferreroState.autoRotate ? c.green : c.bg }}
                          onClick={() => setFerreroState(prev => ({ ...prev, autoRotate: !prev.autoRotate }))}
                        >{ferreroState.autoRotate ? 'ON' : 'OFF'}</button>
                      </div>
                      {ferreroState.autoRotate && (
                        <div style={styles.sliderRow}>
                          <span style={styles.sliderLabel}>Speed</span>
                          <input type="range" min={0.1} max={5} step={0.1}
                            value={ferreroState.autoRotateSpeed}
                            onChange={e => setFerreroState(prev => ({ ...prev, autoRotateSpeed: parseFloat(e.target.value) }))}
                            style={styles.slider} />
                          <span style={styles.sliderValue}>{ferreroState.autoRotateSpeed.toFixed(1)}</span>
                        </div>
                      )}
                      <div style={styles.controlRow}>
                        <span style={styles.sliderLabel}>Float</span>
                        <button
                          style={{ ...styles.miniToggle, backgroundColor: ferreroState.floatEnabled ? c.green : c.bg }}
                          onClick={() => setFerreroState(prev => ({ ...prev, floatEnabled: !prev.floatEnabled }))}
                        >{ferreroState.floatEnabled ? 'ON' : 'OFF'}</button>
                      </div>
                      {ferreroState.floatEnabled && (
                        <>
                          <div style={styles.sliderRow}>
                            <span style={styles.sliderLabel}>Amplitude</span>
                            <input type="range" min={0.05} max={1} step={0.05}
                              value={ferreroState.floatAmplitude}
                              onChange={e => setFerreroState(prev => ({ ...prev, floatAmplitude: parseFloat(e.target.value) }))}
                              style={styles.slider} />
                            <span style={styles.sliderValue}>{ferreroState.floatAmplitude.toFixed(2)}</span>
                          </div>
                          <div style={styles.sliderRow}>
                            <span style={styles.sliderLabel}>Speed</span>
                            <input type="range" min={0.1} max={3} step={0.1}
                              value={ferreroState.floatSpeed}
                              onChange={e => setFerreroState(prev => ({ ...prev, floatSpeed: parseFloat(e.target.value) }))}
                              style={styles.slider} />
                            <span style={styles.sliderValue}>{ferreroState.floatSpeed.toFixed(1)}</span>
                          </div>
                        </>
                      )}
                      <div style={styles.controlRow}>
                        <span style={styles.sliderLabel}>Bounce</span>
                        <button
                          style={{ ...styles.miniToggle, backgroundColor: ferreroState.bounceEnabled ? c.green : c.bg }}
                          onClick={() => setFerreroState(prev => ({ ...prev, bounceEnabled: !prev.bounceEnabled }))}
                        >{ferreroState.bounceEnabled ? 'ON' : 'OFF'}</button>
                      </div>
                    </div>

                    {/* Material Properties */}
                    <div style={{ ...styles.controlGroup, marginTop: 12 }}>
                      <span style={styles.groupLabel}>Material</span>
                      <div style={styles.sliderRow}>
                        <span style={styles.sliderLabel}>Metalness</span>
                        <input type="range" min={0} max={1} step={0.05}
                          value={ferreroState.metalness}
                          onChange={e => setFerreroState(prev => ({ ...prev, metalness: parseFloat(e.target.value) }))}
                          style={styles.slider} />
                        <span style={styles.sliderValue}>{ferreroState.metalness.toFixed(2)}</span>
                      </div>
                      <div style={styles.sliderRow}>
                        <span style={styles.sliderLabel}>Roughness</span>
                        <input type="range" min={0} max={1} step={0.05}
                          value={ferreroState.roughness}
                          onChange={e => setFerreroState(prev => ({ ...prev, roughness: parseFloat(e.target.value) }))}
                          style={styles.slider} />
                        <span style={styles.sliderValue}>{ferreroState.roughness.toFixed(2)}</span>
                      </div>
                      <div style={styles.sliderRow}>
                        <span style={styles.sliderLabel}>Emissive</span>
                        <input type="range" min={0} max={2} step={0.1}
                          value={ferreroState.emissiveIntensity}
                          onChange={e => setFerreroState(prev => ({ ...prev, emissiveIntensity: parseFloat(e.target.value) }))}
                          style={styles.slider} />
                        <span style={styles.sliderValue}>{ferreroState.emissiveIntensity.toFixed(1)}</span>
                      </div>
                      <div style={styles.colorRow}>
                        <span style={styles.sliderLabel}>Glow Color</span>
                        <input type="color" value={ferreroState.emissiveColor}
                          onChange={e => setFerreroState(prev => ({ ...prev, emissiveColor: e.target.value }))}
                          style={styles.colorInput} />
                      </div>
                      <div style={styles.controlRow}>
                        <span style={styles.sliderLabel}>Wireframe</span>
                        <button
                          style={{ ...styles.miniToggle, backgroundColor: ferreroState.wireframe ? c.blue : c.bg }}
                          onClick={() => setFerreroState(prev => ({ ...prev, wireframe: !prev.wireframe }))}
                        >{ferreroState.wireframe ? 'ON' : 'OFF'}</button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TITLE TAB */}
              {activeTab === 'title' && (
                <div style={styles.tabContent}>
                  <div style={styles.controlRow}>
                    <label style={styles.controlLabel}>Override</label>
                    <button
                      style={{ ...styles.toggleBtn, backgroundColor: titleState.enabled ? c.accent : c.bg }}
                      onClick={() => setTitleState(prev => ({ ...prev, enabled: !prev.enabled }))}
                    >
                      {titleState.enabled ? 'ON' : 'OFF'}
                    </button>
                  </div>
                  <div style={{ opacity: titleState.enabled ? 1 : 0.4, pointerEvents: titleState.enabled ? 'auto' : 'none' }}>
                    <div style={styles.sliderRow}>
                      <span style={styles.sliderLabel}>Opacity</span>
                      <input type="range" min={0} max={1} step={0.01}
                        value={titleState.opacity}
                        onChange={e => setTitleState(prev => ({ ...prev, opacity: parseFloat(e.target.value) }))}
                        style={styles.slider} />
                      <span style={styles.sliderValue}>{titleState.opacity.toFixed(2)}</span>
                    </div>
                    <div style={styles.sliderRow}>
                      <span style={styles.sliderLabel}>Fade Speed</span>
                      <input type="range" min={1} max={20} step={0.5}
                        value={titleState.fadeSpeed}
                        onChange={e => setTitleState(prev => ({ ...prev, fadeSpeed: parseFloat(e.target.value) }))}
                        style={styles.slider} />
                      <span style={styles.sliderValue}>{titleState.fadeSpeed.toFixed(1)}</span>
                    </div>
                    <div style={styles.inputRow}>
                      <span style={styles.sliderLabel}>Title</span>
                      <input type="text" value={titleState.titleText}
                        onChange={e => setTitleState(prev => ({ ...prev, titleText: e.target.value }))}
                        style={styles.textInput} />
                    </div>
                    <div style={styles.inputRow}>
                      <span style={styles.sliderLabel}>Subtitle</span>
                      <input type="text" value={titleState.subtitleText}
                        onChange={e => setTitleState(prev => ({ ...prev, subtitleText: e.target.value }))}
                        style={styles.textInput} />
                    </div>
                  </div>
                </div>
              )}

              {/* CARDS TAB */}
              {activeTab === 'cards' && (
                <div style={styles.tabContent}>
                  <div style={styles.controlRow}>
                    <label style={styles.controlLabel}>Override</label>
                    <button
                      style={{ ...styles.toggleBtn, backgroundColor: cardsState.enabled ? c.accent : c.bg }}
                      onClick={() => setCardsState(prev => ({ ...prev, enabled: !prev.enabled }))}
                    >
                      {cardsState.enabled ? 'ON' : 'OFF'}
                    </button>
                  </div>
                  <div style={{ opacity: cardsState.enabled ? 1 : 0.4, pointerEvents: cardsState.enabled ? 'auto' : 'none' }}>
                    <div style={styles.sliderRow}>
                      <span style={styles.sliderLabel}>Opacity</span>
                      <input type="range" min={0} max={1} step={0.01}
                        value={cardsState.globalOpacity}
                        onChange={e => setCardsState(prev => ({ ...prev, globalOpacity: parseFloat(e.target.value) }))}
                        style={styles.slider} />
                      <span style={styles.sliderValue}>{cardsState.globalOpacity.toFixed(2)}</span>
                    </div>
                    <div style={styles.sliderRow}>
                      <span style={styles.sliderLabel}>Padding</span>
                      <input type="range" min={8} max={64} step={2}
                        value={cardsState.padding}
                        onChange={e => setCardsState(prev => ({ ...prev, padding: parseFloat(e.target.value) }))}
                        style={styles.slider} />
                      <span style={styles.sliderValue}>{cardsState.padding}px</span>
                    </div>
                    <div style={styles.sliderRow}>
                      <span style={styles.sliderLabel}>Radius</span>
                      <input type="range" min={0} max={40} step={2}
                        value={cardsState.borderRadius}
                        onChange={e => setCardsState(prev => ({ ...prev, borderRadius: parseFloat(e.target.value) }))}
                        style={styles.slider} />
                      <span style={styles.sliderValue}>{cardsState.borderRadius}px</span>
                    </div>
                    <div style={styles.sliderRow}>
                      <span style={styles.sliderLabel}>Blur</span>
                      <input type="range" min={0} max={50} step={2}
                        value={cardsState.blur}
                        onChange={e => setCardsState(prev => ({ ...prev, blur: parseFloat(e.target.value) }))}
                        style={styles.slider} />
                      <span style={styles.sliderValue}>{cardsState.blur}px</span>
                    </div>
                    <div style={styles.colorRow}>
                      <span style={styles.sliderLabel}>Accent</span>
                      <input type="color" value={cardsState.accentColor}
                        onChange={e => setCardsState(prev => ({ ...prev, accentColor: e.target.value }))}
                        style={styles.colorInput} />
                    </div>
                  </div>
                </div>
              )}

              {/* LIGHTING TAB */}
              {activeTab === 'lighting' && (
                <div style={styles.tabContent}>
                  <div style={styles.controlRow}>
                    <label style={styles.controlLabel}>Override</label>
                    <button
                      style={{ ...styles.toggleBtn, backgroundColor: lightingState.enabled ? c.accent : c.bg }}
                      onClick={() => setLightingState(prev => ({ ...prev, enabled: !prev.enabled }))}
                    >
                      {lightingState.enabled ? 'ON' : 'OFF'}
                    </button>
                  </div>
                  <div style={{ opacity: lightingState.enabled ? 1 : 0.4, pointerEvents: lightingState.enabled ? 'auto' : 'none' }}>
                    <div style={styles.sliderRow}>
                      <span style={styles.sliderLabel}>Ambient</span>
                      <input type="range" min={0} max={2} step={0.05}
                        value={lightingState.ambientIntensity}
                        onChange={e => setLightingState(prev => ({ ...prev, ambientIntensity: parseFloat(e.target.value) }))}
                        style={styles.slider} />
                      <span style={styles.sliderValue}>{lightingState.ambientIntensity.toFixed(2)}</span>
                    </div>
                    <div style={styles.sliderRow}>
                      <span style={styles.sliderLabel}>Main Spot</span>
                      <input type="range" min={0} max={10} step={0.1}
                        value={lightingState.mainSpotIntensity}
                        onChange={e => setLightingState(prev => ({ ...prev, mainSpotIntensity: parseFloat(e.target.value) }))}
                        style={styles.slider} />
                      <span style={styles.sliderValue}>{lightingState.mainSpotIntensity.toFixed(1)}</span>
                    </div>
                    <div style={styles.colorRow}>
                      <span style={styles.sliderLabel}>Main Color</span>
                      <input type="color" value={lightingState.mainSpotColor}
                        onChange={e => setLightingState(prev => ({ ...prev, mainSpotColor: e.target.value }))}
                        style={styles.colorInput} />
                    </div>
                    <div style={styles.sliderRow}>
                      <span style={styles.sliderLabel}>Rim Light</span>
                      <input type="range" min={0} max={10} step={0.1}
                        value={lightingState.rimLightIntensity}
                        onChange={e => setLightingState(prev => ({ ...prev, rimLightIntensity: parseFloat(e.target.value) }))}
                        style={styles.slider} />
                      <span style={styles.sliderValue}>{lightingState.rimLightIntensity.toFixed(1)}</span>
                    </div>
                    <div style={styles.colorRow}>
                      <span style={styles.sliderLabel}>Rim Color</span>
                      <input type="color" value={lightingState.rimLightColor}
                        onChange={e => setLightingState(prev => ({ ...prev, rimLightColor: e.target.value }))}
                        style={styles.colorInput} />
                    </div>
                    <div style={styles.sliderRow}>
                      <span style={styles.sliderLabel}>Fill Light</span>
                      <input type="range" min={0} max={10} step={0.1}
                        value={lightingState.fillLightIntensity}
                        onChange={e => setLightingState(prev => ({ ...prev, fillLightIntensity: parseFloat(e.target.value) }))}
                        style={styles.slider} />
                      <span style={styles.sliderValue}>{lightingState.fillLightIntensity.toFixed(1)}</span>
                    </div>
                    <div style={styles.colorRow}>
                      <span style={styles.sliderLabel}>Fill Color</span>
                      <input type="color" value={lightingState.fillLightColor}
                        onChange={e => setLightingState(prev => ({ ...prev, fillLightColor: e.target.value }))}
                        style={styles.colorInput} />
                    </div>

                    {/* Additional Lights */}
                    <div style={{ ...styles.controlGroup, marginTop: 12 }}>
                      <span style={styles.groupLabel}>Extra Lights</span>
                      <div style={styles.controlRow}>
                        <span style={styles.sliderLabel}>Top Light</span>
                        <button
                          style={{ ...styles.miniToggle, backgroundColor: lightingState.topLightEnabled ? c.green : c.bg }}
                          onClick={() => setLightingState(prev => ({ ...prev, topLightEnabled: !prev.topLightEnabled }))}
                        >{lightingState.topLightEnabled ? 'ON' : 'OFF'}</button>
                      </div>
                      {lightingState.topLightEnabled && (
                        <>
                          <div style={styles.sliderRow}>
                            <span style={styles.sliderLabel}>Intensity</span>
                            <input type="range" min={0} max={10} step={0.1}
                              value={lightingState.topLightIntensity}
                              onChange={e => setLightingState(prev => ({ ...prev, topLightIntensity: parseFloat(e.target.value) }))}
                              style={styles.slider} />
                            <span style={styles.sliderValue}>{lightingState.topLightIntensity.toFixed(1)}</span>
                          </div>
                          <div style={styles.colorRow}>
                            <span style={styles.sliderLabel}>Color</span>
                            <input type="color" value={lightingState.topLightColor}
                              onChange={e => setLightingState(prev => ({ ...prev, topLightColor: e.target.value }))}
                              style={styles.colorInput} />
                          </div>
                        </>
                      )}
                      <div style={styles.controlRow}>
                        <span style={styles.sliderLabel}>Bottom Light</span>
                        <button
                          style={{ ...styles.miniToggle, backgroundColor: lightingState.bottomLightEnabled ? c.green : c.bg }}
                          onClick={() => setLightingState(prev => ({ ...prev, bottomLightEnabled: !prev.bottomLightEnabled }))}
                        >{lightingState.bottomLightEnabled ? 'ON' : 'OFF'}</button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* EFFECTS TAB (Post-Processing) */}
              {activeTab === 'effects' && (
                <div style={styles.tabContent}>
                  <div style={styles.controlRow}>
                    <label style={styles.controlLabel}>Enable Effects</label>
                    <button
                      style={{ ...styles.toggleBtn, backgroundColor: postProcessingState.enabled ? c.gold : c.bg }}
                      onClick={() => setPostProcessingState(prev => ({ ...prev, enabled: !prev.enabled }))}
                    >
                      {postProcessingState.enabled ? 'ON' : 'OFF'}
                    </button>
                  </div>
                  <div style={{ opacity: postProcessingState.enabled ? 1 : 0.4, pointerEvents: postProcessingState.enabled ? 'auto' : 'none' }}>
                    {/* Bloom */}
                    <div style={styles.controlGroup}>
                      <div style={styles.controlRow}>
                        <span style={styles.groupLabel}>Bloom</span>
                        <button
                          style={{ ...styles.miniToggle, backgroundColor: postProcessingState.bloomEnabled ? c.green : c.bg }}
                          onClick={() => setPostProcessingState(prev => ({ ...prev, bloomEnabled: !prev.bloomEnabled }))}
                        >{postProcessingState.bloomEnabled ? 'ON' : 'OFF'}</button>
                      </div>
                      {postProcessingState.bloomEnabled && (
                        <>
                          <div style={styles.sliderRow}>
                            <span style={styles.sliderLabel}>Intensity</span>
                            <input type="range" min={0} max={5} step={0.1}
                              value={postProcessingState.bloomIntensity}
                              onChange={e => setPostProcessingState(prev => ({ ...prev, bloomIntensity: parseFloat(e.target.value) }))}
                              style={styles.slider} />
                            <span style={styles.sliderValue}>{postProcessingState.bloomIntensity.toFixed(1)}</span>
                          </div>
                          <div style={styles.sliderRow}>
                            <span style={styles.sliderLabel}>Threshold</span>
                            <input type="range" min={0} max={1} step={0.05}
                              value={postProcessingState.bloomThreshold}
                              onChange={e => setPostProcessingState(prev => ({ ...prev, bloomThreshold: parseFloat(e.target.value) }))}
                              style={styles.slider} />
                            <span style={styles.sliderValue}>{postProcessingState.bloomThreshold.toFixed(2)}</span>
                          </div>
                          <div style={styles.sliderRow}>
                            <span style={styles.sliderLabel}>Radius</span>
                            <input type="range" min={0} max={1} step={0.05}
                              value={postProcessingState.bloomRadius}
                              onChange={e => setPostProcessingState(prev => ({ ...prev, bloomRadius: parseFloat(e.target.value) }))}
                              style={styles.slider} />
                            <span style={styles.sliderValue}>{postProcessingState.bloomRadius.toFixed(2)}</span>
                          </div>
                        </>
                      )}
                    </div>

                    {/* Vignette */}
                    <div style={styles.controlGroup}>
                      <div style={styles.controlRow}>
                        <span style={styles.groupLabel}>Vignette</span>
                        <button
                          style={{ ...styles.miniToggle, backgroundColor: postProcessingState.vignetteEnabled ? c.green : c.bg }}
                          onClick={() => setPostProcessingState(prev => ({ ...prev, vignetteEnabled: !prev.vignetteEnabled }))}
                        >{postProcessingState.vignetteEnabled ? 'ON' : 'OFF'}</button>
                      </div>
                      {postProcessingState.vignetteEnabled && (
                        <>
                          <div style={styles.sliderRow}>
                            <span style={styles.sliderLabel}>Darkness</span>
                            <input type="range" min={0} max={1} step={0.05}
                              value={postProcessingState.vignetteIntensity}
                              onChange={e => setPostProcessingState(prev => ({ ...prev, vignetteIntensity: parseFloat(e.target.value) }))}
                              style={styles.slider} />
                            <span style={styles.sliderValue}>{postProcessingState.vignetteIntensity.toFixed(2)}</span>
                          </div>
                          <div style={styles.sliderRow}>
                            <span style={styles.sliderLabel}>Offset</span>
                            <input type="range" min={0} max={1} step={0.05}
                              value={postProcessingState.vignetteOffset}
                              onChange={e => setPostProcessingState(prev => ({ ...prev, vignetteOffset: parseFloat(e.target.value) }))}
                              style={styles.slider} />
                            <span style={styles.sliderValue}>{postProcessingState.vignetteOffset.toFixed(2)}</span>
                          </div>
                        </>
                      )}
                    </div>

                    {/* Chromatic Aberration */}
                    <div style={styles.controlGroup}>
                      <div style={styles.controlRow}>
                        <span style={styles.groupLabel}>Chromatic</span>
                        <button
                          style={{ ...styles.miniToggle, backgroundColor: postProcessingState.chromaticAberrationEnabled ? c.green : c.bg }}
                          onClick={() => setPostProcessingState(prev => ({ ...prev, chromaticAberrationEnabled: !prev.chromaticAberrationEnabled }))}
                        >{postProcessingState.chromaticAberrationEnabled ? 'ON' : 'OFF'}</button>
                      </div>
                      {postProcessingState.chromaticAberrationEnabled && (
                        <div style={styles.sliderRow}>
                          <span style={styles.sliderLabel}>Offset</span>
                          <input type="range" min={0} max={0.02} step={0.001}
                            value={postProcessingState.chromaticAberrationOffset}
                            onChange={e => setPostProcessingState(prev => ({ ...prev, chromaticAberrationOffset: parseFloat(e.target.value) }))}
                            style={styles.slider} />
                          <span style={styles.sliderValue}>{postProcessingState.chromaticAberrationOffset.toFixed(3)}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* CAMERA TAB */}
              {activeTab === 'camera' && (
                <div style={styles.tabContent}>
                  <div style={styles.controlRow}>
                    <label style={styles.controlLabel}>Override Camera</label>
                    <button
                      style={{ ...styles.toggleBtn, backgroundColor: cameraState.enabled ? c.gold : c.bg }}
                      onClick={() => setCameraState(prev => ({ ...prev, enabled: !prev.enabled }))}
                    >
                      {cameraState.enabled ? 'ON' : 'OFF'}
                    </button>
                  </div>
                  <div style={{ opacity: cameraState.enabled ? 1 : 0.4, pointerEvents: cameraState.enabled ? 'auto' : 'none' }}>
                    <div style={styles.sliderRow}>
                      <span style={styles.sliderLabel}>FOV</span>
                      <input type="range" min={10} max={120} step={1}
                        value={cameraState.fov}
                        onChange={e => setCameraState(prev => ({ ...prev, fov: parseFloat(e.target.value) }))}
                        style={styles.slider} />
                      <span style={styles.sliderValue}>{cameraState.fov}</span>
                    </div>
                    <div style={styles.controlGroup}>
                      <span style={styles.groupLabel}>Position</span>
                      {(['positionX', 'positionY', 'positionZ'] as const).map(key => (
                        <div key={key} style={styles.sliderRow}>
                          <span style={styles.sliderLabel}>{key.replace('position', '')}</span>
                          <input type="range" min={-20} max={20} step={0.5}
                            value={cameraState[key]}
                            onChange={e => setCameraState(prev => ({ ...prev, [key]: parseFloat(e.target.value) }))}
                            style={styles.slider} />
                          <span style={styles.sliderValue}>{cameraState[key].toFixed(1)}</span>
                        </div>
                      ))}
                    </div>
                    <div style={styles.controlGroup}>
                      <span style={styles.groupLabel}>Look At</span>
                      {(['targetX', 'targetY', 'targetZ'] as const).map(key => (
                        <div key={key} style={styles.sliderRow}>
                          <span style={styles.sliderLabel}>{key.replace('target', '')}</span>
                          <input type="range" min={-10} max={10} step={0.5}
                            value={cameraState[key]}
                            onChange={e => setCameraState(prev => ({ ...prev, [key]: parseFloat(e.target.value) }))}
                            style={styles.slider} />
                          <span style={styles.sliderValue}>{cameraState[key].toFixed(1)}</span>
                        </div>
                      ))}
                    </div>
                    <div style={styles.controlRow}>
                      <span style={styles.sliderLabel}>Auto Orbit</span>
                      <button
                        style={{ ...styles.miniToggle, backgroundColor: cameraState.autoOrbit ? c.green : c.bg }}
                        onClick={() => setCameraState(prev => ({ ...prev, autoOrbit: !prev.autoOrbit }))}
                      >{cameraState.autoOrbit ? 'ON' : 'OFF'}</button>
                    </div>
                    {cameraState.autoOrbit && (
                      <div style={styles.sliderRow}>
                        <span style={styles.sliderLabel}>Speed</span>
                        <input type="range" min={0.1} max={2} step={0.1}
                          value={cameraState.orbitSpeed}
                          onChange={e => setCameraState(prev => ({ ...prev, orbitSpeed: parseFloat(e.target.value) }))}
                          style={styles.slider} />
                        <span style={styles.sliderValue}>{cameraState.orbitSpeed.toFixed(1)}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* PARTICLES TAB */}
              {activeTab === 'particles' && (
                <div style={styles.tabContent}>
                  <div style={styles.controlRow}>
                    <label style={styles.controlLabel}>Enable Particles</label>
                    <button
                      style={{ ...styles.toggleBtn, backgroundColor: particlesState.enabled ? c.gold : c.bg }}
                      onClick={() => setParticlesState(prev => ({ ...prev, enabled: !prev.enabled }))}
                    >
                      {particlesState.enabled ? 'ON' : 'OFF'}
                    </button>
                  </div>
                  <div style={{ opacity: particlesState.enabled ? 1 : 0.4, pointerEvents: particlesState.enabled ? 'auto' : 'none' }}>
                    <div style={styles.sliderRow}>
                      <span style={styles.sliderLabel}>Count</span>
                      <input type="range" min={10} max={500} step={10}
                        value={particlesState.count}
                        onChange={e => setParticlesState(prev => ({ ...prev, count: parseFloat(e.target.value) }))}
                        style={styles.slider} />
                      <span style={styles.sliderValue}>{particlesState.count}</span>
                    </div>
                    <div style={styles.sliderRow}>
                      <span style={styles.sliderLabel}>Size</span>
                      <input type="range" min={0.01} max={0.2} step={0.01}
                        value={particlesState.size}
                        onChange={e => setParticlesState(prev => ({ ...prev, size: parseFloat(e.target.value) }))}
                        style={styles.slider} />
                      <span style={styles.sliderValue}>{particlesState.size.toFixed(2)}</span>
                    </div>
                    <div style={styles.sliderRow}>
                      <span style={styles.sliderLabel}>Speed</span>
                      <input type="range" min={0.1} max={3} step={0.1}
                        value={particlesState.speed}
                        onChange={e => setParticlesState(prev => ({ ...prev, speed: parseFloat(e.target.value) }))}
                        style={styles.slider} />
                      <span style={styles.sliderValue}>{particlesState.speed.toFixed(1)}</span>
                    </div>
                    <div style={styles.sliderRow}>
                      <span style={styles.sliderLabel}>Spread</span>
                      <input type="range" min={2} max={30} step={1}
                        value={particlesState.spread}
                        onChange={e => setParticlesState(prev => ({ ...prev, spread: parseFloat(e.target.value) }))}
                        style={styles.slider} />
                      <span style={styles.sliderValue}>{particlesState.spread}</span>
                    </div>
                    <div style={styles.sliderRow}>
                      <span style={styles.sliderLabel}>Opacity</span>
                      <input type="range" min={0.1} max={1} step={0.1}
                        value={particlesState.opacity}
                        onChange={e => setParticlesState(prev => ({ ...prev, opacity: parseFloat(e.target.value) }))}
                        style={styles.slider} />
                      <span style={styles.sliderValue}>{particlesState.opacity.toFixed(1)}</span>
                    </div>
                    <div style={styles.colorRow}>
                      <span style={styles.sliderLabel}>Color</span>
                      <input type="color" value={particlesState.color}
                        onChange={e => setParticlesState(prev => ({ ...prev, color: e.target.value }))}
                        style={styles.colorInput} />
                    </div>
                  </div>
                </div>
              )}

              {/* BACKGROUND TAB */}
              {activeTab === 'background' && (
                <div style={styles.tabContent}>
                  <div style={styles.controlRow}>
                    <label style={styles.controlLabel}>Override Background</label>
                    <button
                      style={{ ...styles.toggleBtn, backgroundColor: backgroundState.enabled ? c.gold : c.bg }}
                      onClick={() => setBackgroundState(prev => ({ ...prev, enabled: !prev.enabled }))}
                    >
                      {backgroundState.enabled ? 'ON' : 'OFF'}
                    </button>
                  </div>
                  <div style={{ opacity: backgroundState.enabled ? 1 : 0.4, pointerEvents: backgroundState.enabled ? 'auto' : 'none' }}>
                    <div style={styles.colorRow}>
                      <span style={styles.sliderLabel}>Color</span>
                      <input type="color" value={backgroundState.color}
                        onChange={e => setBackgroundState(prev => ({ ...prev, color: e.target.value }))}
                        style={styles.colorInput} />
                    </div>

                    {/* Gradient */}
                    <div style={styles.controlGroup}>
                      <div style={styles.controlRow}>
                        <span style={styles.groupLabel}>Gradient</span>
                        <button
                          style={{ ...styles.miniToggle, backgroundColor: backgroundState.gradientEnabled ? c.green : c.bg }}
                          onClick={() => setBackgroundState(prev => ({ ...prev, gradientEnabled: !prev.gradientEnabled }))}
                        >{backgroundState.gradientEnabled ? 'ON' : 'OFF'}</button>
                      </div>
                      {backgroundState.gradientEnabled && (
                        <>
                          <div style={styles.colorRow}>
                            <span style={styles.sliderLabel}>Top</span>
                            <input type="color" value={backgroundState.gradientTop}
                              onChange={e => setBackgroundState(prev => ({ ...prev, gradientTop: e.target.value }))}
                              style={styles.colorInput} />
                          </div>
                          <div style={styles.colorRow}>
                            <span style={styles.sliderLabel}>Bottom</span>
                            <input type="color" value={backgroundState.gradientBottom}
                              onChange={e => setBackgroundState(prev => ({ ...prev, gradientBottom: e.target.value }))}
                              style={styles.colorInput} />
                          </div>
                        </>
                      )}
                    </div>

                    {/* Stars */}
                    <div style={styles.controlGroup}>
                      <div style={styles.controlRow}>
                        <span style={styles.groupLabel}>Stars</span>
                        <button
                          style={{ ...styles.miniToggle, backgroundColor: backgroundState.starsEnabled ? c.green : c.bg }}
                          onClick={() => setBackgroundState(prev => ({ ...prev, starsEnabled: !prev.starsEnabled }))}
                        >{backgroundState.starsEnabled ? 'ON' : 'OFF'}</button>
                      </div>
                      {backgroundState.starsEnabled && (
                        <>
                          <div style={styles.sliderRow}>
                            <span style={styles.sliderLabel}>Count</span>
                            <input type="range" min={50} max={1000} step={50}
                              value={backgroundState.starsCount}
                              onChange={e => setBackgroundState(prev => ({ ...prev, starsCount: parseFloat(e.target.value) }))}
                              style={styles.slider} />
                            <span style={styles.sliderValue}>{backgroundState.starsCount}</span>
                          </div>
                          <div style={styles.sliderRow}>
                            <span style={styles.sliderLabel}>Speed</span>
                            <input type="range" min={0} max={1} step={0.05}
                              value={backgroundState.starsSpeed}
                              onChange={e => setBackgroundState(prev => ({ ...prev, starsSpeed: parseFloat(e.target.value) }))}
                              style={styles.slider} />
                            <span style={styles.sliderValue}>{backgroundState.starsSpeed.toFixed(2)}</span>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Quick Effects Bar */}
      <div style={styles.quickEffectsBar}>
        <span style={styles.quickEffectsLabel}>EFFETTI:</span>

        {/* Ruota */}
        <div style={styles.effectGroup}>
          <button
            style={{ ...styles.quickBtn, backgroundColor: ferreroState.autoRotate ? c.gold : c.card, color: ferreroState.autoRotate ? '#000' : '#fff' }}
            onClick={() => setFerreroState(prev => ({ ...prev, enabled: true, autoRotate: !prev.autoRotate }))}
          >
            🔄 Ruota
          </button>
          {ferreroState.autoRotate && (
            <input type="range" min={0.1} max={5} step={0.1} value={ferreroState.autoRotateSpeed}
              onChange={e => setFerreroState(prev => ({ ...prev, autoRotateSpeed: parseFloat(e.target.value) }))}
              style={styles.quickSlider} title={`Velocità: ${ferreroState.autoRotateSpeed.toFixed(1)}`} />
          )}
        </div>

        {/* Fluttua */}
        <div style={styles.effectGroup}>
          <button
            style={{ ...styles.quickBtn, backgroundColor: ferreroState.floatEnabled ? c.gold : c.card, color: ferreroState.floatEnabled ? '#000' : '#fff' }}
            onClick={() => setFerreroState(prev => ({ ...prev, enabled: true, floatEnabled: !prev.floatEnabled }))}
          >
            🎈 Fluttua
          </button>
          {ferreroState.floatEnabled && (
            <input type="range" min={0.1} max={1} step={0.05} value={ferreroState.floatAmplitude}
              onChange={e => setFerreroState(prev => ({ ...prev, floatAmplitude: parseFloat(e.target.value) }))}
              style={styles.quickSlider} title={`Ampiezza: ${ferreroState.floatAmplitude.toFixed(2)}`} />
          )}
        </div>

        {/* Rimbalza */}
        <div style={styles.effectGroup}>
          <button
            style={{ ...styles.quickBtn, backgroundColor: ferreroState.bounceEnabled ? c.gold : c.card, color: ferreroState.bounceEnabled ? '#000' : '#fff' }}
            onClick={() => setFerreroState(prev => ({ ...prev, enabled: true, bounceEnabled: !prev.bounceEnabled }))}
          >
            ⬆️ Rimbalza
          </button>
          {ferreroState.bounceEnabled && (
            <input type="range" min={0.05} max={0.5} step={0.05} value={ferreroState.bounceAmplitude}
              onChange={e => setFerreroState(prev => ({ ...prev, bounceAmplitude: parseFloat(e.target.value) }))}
              style={styles.quickSlider} title={`Ampiezza: ${ferreroState.bounceAmplitude.toFixed(2)}`} />
          )}
        </div>

        {/* Brilla */}
        <div style={styles.effectGroup}>
          <button
            style={{ ...styles.quickBtn, backgroundColor: ferreroState.emissiveIntensity > 0 ? c.gold : c.card, color: ferreroState.emissiveIntensity > 0 ? '#000' : '#fff' }}
            onClick={() => setFerreroState(prev => ({ ...prev, enabled: true, emissiveIntensity: prev.emissiveIntensity > 0 ? 0 : 0.8 }))}
          >
            ✨ Brilla
          </button>
          {ferreroState.emissiveIntensity > 0 && (
            <input type="range" min={0.1} max={2} step={0.1} value={ferreroState.emissiveIntensity}
              onChange={e => setFerreroState(prev => ({ ...prev, emissiveIntensity: parseFloat(e.target.value) }))}
              style={styles.quickSlider} title={`Intensità: ${ferreroState.emissiveIntensity.toFixed(1)}`} />
          )}
        </div>

        {/* Scala */}
        <div style={styles.effectGroup}>
          <button
            style={{ ...styles.quickBtn, backgroundColor: ferreroState.scale !== 2.2 ? c.gold : c.card, color: ferreroState.scale !== 2.2 ? '#000' : '#fff' }}
            onClick={() => setFerreroState(prev => ({ ...prev, enabled: true }))}
          >
            📐 Scala
          </button>
          <input type="range" min={0.5} max={4} step={0.1} value={ferreroState.scale}
            onChange={e => setFerreroState(prev => ({ ...prev, enabled: true, scale: parseFloat(e.target.value) }))}
            style={styles.quickSlider} title={`Scala: ${ferreroState.scale.toFixed(1)}`} />
        </div>

        {/* Wireframe */}
        <button
          style={{ ...styles.quickBtn, backgroundColor: ferreroState.wireframe ? c.gold : c.card, color: ferreroState.wireframe ? '#000' : '#fff' }}
          onClick={() => setFerreroState(prev => ({ ...prev, enabled: true, wireframe: !prev.wireframe }))}
        >
          🔲 Wire
        </button>

        
        {/* Separatore */}
        <div style={{ width: 1, height: 24, backgroundColor: c.border, margin: '0 4px' }} />

        {/* TITLE */}
        <span style={{ ...styles.quickEffectsLabel, color: c.accent }}>TITLE:</span>
        <div style={styles.effectGroup}>
          <span style={{ fontSize: 10, color: c.muted }}>Opacità</span>
          <input type="range" min={0} max={1} step={0.05} value={titleState.opacity}
            onChange={e => setTitleState(prev => ({ ...prev, enabled: true, opacity: parseFloat(e.target.value) }))}
            style={styles.quickSlider} title={`${(titleState.opacity * 100).toFixed(0)}%`} />
        </div>
        <button
          style={{ ...styles.quickBtn, backgroundColor: titleState.glowEnabled ? c.accent : c.card, color: titleState.glowEnabled ? '#fff' : '#fff', fontSize: 10 }}
          onClick={() => setTitleState(prev => ({ ...prev, enabled: true, glowEnabled: !prev.glowEnabled }))}
        >
          💫 Glow
        </button>

        {/* Separatore */}
        <div style={{ width: 1, height: 24, backgroundColor: c.border, margin: '0 4px' }} />

        {/* CARDS */}
        <span style={{ ...styles.quickEffectsLabel, color: c.green }}>CARDS:</span>
        <div style={styles.effectGroup}>
          <span style={{ fontSize: 10, color: c.muted }}>Opacità</span>
          <input type="range" min={0} max={1} step={0.05} value={cardsState.globalOpacity}
            onChange={e => setCardsState(prev => ({ ...prev, enabled: true, globalOpacity: parseFloat(e.target.value) }))}
            style={styles.quickSlider} title={`${(cardsState.globalOpacity * 100).toFixed(0)}%`} />
        </div>
        <div style={styles.effectGroup}>
          <span style={{ fontSize: 10, color: c.muted }}>Blur</span>
          <input type="range" min={0} max={40} step={2} value={cardsState.blur}
            onChange={e => setCardsState(prev => ({ ...prev, enabled: true, blur: parseFloat(e.target.value) }))}
            style={styles.quickSlider} title={`${cardsState.blur}px`} />
        </div>
        {/* Animazione entrata */}
        <select
          style={{ ...styles.quickBtn, padding: '4px 8px', fontSize: 10, backgroundColor: c.card, cursor: 'pointer' }}
          value={cardsState.animateIn}
          onChange={e => setCardsState(prev => ({ ...prev, enabled: true, animateIn: e.target.value as 'fade' | 'slide' | 'scale' | 'flip' }))}
          title="Animazione entrata"
        >
          <option value="fade">Fade In</option>
          <option value="slide">Slide In</option>
          <option value="scale">Scale In</option>
          <option value="flip">Flip In</option>
        </select>
        <button
          style={{ ...styles.quickBtn, backgroundColor: cardsState.glowEnabled ? c.green : c.card, fontSize: 10 }}
          onClick={() => setCardsState(prev => ({ ...prev, enabled: true, glowEnabled: !prev.glowEnabled }))}
        >
          💫 Glow
        </button>

        {/* Separatore */}
        <div style={{ width: 1, height: 24, backgroundColor: c.border, margin: '0 4px' }} />

        {/* TITLE animazioni */}
        <span style={{ ...styles.quickEffectsLabel, color: c.blue }}>ANIM:</span>
        <select
          style={{ ...styles.quickBtn, padding: '4px 8px', fontSize: 10, backgroundColor: c.card, cursor: 'pointer' }}
          value={titleState.animationType}
          onChange={e => setTitleState(prev => ({ ...prev, enabled: true, animateEnabled: e.target.value !== 'none', animationType: e.target.value as 'none' | 'pulse' | 'wave' | 'typewriter' }))}
          title="Animazione titolo"
        >
          <option value="none">Nessuna</option>
          <option value="pulse">Pulse</option>
          <option value="wave">Wave</option>
          <option value="typewriter">Typewriter</option>
        </select>

        <div style={{ flex: 1 }} />

        {/* Reset ALL */}
        <button
          style={{ ...styles.quickBtn, backgroundColor: c.red + '33', color: c.red, border: `1px solid ${c.red}` }}
          onClick={() => {
            setFerreroState({ enabled: false, rotX: 0, rotY: 0, rotZ: 0, posX: 0, posY: 0, posZ: 0, scale: 2.2, autoRotate: false, autoRotateSpeed: 1, floatEnabled: false, floatAmplitude: 0.2, floatSpeed: 1, bounceEnabled: false, bounceAmplitude: 0.1, bounceSpeed: 2, metalness: 0.8, roughness: 0.2, emissiveIntensity: 0, emissiveColor: '#d4a853', wireframe: false, explodeEnabled: false, explodeAmount: 0 })
            setTitleState(prev => ({ ...prev, enabled: false, opacity: 1, glowEnabled: false }))
            setCardsState(prev => ({ ...prev, enabled: false, globalOpacity: 1, blur: 20, glowEnabled: false }))
          }}
        >
          ↺ Reset All
        </button>
      </div>

      {/* Timeline - Canva Style */}
      <div style={styles.timelineWrap}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
          <div style={styles.timelineLabel}>TIMELINE</div>
          <button
            style={{
              ...styles.miniToggle,
              backgroundColor: showAdvancedTimeline ? c.gold : c.card,
              color: showAdvancedTimeline ? '#000' : '#fff',
              border: `1px solid ${showAdvancedTimeline ? c.gold : c.accent}`,
              fontWeight: 600,
            }}
            onClick={() => setShowAdvancedTimeline(!showAdvancedTimeline)}
          >
            {showAdvancedTimeline ? '◆ Keyframes ON' : '◇ Keyframes OFF'}
          </button>
        </div>

        {/* Main Scrubber */}
        <div
          ref={timelineRef}
          style={styles.timeline}
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
          {/* Sections from codeStructure */}
          {codeStructure?.sections.map((sec, i) => {
            const start = parseFloat(sec.scrollRange.split('-')[0]) / 100
            const end = parseFloat(sec.scrollRange.split('-')[1].replace('%', '')) / 100
            const colors = [c.accent, c.red]
            return (
              <div
                key={sec.id}
                style={{
                  ...styles.timelineSec,
                  left: `${start * 100}%`,
                  width: `${(end - start) * 100}%`,
                  backgroundColor: `${colors[i % colors.length]}22`
                }}
              >
                <span style={styles.timelineSecName}>{sec.name}</span>
              </div>
            )
          })}
          {/* Info Cards markers */}
          {codeStructure?.cards.map(card => (
            <div
              key={card.id}
              style={{
                position: 'absolute',
                left: `${card.startScroll * 100}%`,
                width: `${(card.endScroll - card.startScroll) * 100}%`,
                height: '4px',
                bottom: 0,
                backgroundColor: c.gold,
                opacity: 0.6,
              }}
            />
          ))}
          {/* Playhead */}
          <div style={{ ...styles.playhead, left: `${scroll * 100}%` }}>
            <div style={styles.playheadLine} />
            <div style={styles.playheadDot} />
          </div>
        </div>

        {/* Keyframe Tracks - Canva Style */}
        {showAdvancedTimeline && (
          <div style={styles.keyframeTracks}>
            {/* Track Labels + Tracks */}
            {(['ferrero', 'title', 'cards', 'lighting'] as const).map(track => {
              const trackColors: Record<string, string> = {
                ferrero: c.gold,
                title: c.accent,
                cards: c.green,
                lighting: c.blue,
              }
              const trackLabels: Record<string, string> = {
                ferrero: 'Ferrero',
                title: 'Title',
                cards: 'Cards',
                lighting: 'Lights',
              }
              return (
                <div key={track} style={styles.keyframeTrackRow}>
                  {/* Track Label */}
                  <div style={styles.trackLabel}>
                    <span style={{ color: trackColors[track], fontWeight: 600 }}>{trackLabels[track]}</span>
                    <button
                      style={styles.addKeyframeBtn}
                      onClick={() => addKeyframe(track)}
                      title="Add keyframe at current position"
                    >
                      <Plus size={12} />
                    </button>
                  </div>
                  {/* Track */}
                  <div style={styles.keyframeTrack}>
                    {/* Keyframes */}
                    {keyframes[track].map(kf => (
                      <div
                        key={kf.id}
                        style={{
                          position: 'absolute',
                          left: `${kf.scroll * 100}%`,
                          top: '50%',
                          transform: 'translate(-50%, -50%)',
                          cursor: 'pointer',
                        }}
                        onClick={() => jumpToKeyframe(kf)}
                      >
                        <Diamond
                          size={14}
                          fill={selectedKeyframe === kf.id ? trackColors[track] : 'transparent'}
                          stroke={trackColors[track]}
                          strokeWidth={2}
                        />
                      </div>
                    ))}
                    {/* Current position indicator */}
                    <div
                      style={{
                        position: 'absolute',
                        left: `${scroll * 100}%`,
                        top: 0,
                        bottom: 0,
                        width: 1,
                        backgroundColor: c.red,
                        opacity: 0.5,
                      }}
                    />
                  </div>
                  {/* Delete selected keyframe */}
                  {selectedKeyframe?.startsWith(track) && (
                    <button
                      style={styles.deleteKeyframeBtn}
                      onClick={() => removeKeyframe(track, selectedKeyframe)}
                      title="Delete keyframe"
                    >
                      <Trash2 size={12} />
                    </button>
                  )}
                </div>
              )
            })}
          </div>
        )}

        <div style={styles.timelineMarkers}>
          {[0, 25, 50, 75, 100].map(p => <span key={p} style={styles.marker}>{p}%</span>)}
        </div>
      </div>

      {/* Info Bar */}
      <div style={styles.infoBar}>
        <div style={styles.infoGroup}>
          <span style={styles.infoLabel}>Section:</span>
          <span style={{ ...styles.infoValue, color: c.accent }}>
            {codeStructure?.sections.find(s => {
              const start = parseFloat(s.scrollRange.split('-')[0]) / 100
              const end = parseFloat(s.scrollRange.split('-')[1].replace('%', '')) / 100
              return scroll >= start && scroll < end
            })?.name || 'Loading...'}
          </span>
        </div>
        {ferreroLive?.activeCard && (
          <div style={styles.infoGroup}>
            <span style={styles.infoLabel}>Card:</span>
            <span style={{ ...styles.infoValue, color: c.gold }}>{ferreroLive.activeCard}</span>
          </div>
        )}
        <div style={styles.infoDivider} />
        <div style={styles.infoGroup}>
          <span style={styles.infoLabel}>Scroll:</span>
          <input
            type="number"
            value={(scroll * 100).toFixed(1)}
            onChange={e => setScroll(Math.max(0, Math.min(100, parseFloat(e.target.value) || 0)) / 100)}
            style={styles.infoInput}
            step={0.1}
          />
          <span style={styles.infoLabel}>%</span>
        </div>
      </div>
    </div>
  )
}

const styles: Record<string, CSSProperties> = {
  page: { height: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: c.bg, fontFamily: 'Inter, sans-serif', color: c.text, overflow: 'hidden' },

  // Toolbar
  toolbar: { height: 56, backgroundColor: c.card, borderBottom: `1px solid ${c.border}`, display: 'flex', alignItems: 'center', padding: '0 16px', gap: 12 },
  homeBtn: { width: 40, height: 40, borderRadius: 8, border: `1px solid ${c.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: c.muted, textDecoration: 'none' },
  btn: { width: 40, height: 40, borderRadius: 8, border: `1px solid ${c.border}`, background: 'transparent', color: c.muted, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' },
  btnActive: { backgroundColor: c.accent, borderColor: c.accent, color: '#fff' },
  presetWrap: { position: 'relative' },
  presetBtn: { height: 40, padding: '0 16px', borderRadius: 8, border: `1px solid ${c.border}`, background: 'transparent', color: c.muted, display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 13 },
  presetMenu: { position: 'absolute', top: '100%', left: 0, marginTop: 4, backgroundColor: c.card, border: `1px solid ${c.border}`, borderRadius: 8, overflow: 'hidden', zIndex: 100, minWidth: 180 },
  presetItem: { width: '100%', padding: '12px 16px', border: 'none', background: 'transparent', color: c.text, textAlign: 'left', cursor: 'pointer', fontSize: 13 },
  spacer: { flex: 1 },
  scrollDisplay: { padding: '8px 16px', borderRadius: 8, backgroundColor: c.card, border: `1px solid ${c.border}`, fontFamily: 'JetBrains Mono, monospace', fontSize: 14, color: c.accent, fontWeight: 600 },

  // Main
  main: { flex: 1, display: 'flex', minHeight: 0 },

  // Page Preview
  pagePreview: { width: 220, backgroundColor: c.card, borderRight: `1px solid ${c.border}`, padding: 16, display: 'flex', flexDirection: 'column', overflowY: 'auto' },
  previewLabel: { fontSize: 10, color: c.dim, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8, fontWeight: 600 },
  sectionList: { display: 'flex', flexDirection: 'column', gap: 6 },
  sectionItem: { padding: '10px 12px', borderRadius: 8, border: `1px solid ${c.border}`, cursor: 'pointer', transition: 'all 0.15s' },
  sectionHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  sectionName: { fontSize: 12, fontWeight: 600, color: '#fff' },
  sectionFile: { fontSize: 9, color: c.dim, fontFamily: 'JetBrains Mono, monospace' },
  sectionRange: { fontSize: 10, color: c.muted },
  loadingText: { fontSize: 11, color: c.dim, fontStyle: 'italic', padding: '8px 0' },

  // 3D Preview - contains ACTUAL Scene3D
  preview3d: { flex: 1, position: 'relative', backgroundColor: c.bg, overflow: 'hidden' },

  // Timeline
  timelineWrap: { backgroundColor: c.card, borderTop: `1px solid ${c.border}`, padding: '12px 16px' },
  timelineLabel: { fontSize: 11, color: c.dim, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8, fontWeight: 600 },
  timeline: { position: 'relative', height: 48, backgroundColor: c.bg, borderRadius: 8, cursor: 'pointer', overflow: 'hidden' },
  timelineSec: { position: 'absolute', top: 0, height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRight: `1px solid ${c.border}` },
  timelineSecName: { fontSize: 10, color: c.muted, fontWeight: 500 },
  playhead: { position: 'absolute', top: 0, bottom: 0, width: 2, zIndex: 10 },
  playheadLine: { position: 'absolute', top: 0, bottom: 0, left: '50%', width: 2, marginLeft: -1, backgroundColor: c.red, boxShadow: `0 0 8px ${c.red}` },
  playheadDot: { position: 'absolute', top: -4, left: '50%', width: 10, height: 10, marginLeft: -5, backgroundColor: c.red, borderRadius: '50%', boxShadow: `0 0 8px ${c.red}` },
  timelineMarkers: { display: 'flex', justifyContent: 'space-between', marginTop: 6, padding: '0 4px' },
  marker: { fontSize: 10, color: c.dim, fontFamily: 'JetBrains Mono, monospace' },

  // Info Bar
  infoBar: { height: 48, backgroundColor: c.card, borderTop: `1px solid ${c.border}`, display: 'flex', alignItems: 'center', padding: '0 16px', gap: 16 },
  infoGroup: { display: 'flex', alignItems: 'center', gap: 8 },
  infoLabel: { fontSize: 11, color: c.dim, textTransform: 'uppercase', fontWeight: 600 },
  infoValue: { fontSize: 13, color: c.accent, fontWeight: 600 },
  infoInput: { width: 70, padding: '6px 8px', borderRadius: 6, border: `1px solid ${c.border}`, backgroundColor: c.bg, color: c.text, fontSize: 12, fontFamily: 'JetBrains Mono, monospace', textAlign: 'center' },
  infoDivider: { width: 1, height: 24, backgroundColor: c.border },

  // Live Data
  liveData: { marginTop: 16, padding: 12, backgroundColor: c.bg, borderRadius: 8, fontSize: 11 },
  liveCard: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: `1px solid ${c.border}`, marginBottom: 8 },
  liveCardLabel: { color: c.dim, fontSize: 10 },
  liveCardValue: { color: c.gold, fontWeight: 600 },
  liveGroup: { marginBottom: 8 },
  liveGroupLabel: { display: 'block', color: c.dim, fontSize: 9, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 },
  liveRow: { display: 'flex', justifyContent: 'space-between', color: c.muted, fontSize: 10, padding: '2px 0' },
  liveValue: { color: c.text, fontFamily: 'JetBrains Mono, monospace' },

  // Control Panel
  controlPanel: { position: 'absolute', top: 16, right: 16, width: 280, backgroundColor: c.card, border: `1px solid ${c.border}`, borderRadius: 12, padding: 16, zIndex: 100 },
  controlHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  controlTitle: { fontSize: 14, fontWeight: 600, color: c.gold },
  closeBtn: { width: 24, height: 24, borderRadius: 6, border: 'none', background: 'transparent', color: c.muted, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  controlRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  controlLabel: { fontSize: 12, color: c.text },
  toggleBtn: { padding: '6px 16px', borderRadius: 6, border: `1px solid ${c.border}`, color: c.text, fontSize: 11, fontWeight: 600, cursor: 'pointer' },
  miniToggle: { padding: '4px 12px', borderRadius: 4, border: `1px solid ${c.border}`, color: c.text, fontSize: 10, fontWeight: 600, cursor: 'pointer' },
  controlDivider: { height: 1, backgroundColor: c.border, margin: '12px 0' },
  controlGroup: { marginBottom: 16 },
  groupLabel: { display: 'block', fontSize: 10, color: c.dim, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 },
  sliderRow: { display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 },
  sliderLabel: { width: 40, fontSize: 10, color: c.muted, fontFamily: 'JetBrains Mono, monospace' },
  slider: { flex: 1, accentColor: c.gold },
  sliderValue: { width: 50, fontSize: 11, color: c.text, fontFamily: 'JetBrains Mono, monospace', textAlign: 'right' },
  resetBtn: { width: '100%', padding: '8px 12px', borderRadius: 6, border: `1px solid ${c.border}`, background: 'transparent', color: c.muted, fontSize: 12, cursor: 'pointer', marginBottom: 8 },
  exportBtn: { width: '100%', padding: '8px 12px', borderRadius: 6, border: 'none', background: c.accent, color: '#fff', fontSize: 12, fontWeight: 600, cursor: 'pointer' },

  // Code Structure
  codeStructure: { marginTop: 16, padding: 12, backgroundColor: c.bg, borderRadius: 8 },
  codeSection: { marginTop: 8 },
  codeSectionTitle: { display: 'block', fontSize: 10, color: c.dim, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 6 },
  codeItem: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 8px', marginBottom: 4, borderRadius: 6, border: `1px solid ${c.border}`, cursor: 'pointer', transition: 'all 0.15s' },
  codeItemTitle: { fontSize: 11, color: c.text, fontWeight: 500 },
  codeItemRange: { fontSize: 10, color: c.muted, fontFamily: 'JetBrains Mono, monospace' },

  // Tabs
  tabBar: { display: 'flex', gap: 4, marginBottom: 16, padding: 4, backgroundColor: c.bg, borderRadius: 8 },
  tab: { flex: 1, padding: '8px 12px', borderRadius: 6, border: 'none', fontSize: 11, fontWeight: 600, cursor: 'pointer', transition: 'all 0.15s' },
  tabContent: { maxHeight: 400, overflowY: 'auto' },

  // New input styles
  inputRow: { display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 },
  textInput: { flex: 1, padding: '6px 10px', borderRadius: 6, border: `1px solid ${c.border}`, backgroundColor: c.bg, color: c.text, fontSize: 12 },
  colorRow: { display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 },
  colorInput: { width: 40, height: 28, padding: 0, border: `1px solid ${c.border}`, borderRadius: 4, cursor: 'pointer' },

  // Quick Effects Bar
  quickEffectsBar: { display: 'flex', alignItems: 'center', gap: 8, padding: '8px 16px', backgroundColor: c.card, borderTop: `1px solid ${c.border}`, flexWrap: 'wrap' },
  quickEffectsLabel: { fontSize: 10, color: c.dim, textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600, marginRight: 4 },
  quickBtn: { padding: '6px 10px', borderRadius: 6, border: `1px solid ${c.border}`, color: '#fff', fontSize: 11, cursor: 'pointer', transition: 'all 0.15s', display: 'flex', alignItems: 'center', gap: 4 },
  effectGroup: { display: 'flex', alignItems: 'center', gap: 4 },
  quickSlider: { width: 60, height: 4, accentColor: c.gold, cursor: 'pointer' },

  // Keyframe Timeline (Canva-style)
  keyframeTracks: { marginTop: 12, display: 'flex', flexDirection: 'column', gap: 4, backgroundColor: c.bg, borderRadius: 8, padding: 8 },
  keyframeTrackRow: { display: 'flex', alignItems: 'center', gap: 8, height: 28 },
  trackLabel: { width: 70, display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 11 },
  addKeyframeBtn: { width: 18, height: 18, borderRadius: 4, border: `1px solid ${c.border}`, background: 'transparent', color: c.muted, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.15s' },
  keyframeTrack: { flex: 1, height: 24, backgroundColor: c.card, borderRadius: 4, border: `1px solid ${c.border}`, position: 'relative' },
  deleteKeyframeBtn: { width: 24, height: 24, borderRadius: 4, border: 'none', background: c.red + '33', color: c.red, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' },
}
