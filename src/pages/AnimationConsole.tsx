import { useState, useRef, CSSProperties, useEffect, useCallback } from 'react'
import {
  Play, Pause, RotateCcw, Maximize2, ZoomIn, ZoomOut, Sun, Sparkles, Move, RotateCw,
  Home, Download, Settings, X, ChevronRight, Eye, Zap, Camera, Layers, Diamond, Plus, Trash2
} from 'lucide-react'

// Presets
const presets = [
  { name: 'Hero', scroll: 0.05, emoji: '🏠' },
  { name: 'Copertura', scroll: 0.22, emoji: '🍫' },
  { name: 'Cuore', scroll: 0.37, emoji: '❤️' },
  { name: 'Eleganza', scroll: 0.52, emoji: '✨' },
  { name: 'Transition', scroll: 0.70, emoji: '🌙' },
  { name: 'End', scroll: 0.98, emoji: '🎬' },
]

// Quick effects (always visible)
const quickEffects = [
  { id: 'rotate', name: 'Ruota', icon: RotateCw },
  { id: 'float', name: 'Float', icon: Move },
  { id: 'glow', name: 'Glow', icon: Sun },
  { id: 'bloom', name: 'Bloom', icon: Sparkles },
]

// Advanced effects (in panel)
const advancedEffects = [
  { id: 'bounce', name: 'Bounce', category: 'ferrero' },
  { id: 'explode', name: 'Explode', category: 'ferrero' },
  { id: 'wireframe', name: 'Wireframe', category: 'ferrero' },
  { id: 'vignette', name: 'Vignette', category: 'fx' },
  { id: 'chromatic', name: 'Chromatic', category: 'fx' },
  { id: 'noise', name: 'Noise', category: 'fx' },
  { id: 'particles', name: 'Particles', category: 'scene' },
  { id: 'stars', name: 'Stars BG', category: 'scene' },
  { id: 'gradient', name: 'Gradient BG', category: 'scene' },
  { id: 'orbit', name: 'Camera Orbit', category: 'camera' },
]

// Keyframe type
interface Keyframe {
  id: string
  scroll: number
  label?: string
}

