import { useState, useRef, CSSProperties, useEffect, useCallback } from 'react'
import { Play, Pause, RotateCcw, Maximize2, ZoomIn, ZoomOut, Sun, Sparkles, Move, RotateCw } from 'lucide-react'

// Simple, intuitive Animation Console
// - Big timeline at top
// - Full preview in center
// - Quick presets at bottom
// - Drag to rotate, scroll to zoom

const presets = [
  { name: 'Hero', scroll: 0.05, emoji: '🏠' },
  { name: 'Copertura', scroll: 0.22, emoji: '🍫' },
  { name: 'Cuore', scroll: 0.37, emoji: '❤️' },
  { name: 'Eleganza', scroll: 0.52, emoji: '✨' },
  { name: 'Transition', scroll: 0.70, emoji: '🌙' },
  { name: 'End', scroll: 0.98, emoji: '🎬' },
]

const effects = [
  { id: 'rotate', name: 'Ruota', icon: RotateCw, active: false },
  { id: 'float', name: 'Fluttua', icon: Move, active: false },
  { id: 'glow', name: 'Glow', icon: Sun, active: false },
  { id: 'bloom', name: 'Bloom', icon: Sparkles, active: false },
]

export function AnimationConsole() {
  const [scroll, setScroll] = useState(0)
  const [playing, setPlaying] = useState(false)
  const [speed, setSpeed] = useState(1)
  const [activeEffects, setActiveEffects] = useState<Set<string>>(new Set())
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const [rotation, setRotation] = useState({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)

  const iframeRef = useRef<HTMLIFrameElement>(null)
  const timelineRef = useRef<HTMLDivElement>(null)
  const [iframeReady, setIframeReady] = useState(false)

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
        if (prev >= 1) {
          setPlaying(false)
          return 0
        }
        return prev + (0.0002 * speed)
      })
    }, 16)
    return () => clearInterval(interval)
  }, [playing, speed])

  // Toggle effect
  const toggleEffect = (id: string) => {
    setActiveEffects(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)

      // Send to iframe
      sendToIframe('DEBUG_UPDATE', {
        component: id === 'rotate' || id === 'float' ? 'ferrero' : id === 'glow' ? 'title' : 'postProcessing',
        values: {
          enabled: true,
          ...(id === 'rotate' && { autoRotate: !prev.has(id), autoRotateSpeed: 1.5 }),
          ...(id === 'float' && { floatEnabled: !prev.has(id), floatAmplitude: 0.3 }),
          ...(id === 'glow' && { glowEnabled: !prev.has(id), glowIntensity: 15 }),
          ...(id === 'bloom' && { bloomEnabled: !prev.has(id), bloomIntensity: 1.5 }),
        }
      })

      return next
    })
  }

  // Direct manipulation - drag to rotate
  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.target !== iframeRef.current?.parentElement) return
    setIsDragging(true)
    setDragStart({ x: e.clientX, y: e.clientY })
  }

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging) return
    const dx = e.clientX - dragStart.x
    const dy = e.clientY - dragStart.y

    setRotation(prev => ({
      x: prev.x + dy * 0.01,
      y: prev.y + dx * 0.01
    }))
    setDragStart({ x: e.clientX, y: e.clientY })

    sendToIframe('DEBUG_UPDATE', {
      component: 'ferrero',
      values: {
        enabled: true,
        rotX: rotation.x + dy * 0.01,
        rotY: rotation.y + dx * 0.01,
      }
    })
  }, [isDragging, dragStart, rotation, sendToIframe])

  const handleMouseUp = useCallback(() => {
    setIsDragging(false)
  }, [])

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
    e.preventDefault()
    const delta = e.deltaY > 0 ? -0.1 : 0.1
    const newZoom = Math.max(0.5, Math.min(3, zoom + delta))
    setZoom(newZoom)

    sendToIframe('DEBUG_UPDATE', {
      component: 'ferrero',
      values: { enabled: true, scale: 2.2 * newZoom }
    })
  }

  // Timeline click
  const handleTimelineClick = (e: React.MouseEvent) => {
    if (!timelineRef.current) return
    const rect = timelineRef.current.getBoundingClientRect()
    const x = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width))
    setScroll(x)
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

  return (
    <div style={styles.container}>
      {/* Top Bar - Big Timeline */}
      <div style={styles.topBar}>
        <div style={styles.controls}>
          <button style={styles.playBtn} onClick={() => setPlaying(!playing)}>
            {playing ? <Pause size={20} /> : <Play size={20} />}
          </button>

          <button style={styles.iconBtn} onClick={handleReset}>
            <RotateCcw size={16} />
          </button>

          <div style={styles.speedControl}>
            {[0.5, 1, 2].map(s => (
              <button
                key={s}
                style={{ ...styles.speedBtn, ...(speed === s ? styles.speedBtnActive : {}) }}
                onClick={() => setSpeed(s)}
              >
                {s}x
              </button>
            ))}
          </div>
        </div>

        {/* Big Timeline */}
        <div
          style={styles.timeline}
          ref={timelineRef}
          onClick={handleTimelineClick}
          onMouseDown={e => {
            handleTimelineClick(e)
            const onMove = (ev: MouseEvent) => {
              if (!timelineRef.current) return
              const rect = timelineRef.current.getBoundingClientRect()
              setScroll(Math.max(0, Math.min(1, (ev.clientX - rect.left) / rect.width)))
            }
            const onUp = () => {
              window.removeEventListener('mousemove', onMove)
              window.removeEventListener('mouseup', onUp)
            }
            window.addEventListener('mousemove', onMove)
            window.addEventListener('mouseup', onUp)
          }}
        >
          {/* Progress */}
          <div style={{ ...styles.timelineProgress, width: `${scroll * 100}%` }} />

          {/* Markers */}
          {presets.map(p => (
            <div
              key={p.name}
              style={{ ...styles.marker, left: `${p.scroll * 100}%` }}
              onClick={(e) => { e.stopPropagation(); setScroll(p.scroll) }}
            >
              <span style={styles.markerDot} />
              <span style={styles.markerLabel}>{p.emoji}</span>
            </div>
          ))}

          {/* Playhead */}
          <div style={{ ...styles.playhead, left: `${scroll * 100}%` }} />
        </div>

        <div style={styles.scrollValue}>{(scroll * 100).toFixed(0)}%</div>
      </div>

      {/* Main Preview */}
      <div
        style={styles.preview}
        onMouseDown={handleMouseDown}
        onWheel={handleWheel}
      >
        <iframe
          ref={iframeRef}
          src="/?debug=true"
          style={styles.iframe}
          onLoad={() => { setIframeReady(true); syncScroll(scroll) }}
        />

        {!iframeReady && (
          <div style={styles.loading}>Caricamento...</div>
        )}

        {/* Zoom indicator */}
        <div style={styles.zoomIndicator}>
          <ZoomOut size={12} />
          <span>{(zoom * 100).toFixed(0)}%</span>
          <ZoomIn size={12} />
        </div>

        {/* Drag hint */}
        {isDragging && (
          <div style={styles.dragHint}>
            <Move size={16} /> Trascina per ruotare
          </div>
        )}
      </div>

      {/* Bottom Bar - Presets & Effects */}
      <div style={styles.bottomBar}>
        {/* Position Presets */}
        <div style={styles.presetsRow}>
          <span style={styles.label}>Vai a:</span>
          {presets.map(p => (
            <button
              key={p.name}
              style={{
                ...styles.presetBtn,
                ...(Math.abs(scroll - p.scroll) < 0.05 ? styles.presetBtnActive : {})
              }}
              onClick={() => setScroll(p.scroll)}
            >
              <span style={styles.presetEmoji}>{p.emoji}</span>
              <span>{p.name}</span>
            </button>
          ))}
        </div>

        {/* Effects */}
        <div style={styles.effectsRow}>
          <span style={styles.label}>Effetti:</span>
          {effects.map(fx => {
            const Icon = fx.icon
            const isActive = activeEffects.has(fx.id)
            return (
              <button
                key={fx.id}
                style={{
                  ...styles.effectBtn,
                  ...(isActive ? styles.effectBtnActive : {})
                }}
                onClick={() => toggleEffect(fx.id)}
              >
                <Icon size={14} />
                <span>{fx.name}</span>
              </button>
            )
          })}

          <div style={styles.separator} />

          <button style={styles.fullscreenBtn} onClick={() => {
            iframeRef.current?.requestFullscreen?.()
          }}>
            <Maximize2 size={14} />
          </button>
        </div>
      </div>
    </div>
  )
}

