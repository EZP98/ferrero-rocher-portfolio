import { useState, useRef, CSSProperties, useEffect, useCallback } from 'react'
import {
  Play, Pause, RotateCcw, Maximize2, ZoomIn, ZoomOut, Sun, Sparkles, Move, RotateCw,
  Home, Download, Settings, X, Eye, Zap, Camera, Layers, Diamond, Trash2, Circle
} from 'lucide-react'

// ========================
// TYPES
// ========================

// Easing types
type EasingType = 'linear' | 'easeIn' | 'easeOut' | 'easeInOut'

// All animatable properties
interface AnimatableValues {
  rotX: number
  rotY: number
  rotZ: number
  posX: number
  posY: number
  posZ: number
  scale: number
  metalness: number
  roughness: number
  fov: number
  bloomIntensity: number
}

// Keyframe with values
interface AnimationKeyframe {
  id: string
  scroll: number
  easing: EasingType
  values: AnimatableValues
  label?: string
}

// ========================
// EASING FUNCTIONS
// ========================

const easings: Record<EasingType, (t: number) => number> = {
  linear: (t) => t,
  easeIn: (t) => t * t,
  easeOut: (t) => t * (2 - t),
  easeInOut: (t) => t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t,
}

// Interpolate single value
function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t
}

// Interpolate all values between two keyframes
function interpolateValues(
  from: AnimatableValues,
  to: AnimatableValues,
  t: number,
  easing: EasingType
): AnimatableValues {
  const easedT = easings[easing](t)
  return {
    rotX: lerp(from.rotX, to.rotX, easedT),
    rotY: lerp(from.rotY, to.rotY, easedT),
    rotZ: lerp(from.rotZ, to.rotZ, easedT),
    posX: lerp(from.posX, to.posX, easedT),
    posY: lerp(from.posY, to.posY, easedT),
    posZ: lerp(from.posZ, to.posZ, easedT),
    scale: lerp(from.scale, to.scale, easedT),
    metalness: lerp(from.metalness, to.metalness, easedT),
    roughness: lerp(from.roughness, to.roughness, easedT),
    fov: lerp(from.fov, to.fov, easedT),
    bloomIntensity: lerp(from.bloomIntensity, to.bloomIntensity, easedT),
  }
}

// Get interpolated values at scroll position
function getValuesAtScroll(keyframes: AnimationKeyframe[], scroll: number): AnimatableValues | null {
  if (keyframes.length === 0) return null

  // Sort by scroll
  const sorted = [...keyframes].sort((a, b) => a.scroll - b.scroll)

  // Before first keyframe
  if (scroll <= sorted[0].scroll) return sorted[0].values

  // After last keyframe
  if (scroll >= sorted[sorted.length - 1].scroll) return sorted[sorted.length - 1].values

  // Find surrounding keyframes
  for (let i = 0; i < sorted.length - 1; i++) {
    const from = sorted[i]
    const to = sorted[i + 1]

    if (scroll >= from.scroll && scroll <= to.scroll) {
      const t = (scroll - from.scroll) / (to.scroll - from.scroll)
      return interpolateValues(from.values, to.values, t, to.easing)
    }
  }

  return null
}

// Default values
const defaultValues: AnimatableValues = {
  rotX: 0,
  rotY: 0,
  rotZ: 0,
  posX: 0,
  posY: 0,
  posZ: 0,
  scale: 2.2,
  metalness: 0.8,
  roughness: 0.2,
  fov: 35,
  bloomIntensity: 1.5,
}

// ========================
// PRESETS & EFFECTS
// ========================

const presets = [
  { name: 'Hero', scroll: 0.05, emoji: '🏠' },
  { name: 'Copertura', scroll: 0.22, emoji: '🍫' },
  { name: 'Cuore', scroll: 0.37, emoji: '❤️' },
  { name: 'Eleganza', scroll: 0.52, emoji: '✨' },
  { name: 'Transition', scroll: 0.70, emoji: '🌙' },
  { name: 'End', scroll: 0.98, emoji: '🎬' },
]