export function AnimationConsole() {
  // Core state
  const [scroll, setScroll] = useState(0)
  const [playing, setPlaying] = useState(false)
  const [speed, setSpeed] = useState(1)
  const [activeEffects, setActiveEffects] = useState<Set<string>>(new Set())

  // Direct manipulation
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const [rotation, setRotation] = useState({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)

  // Panels
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [advancedTab, setAdvancedTab] = useState<'effects' | 'keyframes' | 'live'>('effects')

  // Keyframes
  const [keyframes, setKeyframes] = useState<Keyframe[]>([])
  const [selectedKeyframe, setSelectedKeyframe] = useState<string | null>(null)

  // Advanced values
  const [fov, setFov] = useState(35)
  const [particleType, setParticleType] = useState<'sparkles' | 'snow' | 'stars'>('sparkles')
  const [metalness, setMetalness] = useState(0.8)
  const [roughness, setRoughness] = useState(0.2)

  // Live data from iframe
  const [liveData, setLiveData] = useState<{
    rotX: number, rotY: number, rotZ: number,
    posX: number, posY: number, posZ: number,
    scale: number, scrollProgress: number
  } | null>(null)

  const iframeRef = useRef<HTMLIFrameElement>(null)
  const timelineRef = useRef<HTMLDivElement>(null)
  const [iframeReady, setIframeReady] = useState(false)

  // Listen for messages from iframe
  useEffect(() => {
    const handler = (event: MessageEvent) => {
      if (event.data?.type === 'FERRERO_STATE') {
        setLiveData(event.data.state)
      }
    }
    window.addEventListener('message', handler)
    return () => window.removeEventListener('message', handler)
  }, [])

  // Send to iframe
  const sendToIframe = useCallback((type: string, data: Record<string, unknown>) => {
    if (!iframeRef.current?.contentWindow) return
    iframeRef.current.contentWindow.postMessage({ type, ...data }, '*')
  }, [])

  // Sync scroll
  const syncScroll = useCallback((value: number) => {
    if (!iframeRef.current?.contentWindow?.document) return
    const doc = iframeRef.current.contentWindow.document
    const max = doc.documentElement.scrollHeight - iframeRef.current.contentWindow.innerHeight
    iframeRef.current.contentWindow.scrollTo(0, value * max)
  }, [])

  useEffect(() => {
    if (iframeReady) syncScroll(scroll)
  }, [scroll, iframeReady, syncScroll])

  // Playback
  useEffect(() => {
    if (!playing) return
    const interval = setInterval(() => {
      setScroll(prev => {
        if (prev >= 1) { setPlaying(false); return 0 }
        return prev + (0.0002 * speed)
      })
    }, 16)
    return () => clearInterval(interval)
  }, [playing, speed])

  // Toggle effect
  const toggleEffect = (id: string) => {
    setActiveEffects(prev => {
      const next = new Set(prev)
      const isActive = next.has(id)
      if (isActive) next.delete(id)
      else next.add(id)

      // Send appropriate message to iframe
      const effectMap: Record<string, { component: string, values: Record<string, unknown> }> = {
        rotate: { component: 'ferrero', values: { autoRotate: !isActive, autoRotateSpeed: 1.5 } },
        float: { component: 'ferrero', values: { floatEnabled: !isActive, floatAmplitude: 0.3 } },
        bounce: { component: 'ferrero', values: { bounceEnabled: !isActive, bounceAmplitude: 0.15 } },
        explode: { component: 'ferrero', values: { explodeEnabled: !isActive, explodeAmount: isActive ? 0 : 0.5 } },
        wireframe: { component: 'ferrero', values: { wireframe: !isActive } },
        glow: { component: 'title', values: { glowEnabled: !isActive, glowIntensity: 15 } },
        bloom: { component: 'postProcessing', values: { bloomEnabled: !isActive, bloomIntensity: 1.5 } },
        vignette: { component: 'postProcessing', values: { vignetteEnabled: !isActive, vignetteIntensity: 0.5 } },
        chromatic: { component: 'postProcessing', values: { chromaticAberrationEnabled: !isActive, chromaticAberrationOffset: 0.003 } },
        noise: { component: 'postProcessing', values: { noiseEnabled: !isActive, noiseIntensity: 0.15 } },
        particles: { component: 'particles', values: { enabled: !isActive, type: particleType, count: 150 } },
        stars: { component: 'background', values: { starsEnabled: !isActive, starsCount: 200 } },
        gradient: { component: 'background', values: { gradientEnabled: !isActive } },
        orbit: { component: 'camera', values: { autoOrbit: !isActive, orbitSpeed: 0.5 } },
      }

      const effect = effectMap[id]
      if (effect) {
        sendToIframe('DEBUG_UPDATE', { component: effect.component, values: { enabled: true, ...effect.values } })
      }

      return next
    })
  }

  // Direct manipulation - drag to rotate
  const handleMouseDown = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('.no-drag')) return
    setIsDragging(true)
    setDragStart({ x: e.clientX, y: e.clientY })
  }

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging) return
    const dx = e.clientX - dragStart.x
    const dy = e.clientY - dragStart.y
    const newRot = { x: rotation.x + dy * 0.01, y: rotation.y + dx * 0.01 }
    setRotation(newRot)
    setDragStart({ x: e.clientX, y: e.clientY })
    sendToIframe('DEBUG_UPDATE', { component: 'ferrero', values: { enabled: true, rotX: newRot.x, rotY: newRot.y } })
  }, [isDragging, dragStart, rotation, sendToIframe])

  const handleMouseUp = useCallback(() => setIsDragging(false), [])

  useEffect(() => {
    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('mouseup', handleMouseUp)
    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseup', handleMouseUp)
    }
  }, [handleMouseMove, handleMouseUp])

  // Scroll to zoom
  const handleWheel = (e: React.WheelEvent) => {
    if ((e.target as HTMLElement).closest('.no-drag')) return
    e.preventDefault()
    const newZoom = Math.max(0.5, Math.min(3, zoom + (e.deltaY > 0 ? -0.1 : 0.1)))
    setZoom(newZoom)
    sendToIframe('DEBUG_UPDATE', { component: 'ferrero', values: { enabled: true, scale: 2.2 * newZoom } })
  }

  // Timeline click
  const handleTimelineClick = (e: React.MouseEvent) => {
    if (!timelineRef.current) return
    const rect = timelineRef.current.getBoundingClientRect()
    setScroll(Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width)))
  }

  // Keyframe functions
  const addKeyframe = () => {
    const id = `kf-${Date.now()}`
    setKeyframes(prev => [...prev, { id, scroll, label: `${(scroll * 100).toFixed(0)}%` }].sort((a, b) => a.scroll - b.scroll))
  }

  const removeKeyframe = (id: string) => {
    setKeyframes(prev => prev.filter(k => k.id !== id))
    if (selectedKeyframe === id) setSelectedKeyframe(null)
  }

  // Reset
  const handleReset = () => {
    setScroll(0)
    setPlaying(false)
    setActiveEffects(new Set())
    setRotation({ x: 0, y: 0 })
    setZoom(1)
    sendToIframe('DEBUG_RESET', {})
  }

  // Export
  const handleExport = () => {
    const data = {
      scroll,
      activeEffects: Array.from(activeEffects),
      rotation,
      zoom,
      fov,
      keyframes,
      timestamp: new Date().toISOString(),
    }
    navigator.clipboard.writeText(JSON.stringify(data, null, 2))
    alert('State copied to clipboard!')
  }

  // Update advanced values
  const updateFov = (value: number) => {
    setFov(value)
    sendToIframe('DEBUG_UPDATE', { component: 'camera', values: { enabled: true, fov: value } })
  }

  const updateMaterial = (prop: 'metalness' | 'roughness', value: number) => {
    if (prop === 'metalness') setMetalness(value)
    else setRoughness(value)
    sendToIframe('DEBUG_UPDATE', { component: 'ferrero', values: { enabled: true, [prop]: value } })
  }

  return (
    <div style={styles.container}>
      {/* Top Bar */}
      <div style={styles.topBar}>
        <a href="/" style={styles.homeBtn}><Home size={18} /></a>

        <div style={styles.controls}>
          <button style={styles.playBtn} onClick={() => setPlaying(!playing)}>
            {playing ? <Pause size={20} /> : <Play size={20} />}
          </button>
          <button style={styles.iconBtn} onClick={handleReset}><RotateCcw size={16} /></button>

          <div style={styles.speedControl}>
            {[0.25, 0.5, 1, 2, 4].map(s => (
              <button key={s} style={{ ...styles.speedBtn, ...(speed === s ? styles.speedBtnActive : {}) }}
                onClick={() => setSpeed(s)}>{s}x</button>
            ))}
          </div>
        </div>

        {/* Timeline */}
        <div style={styles.timeline} ref={timelineRef} onClick={handleTimelineClick}
          onMouseDown={e => {
            handleTimelineClick(e)
            const onMove = (ev: MouseEvent) => {
              if (!timelineRef.current) return
              const rect = timelineRef.current.getBoundingClientRect()
              setScroll(Math.max(0, Math.min(1, (ev.clientX - rect.left) / rect.width)))
            }
            const onUp = () => { window.removeEventListener('mousemove', onMove); window.removeEventListener('mouseup', onUp) }
            window.addEventListener('mousemove', onMove)
            window.addEventListener('mouseup', onUp)
          }}>
          <div style={{ ...styles.timelineProgress, width: `${scroll * 100}%` }} />

          {/* Preset markers */}
          {presets.map(p => (
            <div key={p.name} style={{ ...styles.marker, left: `${p.scroll * 100}%` }}
              onClick={e => { e.stopPropagation(); setScroll(p.scroll) }}>
              <span style={styles.markerLabel}>{p.emoji}</span>
            </div>
          ))}

          {/* Keyframe markers */}
          {keyframes.map(kf => (
            <div key={kf.id} style={{ ...styles.keyframeMarker, left: `${kf.scroll * 100}%` }}
              onClick={e => { e.stopPropagation(); setScroll(kf.scroll); setSelectedKeyframe(kf.id) }}>
              <Diamond size={10} fill={selectedKeyframe === kf.id ? '#d4a853' : 'transparent'} stroke="#d4a853" />
            </div>
          ))}

          <div style={{ ...styles.playhead, left: `${scroll * 100}%` }} />
        </div>

        <div style={styles.scrollValue}>{(scroll * 100).toFixed(0)}%</div>

        <button style={styles.iconBtn} onClick={handleExport} title="Export"><Download size={16} /></button>
        <button style={{ ...styles.iconBtn, ...(showAdvanced ? styles.iconBtnActive : {}) }}
          onClick={() => setShowAdvanced(!showAdvanced)} title="Advanced">
          <Settings size={16} />
        </button>
      </div>

      {/* Main Area */}
      <div style={styles.mainArea}>
        {/* Preview */}
        <div style={{ ...styles.preview, marginRight: showAdvanced ? 300 : 0 }}
          onMouseDown={handleMouseDown} onWheel={handleWheel}>
          <iframe ref={iframeRef} src="/?debug=true" style={styles.iframe}
            onLoad={() => { setIframeReady(true); syncScroll(scroll) }} />

          {!iframeReady && <div style={styles.loading}>Caricamento...</div>}

          <div style={styles.zoomIndicator}>
            <ZoomOut size={12} /><span>{(zoom * 100).toFixed(0)}%</span><ZoomIn size={12} />
          </div>

          {isDragging && (
            <div style={styles.dragHint}><Move size={16} /> Trascina per ruotare</div>
          )}
        </div>

        {/* Advanced Panel */}
        {showAdvanced && (
          <div style={styles.advancedPanel} className="no-drag">
            <div style={styles.panelHeader}>
              <span style={styles.panelTitle}>Avanzate</span>
              <button style={styles.closeBtn} onClick={() => setShowAdvanced(false)}><X size={16} /></button>
            </div>

            {/* Tabs */}
            <div style={styles.tabs}>
              {(['effects', 'keyframes', 'live'] as const).map(tab => (
                <button key={tab} style={{ ...styles.tab, ...(advancedTab === tab ? styles.tabActive : {}) }}
                  onClick={() => setAdvancedTab(tab)}>
                  {tab === 'effects' && <Zap size={12} />}
                  {tab === 'keyframes' && <Diamond size={12} />}
                  {tab === 'live' && <Eye size={12} />}
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              ))}
            </div>

            <div style={styles.panelContent}>
              {/* Effects Tab */}
              {advancedTab === 'effects' && (
                <>
                  <div style={styles.sectionTitle}><Layers size={12} /> Ferrero</div>
                  <div style={styles.effectGrid}>
                    {advancedEffects.filter(e => e.category === 'ferrero').map(fx => (
                      <button key={fx.id} style={{ ...styles.effectChip, ...(activeEffects.has(fx.id) ? styles.effectChipActive : {}) }}
                        onClick={() => toggleEffect(fx.id)}>{fx.name}</button>
                    ))}
                  </div>

                  <div style={styles.sliderRow}>
                    <span>Metalness</span>
                    <input type="range" min={0} max={1} step={0.05} value={metalness}
                      onChange={e => updateMaterial('metalness', parseFloat(e.target.value))} style={styles.slider} />
                    <span style={styles.sliderValue}>{metalness.toFixed(2)}</span>
                  </div>
                  <div style={styles.sliderRow}>
                    <span>Roughness</span>
                    <input type="range" min={0} max={1} step={0.05} value={roughness}
                      onChange={e => updateMaterial('roughness', parseFloat(e.target.value))} style={styles.slider} />
                    <span style={styles.sliderValue}>{roughness.toFixed(2)}</span>
                  </div>

                  <div style={styles.sectionTitle}><Sparkles size={12} /> Post FX</div>
                  <div style={styles.effectGrid}>
                    {advancedEffects.filter(e => e.category === 'fx').map(fx => (
                      <button key={fx.id} style={{ ...styles.effectChip, ...(activeEffects.has(fx.id) ? styles.effectChipActive : {}) }}
                        onClick={() => toggleEffect(fx.id)}>{fx.name}</button>
                    ))}
                  </div>

                  <div style={styles.sectionTitle}><Eye size={12} /> Scene</div>
                  <div style={styles.effectGrid}>
                    {advancedEffects.filter(e => e.category === 'scene').map(fx => (
                      <button key={fx.id} style={{ ...styles.effectChip, ...(activeEffects.has(fx.id) ? styles.effectChipActive : {}) }}
                        onClick={() => toggleEffect(fx.id)}>{fx.name}</button>
                    ))}
                  </div>

                  {activeEffects.has('particles') && (
                    <div style={styles.subOption}>
                      <span>Tipo:</span>
                      {(['sparkles', 'snow', 'stars'] as const).map(t => (
                        <button key={t} style={{ ...styles.miniBtn, ...(particleType === t ? styles.miniBtnActive : {}) }}
                          onClick={() => { setParticleType(t); sendToIframe('DEBUG_UPDATE', { component: 'particles', values: { enabled: true, type: t } }) }}>
                          {t}
                        </button>
                      ))}
                    </div>
                  )}

                  <div style={styles.sectionTitle}><Camera size={12} /> Camera</div>
                  <div style={styles.effectGrid}>
                    {advancedEffects.filter(e => e.category === 'camera').map(fx => (
                      <button key={fx.id} style={{ ...styles.effectChip, ...(activeEffects.has(fx.id) ? styles.effectChipActive : {}) }}
                        onClick={() => toggleEffect(fx.id)}>{fx.name}</button>
                    ))}
                  </div>
                  <div style={styles.sliderRow}>
                    <span>FOV</span>
                    <input type="range" min={15} max={90} step={5} value={fov}
                      onChange={e => updateFov(parseInt(e.target.value))} style={styles.slider} />
                    <span style={styles.sliderValue}>{fov}°</span>
                  </div>
                </>
              )}

              {/* Keyframes Tab */}
              {advancedTab === 'keyframes' && (
                <>
                  <div style={styles.keyframeHeader}>
                    <span>Keyframes ({keyframes.length})</span>
                    <button style={styles.addKfBtn} onClick={addKeyframe}><Plus size={14} /> Add</button>
                  </div>

                  {keyframes.length === 0 ? (
                    <div style={styles.emptyState}>
                      Nessun keyframe.<br/>Clicca "Add" per aggiungerne uno alla posizione corrente.
                    </div>
                  ) : (
                    <div style={styles.keyframeList}>
                      {keyframes.map(kf => (
                        <div key={kf.id} style={{ ...styles.keyframeItem, ...(selectedKeyframe === kf.id ? styles.keyframeItemActive : {}) }}
                          onClick={() => { setScroll(kf.scroll); setSelectedKeyframe(kf.id) }}>
                          <Diamond size={12} stroke="#d4a853" fill={selectedKeyframe === kf.id ? '#d4a853' : 'transparent'} />
                          <span style={styles.keyframeLabel}>{(kf.scroll * 100).toFixed(0)}%</span>
                          <button style={styles.deleteKfBtn} onClick={e => { e.stopPropagation(); removeKeyframe(kf.id) }}>
                            <Trash2 size={12} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  <div style={styles.keyframeTip}>
                    <ChevronRight size={12} /> I keyframe sono marker visivi sulla timeline
                  </div>
                </>
              )}

              {/* Live Tab */}
              {advancedTab === 'live' && (
                <>
                  <div style={styles.sectionTitle}><Eye size={12} /> Live Data</div>
                  {liveData ? (
                    <div style={styles.liveGrid}>
                      <div style={styles.liveRow}><span>Rot X</span><span>{liveData.rotX.toFixed(2)}</span></div>
                      <div style={styles.liveRow}><span>Rot Y</span><span>{liveData.rotY.toFixed(2)}</span></div>
                      <div style={styles.liveRow}><span>Rot Z</span><span>{liveData.rotZ.toFixed(2)}</span></div>
                      <div style={styles.liveRow}><span>Pos X</span><span>{liveData.posX.toFixed(2)}</span></div>
                      <div style={styles.liveRow}><span>Pos Y</span><span>{liveData.posY.toFixed(2)}</span></div>
                      <div style={styles.liveRow}><span>Pos Z</span><span>{liveData.posZ.toFixed(2)}</span></div>
                      <div style={styles.liveRow}><span>Scale</span><span>{liveData.scale.toFixed(2)}</span></div>
                      <div style={styles.liveRow}><span>Scroll</span><span>{(liveData.scrollProgress * 100).toFixed(1)}%</span></div>
                    </div>
                  ) : (
                    <div style={styles.emptyState}>In attesa di dati dall'iframe...</div>
                  )}

                  <div style={{ ...styles.sectionTitle, marginTop: 16 }}>Console State</div>
                  <div style={styles.liveGrid}>
                    <div style={styles.liveRow}><span>Zoom</span><span>{(zoom * 100).toFixed(0)}%</span></div>
                    <div style={styles.liveRow}><span>Rotation X</span><span>{rotation.x.toFixed(2)}</span></div>
                    <div style={styles.liveRow}><span>Rotation Y</span><span>{rotation.y.toFixed(2)}</span></div>
                    <div style={styles.liveRow}><span>Active FX</span><span>{activeEffects.size}</span></div>
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Bottom Bar */}
      <div style={styles.bottomBar}>
        <div style={styles.presetsRow}>
          <span style={styles.label}>Vai a:</span>
          {presets.map(p => (
            <button key={p.name} style={{ ...styles.presetBtn, ...(Math.abs(scroll - p.scroll) < 0.05 ? styles.presetBtnActive : {}) }}
              onClick={() => setScroll(p.scroll)}>
              <span>{p.emoji}</span><span>{p.name}</span>
            </button>
          ))}
        </div>

        <div style={styles.effectsRow}>
          <span style={styles.label}>Effetti:</span>
          {quickEffects.map(fx => {
            const Icon = fx.icon
            return (
              <button key={fx.id} style={{ ...styles.effectBtn, ...(activeEffects.has(fx.id) ? styles.effectBtnActive : {}) }}
                onClick={() => toggleEffect(fx.id)}>
                <Icon size={14} /><span>{fx.name}</span>
              </button>
            )
          })}

          <button style={{ ...styles.effectBtn, marginLeft: 4 }} onClick={() => setShowAdvanced(true)}>
            <Settings size={14} /><span>+Altro</span>
          </button>

          <div style={styles.separator} />

          <button style={styles.fullscreenBtn} onClick={() => iframeRef.current?.requestFullscreen?.()}>
            <Maximize2 size={14} />
          </button>
        </div>
      </div>
    </div>
  )
}

// Styles
const gold = '#d4a853'
const styles: Record<string, CSSProperties> = {
  container: { height: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: '#0a0a0a', fontFamily: 'Inter, -apple-system, sans-serif', color: '#fff', overflow: 'hidden' },

  // Top Bar
  topBar: { display: 'flex', alignItems: 'center', gap: 12, padding: '10px 16px', backgroundColor: '#141414', borderBottom: '1px solid #222' },
  homeBtn: { width: 36, height: 36, borderRadius: 8, border: '1px solid #333', background: 'transparent', color: '#888', display: 'flex', alignItems: 'center', justifyContent: 'center', textDecoration: 'none' },
  controls: { display: 'flex', alignItems: 'center', gap: 8 },
  playBtn: { width: 44, height: 44, borderRadius: '50%', border: 'none', background: `linear-gradient(135deg, ${gold} 0%, #b8942f 100%)`, color: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: `0 4px 20px ${gold}44` },
  iconBtn: { width: 36, height: 36, borderRadius: 8, border: '1px solid #333', background: 'transparent', color: '#888', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' },
  iconBtnActive: { background: '#333', color: '#fff', borderColor: gold },
  speedControl: { display: 'flex', gap: 2, padding: 2, background: '#1a1a1a', borderRadius: 6 },
  speedBtn: { padding: '5px 8px', border: 'none', background: 'transparent', color: '#555', borderRadius: 4, cursor: 'pointer', fontSize: 10, fontWeight: 600 },
  speedBtnActive: { background: '#333', color: '#fff' },

  // Timeline
  timeline: { flex: 1, height: 36, background: '#1a1a1a', borderRadius: 18, position: 'relative', cursor: 'pointer', overflow: 'visible', margin: '0 8px' },
  timelineProgress: { position: 'absolute', left: 0, top: 0, bottom: 0, background: `linear-gradient(90deg, ${gold} 0%, #f0d78c 100%)`, borderRadius: 18, opacity: 0.25 },
  marker: { position: 'absolute', top: '50%', transform: 'translate(-50%, -50%)', cursor: 'pointer', zIndex: 2 },
  markerLabel: { fontSize: 14 },
  keyframeMarker: { position: 'absolute', top: '50%', transform: 'translate(-50%, -50%)', cursor: 'pointer', zIndex: 3 },
  playhead: { position: 'absolute', top: 3, bottom: 3, width: 4, background: gold, borderRadius: 2, transform: 'translateX(-50%)', boxShadow: `0 0 10px ${gold}`, zIndex: 4 },
  scrollValue: { minWidth: 45, fontFamily: 'JetBrains Mono, monospace', fontSize: 13, fontWeight: 600, color: gold },

  // Main Area
  mainArea: { flex: 1, display: 'flex', position: 'relative', overflow: 'hidden' },
  preview: { flex: 1, position: 'relative', cursor: 'grab', transition: 'margin 0.3s ease' },
  iframe: { width: '100%', height: '100%', border: 'none', pointerEvents: 'none' },
  loading: { position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0a0a0a', color: '#666' },
  zoomIndicator: { position: 'absolute', bottom: 20, right: 20, display: 'flex', alignItems: 'center', gap: 6, padding: '6px 12px', background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(10px)', borderRadius: 20, color: '#888', fontSize: 11 },
  dragHint: { position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', display: 'flex', alignItems: 'center', gap: 8, padding: '12px 20px', background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(10px)', borderRadius: 12, color: '#fff', fontSize: 13, pointerEvents: 'none' },

  // Advanced Panel
  advancedPanel: { position: 'absolute', right: 0, top: 0, bottom: 0, width: 300, background: '#141414', borderLeft: '1px solid #222', display: 'flex', flexDirection: 'column', zIndex: 10 },
  panelHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', borderBottom: '1px solid #222' },
  panelTitle: { fontSize: 13, fontWeight: 600 },
  closeBtn: { width: 28, height: 28, borderRadius: 6, border: 'none', background: 'transparent', color: '#666', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  tabs: { display: 'flex', borderBottom: '1px solid #222' },
  tab: { flex: 1, padding: '10px', border: 'none', background: 'transparent', color: '#666', fontSize: 11, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 },
  tabActive: { background: '#1a1a1a', color: '#fff', borderBottom: `2px solid ${gold}` },
  panelContent: { flex: 1, overflow: 'auto', padding: 16 },

  // Effects
  sectionTitle: { fontSize: 10, fontWeight: 600, textTransform: 'uppercase', color: '#666', marginBottom: 8, marginTop: 16, display: 'flex', alignItems: 'center', gap: 6 },
  effectGrid: { display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 12 },
  effectChip: { padding: '6px 12px', borderRadius: 16, border: '1px solid #333', background: 'transparent', color: '#888', fontSize: 11, cursor: 'pointer' },
  effectChipActive: { background: `${gold}22`, borderColor: gold, color: gold },
  sliderRow: { display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8, fontSize: 11, color: '#888' },
  slider: { flex: 1, accentColor: gold },
  sliderValue: { width: 40, textAlign: 'right', fontFamily: 'monospace', color: '#fff' },
  subOption: { display: 'flex', alignItems: 'center', gap: 6, marginBottom: 12, fontSize: 11, color: '#666' },
  miniBtn: { padding: '4px 8px', borderRadius: 4, border: '1px solid #333', background: 'transparent', color: '#666', fontSize: 10, cursor: 'pointer' },
  miniBtnActive: { background: gold, borderColor: gold, color: '#000' },

  // Keyframes
  keyframeHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  addKfBtn: { display: 'flex', alignItems: 'center', gap: 4, padding: '6px 12px', borderRadius: 6, border: `1px solid ${gold}`, background: 'transparent', color: gold, fontSize: 11, cursor: 'pointer' },
  keyframeList: { display: 'flex', flexDirection: 'column', gap: 4 },
  keyframeItem: { display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px', borderRadius: 6, background: '#1a1a1a', cursor: 'pointer' },
  keyframeItemActive: { background: `${gold}22`, border: `1px solid ${gold}44` },
  keyframeLabel: { flex: 1, fontSize: 12, fontFamily: 'monospace' },
  deleteKfBtn: { width: 24, height: 24, borderRadius: 4, border: 'none', background: 'transparent', color: '#666', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  emptyState: { padding: 20, textAlign: 'center', color: '#555', fontSize: 12, lineHeight: 1.6 },
  keyframeTip: { marginTop: 16, padding: 12, background: '#1a1a1a', borderRadius: 6, fontSize: 11, color: '#666', display: 'flex', alignItems: 'center', gap: 6 },

  // Live
  liveGrid: { display: 'flex', flexDirection: 'column', gap: 4 },
  liveRow: { display: 'flex', justifyContent: 'space-between', padding: '6px 8px', background: '#1a1a1a', borderRadius: 4, fontSize: 11 },

  // Bottom Bar
  bottomBar: { padding: '12px 16px', background: '#141414', borderTop: '1px solid #222', display: 'flex', flexDirection: 'column', gap: 10 },
  presetsRow: { display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' },
  label: { fontSize: 10, color: '#555', textTransform: 'uppercase', letterSpacing: '0.05em', marginRight: 4 },
  presetBtn: { display: 'flex', alignItems: 'center', gap: 5, padding: '6px 12px', border: '1px solid #333', borderRadius: 16, background: 'transparent', color: '#aaa', fontSize: 11, cursor: 'pointer' },
  presetBtnActive: { background: gold, borderColor: gold, color: '#000' },
  effectsRow: { display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' },
  effectBtn: { display: 'flex', alignItems: 'center', gap: 5, padding: '6px 12px', border: '1px solid #333', borderRadius: 6, background: 'transparent', color: '#777', fontSize: 11, cursor: 'pointer' },
  effectBtnActive: { background: `${gold}22`, borderColor: gold, color: gold },
  separator: { width: 1, height: 20, background: '#333', margin: '0 4px' },
  fullscreenBtn: { width: 32, height: 32, borderRadius: 6, border: '1px solid #333', background: 'transparent', color: '#666', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', marginLeft: 'auto' },
}