const styles: Record<string, CSSProperties> = {
  container: {
    height: '100vh',
    display: 'flex',
    flexDirection: 'column',
    backgroundColor: '#0a0a0a',
    fontFamily: 'Inter, -apple-system, sans-serif',
    color: '#fff',
    overflow: 'hidden',
  },

  // Top Bar
  topBar: {
    display: 'flex',
    alignItems: 'center',
    gap: 16,
    padding: '12px 20px',
    backgroundColor: '#141414',
    borderBottom: '1px solid #222',
  },
  controls: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
  },
  playBtn: {
    width: 44,
    height: 44,
    borderRadius: '50%',
    border: 'none',
    background: 'linear-gradient(135deg, #d4a853 0%, #b8942f 100%)',
    color: '#000',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    boxShadow: '0 4px 20px rgba(212, 168, 83, 0.3)',
    transition: 'transform 0.2s, box-shadow 0.2s',
  },
  iconBtn: {
    width: 36,
    height: 36,
    borderRadius: 8,
    border: '1px solid #333',
    background: 'transparent',
    color: '#888',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
  },
  speedControl: {
    display: 'flex',
    gap: 2,
    padding: 2,
    background: '#1a1a1a',
    borderRadius: 6,
  },
  speedBtn: {
    padding: '6px 10px',
    border: 'none',
    background: 'transparent',
    color: '#666',
    borderRadius: 4,
    cursor: 'pointer',
    fontSize: 11,
    fontWeight: 600,
  },
  speedBtnActive: {
    background: '#333',
    color: '#fff',
  },

  // Timeline
  timeline: {
    flex: 1,
    height: 40,
    background: '#1a1a1a',
    borderRadius: 20,
    position: 'relative',
    cursor: 'pointer',
    overflow: 'hidden',
  },
  timelineProgress: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    background: 'linear-gradient(90deg, #d4a853 0%, #f0d78c 100%)',
    borderRadius: 20,
    opacity: 0.3,
  },
  marker: {
    position: 'absolute',
    top: '50%',
    transform: 'translate(-50%, -50%)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 2,
    cursor: 'pointer',
    zIndex: 2,
  },
  markerDot: {
    width: 4,
    height: 4,
    borderRadius: '50%',
    background: '#555',
  },
  markerLabel: {
    fontSize: 12,
    opacity: 0.7,
  },
  playhead: {
    position: 'absolute',
    top: 4,
    bottom: 4,
    width: 4,
    background: '#d4a853',
    borderRadius: 2,
    transform: 'translateX(-50%)',
    boxShadow: '0 0 10px #d4a853',
    zIndex: 3,
  },
  scrollValue: {
    minWidth: 50,
    textAlign: 'right',
    fontFamily: 'JetBrains Mono, monospace',
    fontSize: 14,
    fontWeight: 600,
    color: '#d4a853',
  },

  // Preview
  preview: {
    flex: 1,
    position: 'relative',
    cursor: 'grab',
  },
  iframe: {
    width: '100%',
    height: '100%',
    border: 'none',
    pointerEvents: 'none', // Disable iframe interaction, we handle it
  },
  loading: {
    position: 'absolute',
    inset: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: '#0a0a0a',
    color: '#666',
    fontSize: 14,
  },
  zoomIndicator: {
    position: 'absolute',
    bottom: 80,
    right: 20,
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    padding: '6px 12px',
    background: 'rgba(0,0,0,0.6)',
    backdropFilter: 'blur(10px)',
    borderRadius: 20,
    color: '#888',
    fontSize: 11,
  },
  dragHint: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    padding: '12px 20px',
    background: 'rgba(0,0,0,0.8)',
    backdropFilter: 'blur(10px)',
    borderRadius: 12,
    color: '#fff',
    fontSize: 13,
    pointerEvents: 'none',
  },

  // Bottom Bar
  bottomBar: {
    padding: '16px 20px',
    background: '#141414',
    borderTop: '1px solid #222',
    display: 'flex',
    flexDirection: 'column',
    gap: 12,
  },
  presetsRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
  },
  label: {
    fontSize: 11,
    color: '#666',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    marginRight: 8,
  },
  presetBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    padding: '8px 14px',
    border: '1px solid #333',
    borderRadius: 20,
    background: 'transparent',
    color: '#aaa',
    fontSize: 12,
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  presetBtnActive: {
    background: '#d4a853',
    borderColor: '#d4a853',
    color: '#000',
  },
  presetEmoji: {
    fontSize: 14,
  },

  effectsRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
  },
  effectBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    padding: '8px 14px',
    border: '1px solid #333',
    borderRadius: 8,
    background: 'transparent',
    color: '#888',
    fontSize: 12,
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  effectBtnActive: {
    background: 'rgba(212, 168, 83, 0.2)',
    borderColor: '#d4a853',
    color: '#d4a853',
  },
  separator: {
    width: 1,
    height: 24,
    background: '#333',
    margin: '0 8px',
  },
  fullscreenBtn: {
    width: 36,
    height: 36,
    borderRadius: 8,
    border: '1px solid #333',
    background: 'transparent',
    color: '#666',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    marginLeft: 'auto',
  },
}