const quickEffects = [
  { id: 'rotate', name: 'Ruota', icon: RotateCw },
  { id: 'float', name: 'Float', icon: Move },
  { id: 'glow', name: 'Glow', icon: Sun },
  { id: 'bloom', name: 'Bloom', icon: Sparkles },
]

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

// ========================
// COMPONENT
// ========================

export function AnimationConsole() {
  // Core state
  const [scroll, setScroll] = useState(0)
  const [playing, setPlaying] = useState(false)
  const [speed, setSpeed] = useState(1)
  const [activeEffects, setActiveEffects] = useState<Set<string>>(new Set())

  // Current values (editable directly or via keyframes)
  const [currentValues, setCurrentValues] = useState<AnimatableValues>({ ...defaultValues })

  // Direct manipulation
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)

  // Panels
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [advancedTab, setAdvancedTab] = useState<'effects' | 'keyframes' | 'live'>('keyframes')

  // Keyframes
  const [keyframes, setKeyframes] = useState<AnimationKeyframe[]>([])
  const [selectedKeyframe, setSelectedKeyframe] = useState<string | null>(null)
  const [keyframeMode, setKeyframeMode] = useState(false) // When true, scroll interpolates

  // Live data from iframe
  const [liveData, setLiveData] = useState<{
    rotX: number, rotY: number, rotZ: number,
    posX: number, posY: number, posZ: number,
    scale: number, scrollProgress: number
  } | null>(null)

  const iframeRef = useRef<HTMLIFrameElement>(null)
  const timelineRef = useRef<HTMLDivElement>(null)
  const [iframeReady, setIframeReady] = useState(false)

  // Particle type
  const [particleType, setParticleType] = useState<'sparkles' | 'snow' | 'stars'>('sparkles')

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

  // Apply values to iframe
  const applyValues = useCallback((values: AnimatableValues) => {
    sendToIframe('DEBUG_UPDATE', {
      component: 'ferrero',
      values: {
        enabled: true,
        rotX: values.rotX,
        rotY: values.rotY,
        rotZ: values.rotZ,
        posX: values.posX,
        posY: values.posY,
        posZ: values.posZ,
        scale: values.scale,
        metalness: values.metalness,
        roughness: values.roughness,
      }
    })
    sendToIframe('DEBUG_UPDATE', {
      component: 'camera',
      values: { enabled: true, fov: values.fov }
    })
    sendToIframe('DEBUG_UPDATE', {
      component: 'postProcessing',
      values: { enabled: true, bloomIntensity: values.bloomIntensity }
    })
  }, [sendToIframe])

  // Sync scroll
  const syncScroll = useCallback((value: number) => {
    if (!iframeRef.current?.contentWindow?.document) return
    const doc = iframeRef.current.contentWindow.document
    const max = doc.documentElement.scrollHeight - iframeRef.current.contentWindow.innerHeight
    iframeRef.current.contentWindow.scrollTo(0, value * max)
  }, [])

  // When scroll changes, interpolate if keyframe mode is active
  useEffect(() => {
    if (iframeReady) syncScroll(scroll)

    // Interpolate keyframe values
    if (keyframeMode && keyframes.length >= 2) {
      const interpolated = getValuesAtScroll(keyframes, scroll)
      if (interpolated) {
        setCurrentValues(interpolated)
        applyValues(interpolated)
      }
    }
  }, [scroll, iframeReady, syncScroll, keyframeMode, keyframes, applyValues])

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
    const newValues = {
      ...currentValues,
      rotX: currentValues.rotX + dy * 0.01,
      rotY: currentValues.rotY + dx * 0.01,
    }
    setCurrentValues(newValues)
    setDragStart({ x: e.clientX, y: e.clientY })
    applyValues(newValues)
  }, [isDragging, dragStart, currentValues, applyValues])

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
    const newValues = { ...currentValues, scale: 2.2 * newZoom }
    setCurrentValues(newValues)
    applyValues(newValues)
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
    const newKf: AnimationKeyframe = {
      id,
      scroll,
      easing: 'easeInOut',
      values: { ...currentValues },
      label: `${(scroll * 100).toFixed(0)}%`
    }
    setKeyframes(prev => [...prev, newKf].sort((a, b) => a.scroll - b.scroll))
    setSelectedKeyframe(id)
  }

  const removeKeyframe = (id: string) => {
    setKeyframes(prev => prev.filter(k => k.id !== id))
    if (selectedKeyframe === id) setSelectedKeyframe(null)
  }

  const updateKeyframeEasing = (id: string, easing: EasingType) => {
    setKeyframes(prev => prev.map(k => k.id === id ? { ...k, easing } : k))
  }

  const updateKeyframeValue = (id: string, prop: keyof AnimatableValues, value: number) => {
    setKeyframes(prev => prev.map(k =>
      k.id === id ? { ...k, values: { ...k.values, [prop]: value } } : k
    ))
  }

  // Update current value and apply
  const updateCurrentValue = (prop: keyof AnimatableValues, value: number) => {
    const newValues = { ...currentValues, [prop]: value }
    setCurrentValues(newValues)
    applyValues(newValues)
  }

  // Reset
  const handleReset = () => {
    setScroll(0)
    setPlaying(false)
    setActiveEffects(new Set())
    setCurrentValues({ ...defaultValues })
    setZoom(1)
    sendToIframe('DEBUG_RESET', {})
  }

  // Export
  const handleExport = () => {
    const data = {
      keyframes,
      activeEffects: Array.from(activeEffects),
      currentValues,
      timestamp: new Date().toISOString(),
    }
    navigator.clipboard.writeText(JSON.stringify(data, null, 2))
    alert('Animation exported to clipboard!')
  }

  const selectedKf = keyframes.find(k => k.id === selectedKeyframe)

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
              <Diamond size={10} fill={selectedKeyframe === kf.id ? '#d4a853' : '#d4a853'} stroke="#d4a853" />
            </div>
          ))}

          <div style={{ ...styles.playhead, left: `${scroll * 100}%` }} />
        </div>

        <div style={styles.scrollValue}>{(scroll * 100).toFixed(0)}%</div>

        {/* Keyframe Mode Toggle */}
        <button
          style={{ ...styles.iconBtn, ...(keyframeMode ? styles.iconBtnActive : {}), marginRight: 4 }}
          onClick={() => setKeyframeMode(!keyframeMode)}
          title={keyframeMode ? 'Keyframe Mode: ON' : 'Keyframe Mode: OFF'}>
          <Circle size={14} fill={keyframeMode ? '#d4a853' : 'transparent'} />
        </button>

        <button style={styles.iconBtn} onClick={handleExport} title="Export"><Download size={16} /></button>
        <button style={{ ...styles.iconBtn, ...(showAdvanced ? styles.iconBtnActive : {}) }}
          onClick={() => setShowAdvanced(!showAdvanced)} title="Advanced">
          <Settings size={16} />
        </button>
      </div>

      {/* Main Area */}
      <div style={styles.mainArea}>
        {/* Preview */}
        <div style={{ ...styles.preview, marginRight: showAdvanced ? 320 : 0 }}
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

          {/* Keyframe mode indicator */}
          {keyframeMode && keyframes.length >= 2 && (
            <div style={styles.keyframeModeIndicator}>
              <Diamond size={12} /> INTERPOLATION MODE
            </div>
          )}
        </div>

        {/* Advanced Panel */}
        {showAdvanced && (
          <div style={styles.advancedPanel} className="no-drag">
            <div style={styles.panelHeader}>
              <span style={styles.panelTitle}>Controlli</span>
              <button style={styles.closeBtn} onClick={() => setShowAdvanced(false)}><X size={16} /></button>
            </div>

            {/* Tabs */}
            <div style={styles.tabs}>
              {(['keyframes', 'effects', 'live'] as const).map(tab => (
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
              {/* Keyframes Tab - Now Primary */}
              {advancedTab === 'keyframes' && (
                <>
                  <div style={styles.keyframeHeader}>
                    <div>
                      <span style={styles.kfCount}>{keyframes.length} keyframes</span>
                      {keyframeMode && keyframes.length >= 2 && (
                        <span style={styles.kfInterpolating}> - Interpolating</span>
                      )}
                    </div>
                    <button style={styles.recordBtn} onClick={addKeyframe}>
                      <Circle size={10} fill="#ff4444" /> REC
                    </button>
                  </div>

                  {/* Keyframe List */}
                  <div style={styles.keyframeList}>
                    {keyframes.map((kf, i) => (
                      <div
                        key={kf.id}
                        style={{
                          ...styles.keyframeItem,
                          ...(selectedKeyframe === kf.id ? styles.keyframeItemActive : {})
                        }}
                        onClick={() => { setScroll(kf.scroll); setSelectedKeyframe(kf.id) }}>
                        <div style={styles.kfLeft}>
                          <Diamond size={12} fill="#d4a853" />
                          <span style={styles.kfIndex}>#{i + 1}</span>
                          <span style={styles.kfScroll}>{(kf.scroll * 100).toFixed(0)}%</span>
                        </div>
                        <select
                          style={styles.easingSelect}
                          value={kf.easing}
                          onClick={e => e.stopPropagation()}
                          onChange={e => updateKeyframeEasing(kf.id, e.target.value as EasingType)}>
                          <option value="linear">Linear</option>
                          <option value="easeIn">Ease In</option>
                          <option value="easeOut">Ease Out</option>
                          <option value="easeInOut">Ease InOut</option>
                        </select>
                        <button
                          style={styles.deleteKfBtn}
                          onClick={e => { e.stopPropagation(); removeKeyframe(kf.id) }}>
                          <Trash2 size={12} />
                        </button>
                      </div>
                    ))}
                  </div>

                  {/* Selected Keyframe Editor */}
                  {selectedKf && (
                    <div style={styles.keyframeEditor}>
                      <div style={styles.editorTitle}>
                        Keyframe @ {(selectedKf.scroll * 100).toFixed(0)}%
                      </div>

                      <div style={styles.propertyGroup}>
                        <div style={styles.groupTitle}>Rotation</div>
                        {(['rotX', 'rotY', 'rotZ'] as const).map(prop => (
                          <div key={prop} style={styles.propRow}>
                            <span style={styles.propLabel}>{prop}</span>
                            <input
                              type="range"
                              min={-Math.PI}
                              max={Math.PI}
                              step={0.01}
                              value={selectedKf.values[prop]}
                              onChange={e => updateKeyframeValue(selectedKf.id, prop, parseFloat(e.target.value))}
                              style={styles.propSlider}
                            />
                            <span style={styles.propValue}>{selectedKf.values[prop].toFixed(2)}</span>
                          </div>
                        ))}
                      </div>

                      <div style={styles.propertyGroup}>
                        <div style={styles.groupTitle}>Position</div>
                        {(['posX', 'posY', 'posZ'] as const).map(prop => (
                          <div key={prop} style={styles.propRow}>
                            <span style={styles.propLabel}>{prop}</span>
                            <input
                              type="range"
                              min={-5}
                              max={5}
                              step={0.1}
                              value={selectedKf.values[prop]}
                              onChange={e => updateKeyframeValue(selectedKf.id, prop, parseFloat(e.target.value))}
                              style={styles.propSlider}
                            />
                            <span style={styles.propValue}>{selectedKf.values[prop].toFixed(2)}</span>
                          </div>
                        ))}
                      </div>

                      <div style={styles.propertyGroup}>
                        <div style={styles.groupTitle}>Transform</div>
                        <div style={styles.propRow}>
                          <span style={styles.propLabel}>scale</span>
                          <input
                            type="range"
                            min={0.5}
                            max={5}
                            step={0.1}
                            value={selectedKf.values.scale}
                            onChange={e => updateKeyframeValue(selectedKf.id, 'scale', parseFloat(e.target.value))}
                            style={styles.propSlider}
                          />
                          <span style={styles.propValue}>{selectedKf.values.scale.toFixed(2)}</span>
                        </div>
                      </div>

                      <div style={styles.propertyGroup}>
                        <div style={styles.groupTitle}>Material</div>
                        {(['metalness', 'roughness'] as const).map(prop => (
                          <div key={prop} style={styles.propRow}>
                            <span style={styles.propLabel}>{prop}</span>
                            <input
                              type="range"
                              min={0}
                              max={1}
                              step={0.05}
                              value={selectedKf.values[prop]}
                              onChange={e => updateKeyframeValue(selectedKf.id, prop, parseFloat(e.target.value))}
                              style={styles.propSlider}
                            />
                            <span style={styles.propValue}>{selectedKf.values[prop].toFixed(2)}</span>
                          </div>
                        ))}
                      </div>

                      <div style={styles.propertyGroup}>
                        <div style={styles.groupTitle}>Camera & FX</div>
                        <div style={styles.propRow}>
                          <span style={styles.propLabel}>fov</span>
                          <input
                            type="range"
                            min={15}
                            max={90}
                            step={1}
                            value={selectedKf.values.fov}
                            onChange={e => updateKeyframeValue(selectedKf.id, 'fov', parseFloat(e.target.value))}
                            style={styles.propSlider}
                          />
                          <span style={styles.propValue}>{selectedKf.values.fov.toFixed(0)}°</span>
                        </div>
                        <div style={styles.propRow}>
                          <span style={styles.propLabel}>bloom</span>
                          <input
                            type="range"
                            min={0}
                            max={5}
                            step={0.1}
                            value={selectedKf.values.bloomIntensity}
                            onChange={e => updateKeyframeValue(selectedKf.id, 'bloomIntensity', parseFloat(e.target.value))}
                            style={styles.propSlider}
                          />
                          <span style={styles.propValue}>{selectedKf.values.bloomIntensity.toFixed(1)}</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* No keyframes state */}
                  {keyframes.length === 0 && (
                    <div style={styles.emptyState}>
                      <Diamond size={24} stroke="#444" />
                      <div style={styles.emptyTitle}>Nessun keyframe</div>
                      <div style={styles.emptyText}>
                        Premi REC per salvare la posizione e i valori correnti come keyframe.
                      </div>
                    </div>
                  )}

                  {/* Quick current values editor */}
                  {!selectedKf && keyframes.length > 0 && (
                    <div style={styles.currentValuesHint}>
                      Seleziona un keyframe per modificarne i valori
                    </div>
                  )}
                </>
              )}

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
                    <input type="range" min={0} max={1} step={0.05} value={currentValues.metalness}
                      onChange={e => updateCurrentValue('metalness', parseFloat(e.target.value))} style={styles.slider} />
                    <span style={styles.sliderValue}>{currentValues.metalness.toFixed(2)}</span>
                  </div>
                  <div style={styles.sliderRow}>
                    <span>Roughness</span>
                    <input type="range" min={0} max={1} step={0.05} value={currentValues.roughness}
                      onChange={e => updateCurrentValue('roughness', parseFloat(e.target.value))} style={styles.slider} />
                    <span style={styles.sliderValue}>{currentValues.roughness.toFixed(2)}</span>
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
                    <input type="range" min={15} max={90} step={5} value={currentValues.fov}
                      onChange={e => updateCurrentValue('fov', parseInt(e.target.value))} style={styles.slider} />
                    <span style={styles.sliderValue}>{currentValues.fov}°</span>
                  </div>
                </>
              )}

              {/* Live Tab */}
              {advancedTab === 'live' && (
                <>
                  <div style={styles.sectionTitle}><Eye size={12} /> Iframe Data</div>
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

                  <div style={{ ...styles.sectionTitle, marginTop: 16 }}>Current Values</div>
                  <div style={styles.liveGrid}>
                    <div style={styles.liveRow}><span>Rot X</span><span>{currentValues.rotX.toFixed(2)}</span></div>
                    <div style={styles.liveRow}><span>Rot Y</span><span>{currentValues.rotY.toFixed(2)}</span></div>
                    <div style={styles.liveRow}><span>Scale</span><span>{currentValues.scale.toFixed(2)}</span></div>
                    <div style={styles.liveRow}><span>FOV</span><span>{currentValues.fov}°</span></div>
                    <div style={styles.liveRow}><span>Metalness</span><span>{currentValues.metalness.toFixed(2)}</span></div>
                    <div style={styles.liveRow}><span>Bloom</span><span>{currentValues.bloomIntensity.toFixed(1)}</span></div>
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

          <button style={{ ...styles.effectBtn, marginLeft: 4 }} onClick={() => { setShowAdvanced(true); setAdvancedTab('keyframes') }}>
            <Diamond size={14} /><span>Keyframes</span>
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

// ========================
// STYLES
// ========================

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
  keyframeModeIndicator: { position: 'absolute', top: 20, left: '50%', transform: 'translateX(-50%)', display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px', background: `${gold}22`, border: `1px solid ${gold}44`, borderRadius: 20, color: gold, fontSize: 11, fontWeight: 600 },

  // Advanced Panel
  advancedPanel: { position: 'absolute', right: 0, top: 0, bottom: 0, width: 320, background: '#141414', borderLeft: '1px solid #222', display: 'flex', flexDirection: 'column', zIndex: 10 },
  panelHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', borderBottom: '1px solid #222' },
  panelTitle: { fontSize: 13, fontWeight: 600 },
  closeBtn: { width: 28, height: 28, borderRadius: 6, border: 'none', background: 'transparent', color: '#666', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  tabs: { display: 'flex', borderBottom: '1px solid #222' },
  tab: { flex: 1, padding: '10px', border: 'none', background: 'transparent', color: '#666', fontSize: 11, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 },
  tabActive: { background: '#1a1a1a', color: '#fff', borderBottom: `2px solid ${gold}` },
  panelContent: { flex: 1, overflow: 'auto', padding: 16 },

  // Keyframes Tab
  keyframeHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  kfCount: { fontSize: 12, color: '#888' },
  kfInterpolating: { fontSize: 10, color: gold },
  recordBtn: { display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', borderRadius: 6, border: '1px solid #ff4444', background: 'rgba(255,68,68,0.1)', color: '#ff6666', fontSize: 11, fontWeight: 600, cursor: 'pointer' },
  keyframeList: { display: 'flex', flexDirection: 'column', gap: 4, marginBottom: 16 },
  keyframeItem: { display: 'flex', alignItems: 'center', gap: 8, padding: '10px 12px', borderRadius: 6, background: '#1a1a1a', cursor: 'pointer', border: '1px solid transparent' },
  keyframeItemActive: { background: `${gold}15`, borderColor: `${gold}44` },
  kfLeft: { display: 'flex', alignItems: 'center', gap: 8, flex: 1 },
  kfIndex: { fontSize: 10, color: '#666' },
  kfScroll: { fontSize: 12, fontFamily: 'monospace', color: '#fff' },
  easingSelect: { padding: '4px 8px', borderRadius: 4, border: '1px solid #333', background: '#0a0a0a', color: '#888', fontSize: 10, cursor: 'pointer' },
  deleteKfBtn: { width: 24, height: 24, borderRadius: 4, border: 'none', background: 'transparent', color: '#666', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' },

  // Keyframe Editor
  keyframeEditor: { padding: 12, background: '#1a1a1a', borderRadius: 8, marginTop: 8 },
  editorTitle: { fontSize: 11, fontWeight: 600, color: gold, marginBottom: 12, textTransform: 'uppercase', letterSpacing: '0.05em' },
  propertyGroup: { marginBottom: 12 },
  groupTitle: { fontSize: 10, color: '#666', marginBottom: 6, textTransform: 'uppercase' },
  propRow: { display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 },
  propLabel: { width: 50, fontSize: 10, color: '#888', fontFamily: 'monospace' },
  propSlider: { flex: 1, accentColor: gold, height: 4 },
  propValue: { width: 45, fontSize: 10, color: '#fff', fontFamily: 'monospace', textAlign: 'right' },

  // Empty state
  emptyState: { padding: 32, textAlign: 'center', color: '#555' },
  emptyTitle: { fontSize: 14, fontWeight: 500, marginTop: 12, marginBottom: 8, color: '#888' },
  emptyText: { fontSize: 12, lineHeight: 1.5, color: '#555' },
  currentValuesHint: { padding: 16, textAlign: 'center', fontSize: 11, color: '#555', fontStyle: 'italic' },

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
