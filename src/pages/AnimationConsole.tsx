/**
 * Animation Console
 *
 * Bezier curve implementation inspired by Theatre.js
 * https://github.com/theatre-js/theatre
 * Licensed under Apache 2.0
 *
 * Theatre.js Copyright (c) 2020 Aria Minaei
 */

import { useState, useRef, CSSProperties, useEffect, useCallback } from 'react'
import {
  Play, Pause, RotateCcw, Maximize2, ZoomIn, ZoomOut, Sun, Sparkles, Move, RotateCw,
  Home, Download, Settings, X, Eye, Diamond, Trash2, Circle,
  Bookmark, SkipBack, SkipForward, Repeat, Undo, Redo, Upload
} from 'lucide-react'

// ========================
// TYPES
// ========================

type EasingType = 'linear' | 'easeIn' | 'easeOut' | 'easeInOut' | 'bezier'

interface BezierHandle {
  x: number // 0-1
  y: number // can be outside 0-1 for overshoot
}

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

interface AnimationKeyframe {
  id: string
  scroll: number
  easing: EasingType
  bezierHandles?: { left: BezierHandle; right: BezierHandle } // For custom bezier
  values: AnimatableValues
  label?: string
}

interface Bookmark {
  id: string
  scroll: number
  label: string
  color: string
}

interface FocusRange {
  start: number
  end: number
}

// History for undo/redo
interface HistoryState {
  keyframes: AnimationKeyframe[]
  bookmarks: Bookmark[]
}

// ========================
// CUBIC BEZIER (Theatre.js inspired)
// ========================

class UnitBezier {
  private cx: number
  private bx: number
  private ax: number
  private cy: number
  private by: number
  private ay: number

  constructor(p1x: number, p1y: number, p2x: number, p2y: number) {
    // Calculate polynomial coefficients
    this.cx = 3.0 * p1x
    this.bx = 3.0 * (p2x - p1x) - this.cx
    this.ax = 1.0 - this.cx - this.bx

    this.cy = 3.0 * p1y
    this.by = 3.0 * (p2y - p1y) - this.cy
    this.ay = 1.0 - this.cy - this.by
  }

  private sampleCurveX(t: number): number {
    return ((this.ax * t + this.bx) * t + this.cx) * t
  }

  private sampleCurveY(t: number): number {
    return ((this.ay * t + this.by) * t + this.cy) * t
  }

  private sampleCurveDerivativeX(t: number): number {
    return (3.0 * this.ax * t + 2.0 * this.bx) * t + this.cx
  }

  // Newton-Raphson iteration to find t for given x
  private solveCurveX(x: number, epsilon: number = 1e-6): number {
    let t = x
    for (let i = 0; i < 8; i++) {
      const x2 = this.sampleCurveX(t) - x
      if (Math.abs(x2) < epsilon) return t
      const d2 = this.sampleCurveDerivativeX(t)
      if (Math.abs(d2) < 1e-6) break
      t = t - x2 / d2
    }
    // Fallback to bisection
    let t0 = 0, t1 = 1
    t = x
    while (t0 < t1) {
      const x2 = this.sampleCurveX(t)
      if (Math.abs(x2 - x) < epsilon) return t
      if (x > x2) t0 = t
      else t1 = t
      t = (t1 - t0) * 0.5 + t0
    }
    return t
  }

  solve(x: number): number {
    return this.sampleCurveY(this.solveCurveX(x))
  }
}

// Preset bezier curves - exported for future visual curve editor
export const bezierPresets: Record<string, [number, number, number, number]> = {
  ease: [0.25, 0.1, 0.25, 1.0],
  easeIn: [0.42, 0, 1.0, 1.0],
  easeOut: [0, 0, 0.58, 1.0],
  easeInOut: [0.42, 0, 0.58, 1.0],
  easeInBack: [0.6, -0.28, 0.735, 0.045],
  easeOutBack: [0.175, 0.885, 0.32, 1.275],
  easeInOutBack: [0.68, -0.55, 0.265, 1.55],
  easeInElastic: [0.5, -0.5, 0.75, -0.5],
  easeOutBounce: [0.34, 1.56, 0.64, 1],
}

// ========================
// EASING FUNCTIONS
// ========================

const easings: Record<string, (t: number) => number> = {
  linear: (t) => t,
  easeIn: (t) => new UnitBezier(0.42, 0, 1.0, 1.0).solve(t),
  easeOut: (t) => new UnitBezier(0, 0, 0.58, 1.0).solve(t),
  easeInOut: (t) => new UnitBezier(0.42, 0, 0.58, 1.0).solve(t),
}

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t
}

function getEasedT(t: number, easing: EasingType, handles?: { left: BezierHandle; right: BezierHandle }): number {
  if (easing === 'bezier' && handles) {
    const bezier = new UnitBezier(handles.left.x, handles.left.y, handles.right.x, handles.right.y)
    return bezier.solve(t)
  }
  return (easings[easing] || easings.linear)(t)
}

function interpolateValues(
  from: AnimatableValues,
  to: AnimatableValues,
  t: number,
  easing: EasingType,
  handles?: { left: BezierHandle; right: BezierHandle }
): AnimatableValues {
  const easedT = getEasedT(t, easing, handles)
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

function getValuesAtScroll(keyframes: AnimationKeyframe[], scroll: number): AnimatableValues | null {
  if (keyframes.length === 0) return null
  const sorted = [...keyframes].sort((a, b) => a.scroll - b.scroll)
  if (scroll <= sorted[0].scroll) return sorted[0].values
  if (scroll >= sorted[sorted.length - 1].scroll) return sorted[sorted.length - 1].values
  for (let i = 0; i < sorted.length - 1; i++) {
    const from = sorted[i]
    const to = sorted[i + 1]
    if (scroll >= from.scroll && scroll <= to.scroll) {
      const t = (scroll - from.scroll) / (to.scroll - from.scroll)
      return interpolateValues(from.values, to.values, t, to.easing, to.bezierHandles)
    }
  }
  return null
}

const defaultValues: AnimatableValues = {
  rotX: 0, rotY: 0, rotZ: 0,
  posX: 0, posY: 0, posZ: 0,
  scale: 2.2,
  metalness: 0.8, roughness: 0.2,
  fov: 35, bloomIntensity: 1.5,
}

const bookmarkColors = ['#d4a853', '#4a9eff', '#ff6b6b', '#51cf66', '#cc5de8', '#ff922b']

// ========================
// COMPONENT
// ========================

export function AnimationConsole() {
  // Core state
  const [scroll, setScroll] = useState(0)
  const [playing, setPlaying] = useState(false)
  const [speed, setSpeed] = useState(1)
  const [currentValues, setCurrentValues] = useState<AnimatableValues>({ ...defaultValues })

  // Direct manipulation
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)

  // Panels
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [advancedTab, setAdvancedTab] = useState<'keyframes' | 'bookmarks' | 'live'>('keyframes')

  // Keyframes
  const [keyframes, setKeyframes] = useState<AnimationKeyframe[]>([])
  const [selectedKeyframe, setSelectedKeyframe] = useState<string | null>(null)
  const [keyframeMode, setKeyframeMode] = useState(false)
  const [draggingKeyframe, setDraggingKeyframe] = useState<string | null>(null)

  // Bookmarks
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([])

  // Focus range
  const [focusRange, setFocusRange] = useState<FocusRange | null>(null)
  const [loopFocusRange, setLoopFocusRange] = useState(false)

  // Effects
  const [activeEffects, setActiveEffects] = useState<Set<string>>(new Set())

  // Undo/Redo history
  const [history, setHistory] = useState<HistoryState[]>([{ keyframes: [], bookmarks: [] }])
  const [historyIndex, setHistoryIndex] = useState(0)

  // Live data
  const [liveData, setLiveData] = useState<{
    rotX: number, rotY: number, rotZ: number,
    posX: number, posY: number, posZ: number,
    scale: number, scrollProgress: number
  } | null>(null)

  const iframeRef = useRef<HTMLIFrameElement>(null)
  const timelineRef = useRef<HTMLDivElement>(null)
  const [iframeReady, setIframeReady] = useState(false)

  // Push to history (for undo/redo)
  const pushHistory = useCallback(() => {
    const newState: HistoryState = {
      keyframes: JSON.parse(JSON.stringify(keyframes)),
      bookmarks: JSON.parse(JSON.stringify(bookmarks)),
    }
    setHistory(prev => [...prev.slice(0, historyIndex + 1), newState])
    setHistoryIndex(prev => prev + 1)
  }, [keyframes, bookmarks, historyIndex])

  // Undo
  const undo = useCallback(() => {
    if (historyIndex > 0) {
      const prevState = history[historyIndex - 1]
      setKeyframes(prevState.keyframes)
      setBookmarks(prevState.bookmarks)
      setHistoryIndex(prev => prev - 1)
    }
  }, [history, historyIndex])

  // Redo
  const redo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      const nextState = history[historyIndex + 1]
      setKeyframes(nextState.keyframes)
      setBookmarks(nextState.bookmarks)
      setHistoryIndex(prev => prev + 1)
    }
  }, [history, historyIndex])

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

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey) {
        if (e.key === 'z' && !e.shiftKey) { e.preventDefault(); undo() }
        if ((e.key === 'z' && e.shiftKey) || e.key === 'y') { e.preventDefault(); redo() }
      }
      if (e.key === ' ') { e.preventDefault(); setPlaying(p => !p) }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [undo, redo])

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
        rotX: values.rotX, rotY: values.rotY, rotZ: values.rotZ,
        posX: values.posX, posY: values.posY, posZ: values.posZ,
        scale: values.scale, metalness: values.metalness, roughness: values.roughness,
      }
    })
    sendToIframe('DEBUG_UPDATE', { component: 'camera', values: { enabled: true, fov: values.fov } })
    sendToIframe('DEBUG_UPDATE', { component: 'postProcessing', values: { enabled: true, bloomIntensity: values.bloomIntensity } })
  }, [sendToIframe])

  // Sync scroll
  const syncScroll = useCallback((value: number) => {
    if (!iframeRef.current?.contentWindow?.document) return
    const doc = iframeRef.current.contentWindow.document
    const max = doc.documentElement.scrollHeight - iframeRef.current.contentWindow.innerHeight
    iframeRef.current.contentWindow.scrollTo(0, value * max)
  }, [])

  // When scroll changes
  useEffect(() => {
    if (iframeReady) syncScroll(scroll)
    if (keyframeMode && keyframes.length >= 2) {
      const interpolated = getValuesAtScroll(keyframes, scroll)
      if (interpolated) {
        setCurrentValues(interpolated)
        applyValues(interpolated)
      }
    }
  }, [scroll, iframeReady, syncScroll, keyframeMode, keyframes, applyValues])

  // Playback with focus range
  useEffect(() => {
    if (!playing) return
    const interval = setInterval(() => {
      setScroll(prev => {
        const rangeStart = focusRange?.start ?? 0
        const rangeEnd = focusRange?.end ?? 1
        let next = prev + (0.0002 * speed)
        if (loopFocusRange && focusRange) {
          if (next >= rangeEnd) return rangeStart
        } else {
          if (next >= rangeEnd) { setPlaying(false); return rangeEnd }
        }
        return next
      })
    }, 16)
    return () => clearInterval(interval)
  }, [playing, speed, focusRange, loopFocusRange])

  // Toggle effect
  const toggleEffect = (id: string, config: { component: string, values: Record<string, unknown> }) => {
    setActiveEffects(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      sendToIframe('DEBUG_UPDATE', { component: config.component, values: { enabled: true, ...config.values } })
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
    const newValues = { ...currentValues, rotX: currentValues.rotX + dy * 0.01, rotY: currentValues.rotY + dx * 0.01 }
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
    if (!timelineRef.current || draggingKeyframe) return
    const rect = timelineRef.current.getBoundingClientRect()
    setScroll(Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width)))
  }

  // Keyframe drag on timeline
  const handleKeyframeDrag = (kfId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    setDraggingKeyframe(kfId)
    const onMove = (ev: MouseEvent) => {
      if (!timelineRef.current) return
      const rect = timelineRef.current.getBoundingClientRect()
      const newScroll = Math.max(0, Math.min(1, (ev.clientX - rect.left) / rect.width))
      setKeyframes(prev => prev.map(k => k.id === kfId ? { ...k, scroll: newScroll } : k).sort((a, b) => a.scroll - b.scroll))
    }

    const onUp = () => {
      setDraggingKeyframe(null)
      pushHistory()
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseup', onUp)
    }

    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
  }

  // Keyframe functions
  const addKeyframe = () => {
    const id = `kf-${Date.now()}`
    const newKf: AnimationKeyframe = {
      id, scroll, easing: 'easeInOut',
      values: { ...currentValues },
      label: `${(scroll * 100).toFixed(0)}%`
    }
    setKeyframes(prev => [...prev, newKf].sort((a, b) => a.scroll - b.scroll))
    setSelectedKeyframe(id)
    pushHistory()
  }

  const removeKeyframe = (id: string) => {
    setKeyframes(prev => prev.filter(k => k.id !== id))
    if (selectedKeyframe === id) setSelectedKeyframe(null)
    pushHistory()
  }

  const updateKeyframeEasing = (id: string, easing: EasingType) => {
    setKeyframes(prev => prev.map(k => k.id === id ? { ...k, easing } : k))
  }

  const updateKeyframeValue = (id: string, prop: keyof AnimatableValues, value: number) => {
    setKeyframes(prev => prev.map(k =>
      k.id === id ? { ...k, values: { ...k.values, [prop]: value } } : k
    ))
  }

  // Bookmark functions
  const addBookmark = () => {
    const id = `bm-${Date.now()}`
    const colorIndex = bookmarks.length % bookmarkColors.length
    setBookmarks(prev => [...prev, { id, scroll, label: `Marker ${prev.length + 1}`, color: bookmarkColors[colorIndex] }].sort((a, b) => a.scroll - b.scroll))
    pushHistory()
  }

  const removeBookmark = (id: string) => {
    setBookmarks(prev => prev.filter(b => b.id !== id))
    pushHistory()
  }

  const updateBookmarkLabel = (id: string, label: string) => {
    setBookmarks(prev => prev.map(b => b.id === id ? { ...b, label } : b))
  }

  // Focus range
  const handleTimelineShiftDrag = (e: React.MouseEvent) => {
    if (!e.shiftKey || !timelineRef.current) return
    e.preventDefault()
    const rect = timelineRef.current.getBoundingClientRect()
    const startPos = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width))
    const onMove = (ev: MouseEvent) => {
      if (!timelineRef.current) return
      const endPos = Math.max(0, Math.min(1, (ev.clientX - rect.left) / rect.width))
      setFocusRange({ start: Math.min(startPos, endPos), end: Math.max(startPos, endPos) })
    }
    const onUp = () => { window.removeEventListener('mousemove', onMove); window.removeEventListener('mouseup', onUp) }
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
  }

  // Jump to prev/next
  const jumpToPrev = () => {
    const markers = [...keyframes.map(k => k.scroll), ...bookmarks.map(b => b.scroll)].sort((a, b) => a - b)
    const prev = markers.reverse().find(m => m < scroll - 0.01)
    if (prev !== undefined) setScroll(prev)
  }

  const jumpToNext = () => {
    const markers = [...keyframes.map(k => k.scroll), ...bookmarks.map(b => b.scroll)].sort((a, b) => a - b)
    const next = markers.find(m => m > scroll + 0.01)
    if (next !== undefined) setScroll(next)
  }

  // Reset
  const handleReset = () => {
    setScroll(focusRange?.start ?? 0)
    setPlaying(false)
    setActiveEffects(new Set())
    setCurrentValues({ ...defaultValues })
    setZoom(1)
    sendToIframe('DEBUG_RESET', {})
  }

  // Export
  const handleExport = () => {
    const data = { keyframes, bookmarks, focusRange, currentValues, timestamp: new Date().toISOString() }
    navigator.clipboard.writeText(JSON.stringify(data, null, 2))
    alert('Exported to clipboard!')
  }

  // Import
  const handleImport = () => {
    const input = prompt('Paste exported JSON:')
    if (!input) return
    try {
      const data = JSON.parse(input)
      if (data.keyframes) setKeyframes(data.keyframes)
      if (data.bookmarks) setBookmarks(data.bookmarks)
      if (data.focusRange) setFocusRange(data.focusRange)
      pushHistory()
    } catch { alert('Invalid JSON') }
  }

  const selectedKf = keyframes.find(k => k.id === selectedKeyframe)
  const canUndo = historyIndex > 0
  const canRedo = historyIndex < history.length - 1

  return (
    <div style={styles.container}>
      {/* Top Bar */}
      <div style={styles.topBar}>
        <a href="/" style={styles.homeBtn}><Home size={18} /></a>

        <div style={styles.controls}>
          <button style={{ ...styles.iconBtn, opacity: canUndo ? 1 : 0.3 }} onClick={undo} disabled={!canUndo} title="Undo (Cmd+Z)"><Undo size={16} /></button>
          <button style={{ ...styles.iconBtn, opacity: canRedo ? 1 : 0.3 }} onClick={redo} disabled={!canRedo} title="Redo (Cmd+Shift+Z)"><Redo size={16} /></button>
          <div style={{ width: 8 }} />
          <button style={styles.iconBtn} onClick={jumpToPrev} title="Previous"><SkipBack size={16} /></button>
          <button style={styles.playBtn} onClick={() => setPlaying(!playing)}>
            {playing ? <Pause size={20} /> : <Play size={20} />}
          </button>
          <button style={styles.iconBtn} onClick={jumpToNext} title="Next"><SkipForward size={16} /></button>
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
            if (e.shiftKey) handleTimelineShiftDrag(e)
            else {
              handleTimelineClick(e)
              const onMove = (ev: MouseEvent) => {
                if (!timelineRef.current) return
                const rect = timelineRef.current.getBoundingClientRect()
                setScroll(Math.max(0, Math.min(1, (ev.clientX - rect.left) / rect.width)))
              }
              const onUp = () => { window.removeEventListener('mousemove', onMove); window.removeEventListener('mouseup', onUp) }
              window.addEventListener('mousemove', onMove)
              window.addEventListener('mouseup', onUp)
            }
          }}>

          {focusRange && (
            <div style={{ ...styles.focusRange, left: `${focusRange.start * 100}%`, width: `${(focusRange.end - focusRange.start) * 100}%` }} />
          )}

          <div style={{ ...styles.timelineProgress, width: `${scroll * 100}%` }} />

          {bookmarks.map(bm => (
            <div key={bm.id} style={{ ...styles.bookmarkMarker, left: `${bm.scroll * 100}%` }}
              onClick={e => { e.stopPropagation(); setScroll(bm.scroll) }} title={bm.label}>
              <Bookmark size={10} fill={bm.color} stroke={bm.color} />
            </div>
          ))}

          {keyframes.map(kf => (
            <div key={kf.id}
              style={{ ...styles.keyframeMarker, left: `${kf.scroll * 100}%`, cursor: 'ew-resize' }}
              onMouseDown={e => handleKeyframeDrag(kf.id, e)}
              onClick={e => { e.stopPropagation(); setScroll(kf.scroll); setSelectedKeyframe(kf.id) }}>
              <Diamond size={10} fill={selectedKeyframe === kf.id ? '#d4a853' : '#d4a853'} stroke="#d4a853" />
            </div>
          ))}

          <div style={{ ...styles.playhead, left: `${scroll * 100}%` }} />
        </div>

        <div style={styles.scrollValue}>{(scroll * 100).toFixed(0)}%</div>

        {focusRange && (
          <>
            <button style={{ ...styles.iconBtn, ...(loopFocusRange ? styles.iconBtnActive : {}) }}
              onClick={() => setLoopFocusRange(!loopFocusRange)} title="Loop"><Repeat size={14} /></button>
            <button style={styles.iconBtn} onClick={() => setFocusRange(null)} title="Clear range"><X size={14} /></button>
          </>
        )}

        <button style={{ ...styles.iconBtn, ...(keyframeMode ? styles.iconBtnActive : {}) }}
          onClick={() => setKeyframeMode(!keyframeMode)} title="Interpolation">
          <Circle size={14} fill={keyframeMode ? '#d4a853' : 'transparent'} />
        </button>

        <button style={styles.iconBtn} onClick={handleImport} title="Import"><Upload size={16} /></button>
        <button style={styles.iconBtn} onClick={handleExport} title="Export"><Download size={16} /></button>
        <button style={{ ...styles.iconBtn, ...(showAdvanced ? styles.iconBtnActive : {}) }}
          onClick={() => setShowAdvanced(!showAdvanced)} title="Panel"><Settings size={16} /></button>
      </div>

      {/* Main Area */}
      <div style={styles.mainArea}>
        <div style={{ ...styles.preview, marginRight: showAdvanced ? 320 : 0 }}
          onMouseDown={handleMouseDown} onWheel={handleWheel}>
          <iframe ref={iframeRef} src="/?debug=true" style={styles.iframe}
            onLoad={() => { setIframeReady(true); syncScroll(scroll) }} />
          {!iframeReady && <div style={styles.loading}>Loading...</div>}
          <div style={styles.zoomIndicator}><ZoomOut size={12} /><span>{(zoom * 100).toFixed(0)}%</span><ZoomIn size={12} /></div>
          {isDragging && <div style={styles.dragHint}><Move size={16} /> Drag to rotate</div>}
          {keyframeMode && keyframes.length >= 2 && <div style={styles.keyframeModeIndicator}><Diamond size={12} /> INTERPOLATING</div>}
          {focusRange && <div style={styles.focusRangeIndicator}>{(focusRange.start * 100).toFixed(0)}% - {(focusRange.end * 100).toFixed(0)}%{loopFocusRange && <Repeat size={10} />}</div>}
        </div>

        {/* Panel */}
        {showAdvanced && (
          <div style={styles.advancedPanel} className="no-drag">
            <div style={styles.panelHeader}>
              <span style={styles.panelTitle}>Controls</span>
              <button style={styles.closeBtn} onClick={() => setShowAdvanced(false)}><X size={16} /></button>
            </div>

            <div style={styles.tabs}>
              {(['keyframes', 'bookmarks', 'live'] as const).map(tab => (
                <button key={tab} style={{ ...styles.tab, ...(advancedTab === tab ? styles.tabActive : {}) }}
                  onClick={() => setAdvancedTab(tab)}>
                  {tab === 'keyframes' && <Diamond size={12} />}
                  {tab === 'bookmarks' && <Bookmark size={12} />}
                  {tab === 'live' && <Eye size={12} />}
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              ))}
            </div>

            <div style={styles.panelContent}>
              {advancedTab === 'keyframes' && (
                <>
                  <div style={styles.keyframeHeader}>
                    <span style={styles.kfCount}>{keyframes.length} keyframes</span>
                    <button style={styles.recordBtn} onClick={addKeyframe}><Circle size={10} fill="#ff4444" /> REC</button>
                  </div>

                  <div style={styles.keyframeList}>
                    {keyframes.map((kf, i) => (
                      <div key={kf.id}
                        style={{ ...styles.keyframeItem, ...(selectedKeyframe === kf.id ? styles.keyframeItemActive : {}) }}
                        onClick={() => { setScroll(kf.scroll); setSelectedKeyframe(kf.id) }}>
                        <div style={styles.kfLeft}>
                          <Diamond size={12} fill="#d4a853" />
                          <span style={styles.kfIndex}>#{i + 1}</span>
                          <span style={styles.kfScroll}>{(kf.scroll * 100).toFixed(0)}%</span>
                        </div>
                        <select style={styles.easingSelect} value={kf.easing} onClick={e => e.stopPropagation()}
                          onChange={e => updateKeyframeEasing(kf.id, e.target.value as EasingType)}>
                          <option value="linear">Linear</option>
                          <option value="easeIn">Ease In</option>
                          <option value="easeOut">Ease Out</option>
                          <option value="easeInOut">Ease InOut</option>
                        </select>
                        <button style={styles.deleteKfBtn} onClick={e => { e.stopPropagation(); removeKeyframe(kf.id) }}><Trash2 size={12} /></button>
                      </div>
                    ))}
                  </div>

                  {selectedKf && (
                    <div style={styles.keyframeEditor}>
                      <div style={styles.editorTitle}>Keyframe @ {(selectedKf.scroll * 100).toFixed(0)}%</div>
                      {[
                        { group: 'Rotation', props: ['rotX', 'rotY', 'rotZ'] as const, min: -Math.PI, max: Math.PI, step: 0.01 },
                        { group: 'Position', props: ['posX', 'posY', 'posZ'] as const, min: -5, max: 5, step: 0.1 },
                        { group: 'Transform', props: ['scale'] as const, min: 0.5, max: 5, step: 0.1 },
                        { group: 'Material', props: ['metalness', 'roughness'] as const, min: 0, max: 1, step: 0.05 },
                        { group: 'Camera', props: ['fov'] as const, min: 15, max: 90, step: 1 },
                        { group: 'FX', props: ['bloomIntensity'] as const, min: 0, max: 5, step: 0.1 },
                      ].map(({ group, props, min, max, step }) => (
                        <div key={group} style={styles.propertyGroup}>
                          <div style={styles.groupTitle}>{group}</div>
                          {props.map(prop => (
                            <div key={prop} style={styles.propRow}>
                              <span style={styles.propLabel}>{prop}</span>
                              <input type="range" min={min} max={max} step={step} value={selectedKf.values[prop]}
                                onChange={e => updateKeyframeValue(selectedKf.id, prop, parseFloat(e.target.value))} style={styles.propSlider} />
                              <span style={styles.propValue}>{selectedKf.values[prop].toFixed(2)}</span>
                            </div>
                          ))}
                        </div>
                      ))}
                    </div>
                  )}

                  {keyframes.length === 0 && (
                    <div style={styles.emptyState}>
                      <Diamond size={24} stroke="#444" />
                      <div style={styles.emptyTitle}>No keyframes</div>
                      <div style={styles.emptyText}>Press REC to save current state</div>
                    </div>
                  )}
                </>
              )}

              {advancedTab === 'bookmarks' && (
                <>
                  <div style={styles.keyframeHeader}>
                    <span style={styles.kfCount}>{bookmarks.length} bookmarks</span>
                    <button style={styles.addBtn} onClick={addBookmark}><Bookmark size={12} /> Add</button>
                  </div>
                  <div style={styles.keyframeList}>
                    {bookmarks.map(bm => (
                      <div key={bm.id} style={styles.bookmarkItem} onClick={() => setScroll(bm.scroll)}>
                        <Bookmark size={12} fill={bm.color} stroke={bm.color} />
                        <input type="text" value={bm.label} style={styles.bookmarkInput} onClick={e => e.stopPropagation()}
                          onChange={e => updateBookmarkLabel(bm.id, e.target.value)} />
                        <span style={styles.kfScroll}>{(bm.scroll * 100).toFixed(0)}%</span>
                        <button style={styles.deleteKfBtn} onClick={e => { e.stopPropagation(); removeBookmark(bm.id) }}><Trash2 size={12} /></button>
                      </div>
                    ))}
                  </div>
                  {bookmarks.length === 0 && (
                    <div style={styles.emptyState}>
                      <Bookmark size={24} stroke="#444" />
                      <div style={styles.emptyTitle}>No bookmarks</div>
                      <div style={styles.emptyText}>Add markers for important positions</div>
                    </div>
                  )}
                  <div style={styles.tip}><strong>Tip:</strong> Shift + drag on timeline = focus range</div>
                </>
              )}

              {advancedTab === 'live' && (
                <>
                  <div style={styles.sectionTitle}><Eye size={12} /> Iframe State</div>
                  {liveData ? (
                    <div style={styles.liveGrid}>
                      {Object.entries(liveData).map(([key, val]) => (
                        <div key={key} style={styles.liveRow}><span>{key}</span><span>{typeof val === 'number' ? val.toFixed(2) : val}</span></div>
                      ))}
                    </div>
                  ) : <div style={styles.emptyState}>Waiting for iframe...</div>}
                  <div style={{ ...styles.sectionTitle, marginTop: 16 }}>Console State</div>
                  <div style={styles.liveGrid}>
                    {Object.entries(currentValues).slice(0, 6).map(([key, val]) => (
                      <div key={key} style={styles.liveRow}><span>{key}</span><span>{val.toFixed(2)}</span></div>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Bottom Bar */}
      <div style={styles.bottomBar}>
        <div style={styles.bottomRow}>
          <span style={styles.label}>Quick:</span>
          <button style={styles.quickBtn} onClick={() => toggleEffect('rotate', { component: 'ferrero', values: { autoRotate: !activeEffects.has('rotate') } })}>
            <RotateCw size={14} /> Rotate
          </button>
          <button style={styles.quickBtn} onClick={() => toggleEffect('glow', { component: 'title', values: { glowEnabled: !activeEffects.has('glow'), glowIntensity: 15 } })}>
            <Sun size={14} /> Glow
          </button>
          <button style={styles.quickBtn} onClick={() => toggleEffect('bloom', { component: 'postProcessing', values: { bloomEnabled: !activeEffects.has('bloom'), bloomIntensity: 1.5 } })}>
            <Sparkles size={14} /> Bloom
          </button>
          <div style={styles.separator} />
          <button style={styles.quickBtn} onClick={addBookmark}><Bookmark size={14} /> Bookmark</button>
          <button style={styles.quickBtn} onClick={addKeyframe}><Diamond size={14} /> Keyframe</button>
          <button style={styles.fullscreenBtn} onClick={() => iframeRef.current?.requestFullscreen?.()}><Maximize2 size={14} /></button>
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
  topBar: { display: 'flex', alignItems: 'center', gap: 6, padding: '10px 16px', backgroundColor: '#141414', borderBottom: '1px solid #222' },
  homeBtn: { width: 36, height: 36, borderRadius: 8, border: '1px solid #333', background: 'transparent', color: '#888', display: 'flex', alignItems: 'center', justifyContent: 'center', textDecoration: 'none' },
  controls: { display: 'flex', alignItems: 'center', gap: 4 },
  playBtn: { width: 44, height: 44, borderRadius: '50%', border: 'none', background: `linear-gradient(135deg, ${gold} 0%, #b8942f 100%)`, color: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: `0 4px 20px ${gold}44` },
  iconBtn: { width: 32, height: 32, borderRadius: 6, border: '1px solid #333', background: 'transparent', color: '#888', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' },
  iconBtnActive: { background: '#333', color: '#fff', borderColor: gold },
  speedControl: { display: 'flex', gap: 2, padding: 2, background: '#1a1a1a', borderRadius: 6, marginLeft: 8 },
  speedBtn: { padding: '4px 6px', border: 'none', background: 'transparent', color: '#555', borderRadius: 4, cursor: 'pointer', fontSize: 10, fontWeight: 600 },
  speedBtnActive: { background: '#333', color: '#fff' },
  timeline: { flex: 1, height: 32, background: '#1a1a1a', borderRadius: 16, position: 'relative', cursor: 'pointer', overflow: 'visible', margin: '0 8px' },
  timelineProgress: { position: 'absolute', left: 0, top: 0, bottom: 0, background: `linear-gradient(90deg, ${gold} 0%, #f0d78c 100%)`, borderRadius: 16, opacity: 0.25 },
  focusRange: { position: 'absolute', top: 0, bottom: 0, background: `${gold}22`, borderLeft: `2px solid ${gold}`, borderRight: `2px solid ${gold}` },
  bookmarkMarker: { position: 'absolute', top: '50%', transform: 'translate(-50%, -50%)', cursor: 'pointer', zIndex: 2 },
  keyframeMarker: { position: 'absolute', top: '50%', transform: 'translate(-50%, -50%)', cursor: 'pointer', zIndex: 3 },
  playhead: { position: 'absolute', top: 2, bottom: 2, width: 3, background: gold, borderRadius: 2, transform: 'translateX(-50%)', boxShadow: `0 0 8px ${gold}`, zIndex: 4 },
  scrollValue: { minWidth: 40, fontFamily: 'JetBrains Mono, monospace', fontSize: 12, fontWeight: 600, color: gold },
  mainArea: { flex: 1, display: 'flex', position: 'relative', overflow: 'hidden' },
  preview: { flex: 1, position: 'relative', cursor: 'grab', transition: 'margin 0.3s ease' },
  iframe: { width: '100%', height: '100%', border: 'none', pointerEvents: 'none' },
  loading: { position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0a0a0a', color: '#666' },
  zoomIndicator: { position: 'absolute', bottom: 16, right: 16, display: 'flex', alignItems: 'center', gap: 6, padding: '5px 10px', background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(10px)', borderRadius: 16, color: '#888', fontSize: 10 },
  dragHint: { position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', display: 'flex', alignItems: 'center', gap: 8, padding: '10px 16px', background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(10px)', borderRadius: 10, color: '#fff', fontSize: 12, pointerEvents: 'none' },
  keyframeModeIndicator: { position: 'absolute', top: 16, left: '50%', transform: 'translateX(-50%)', display: 'flex', alignItems: 'center', gap: 6, padding: '6px 12px', background: `${gold}22`, border: `1px solid ${gold}44`, borderRadius: 16, color: gold, fontSize: 10, fontWeight: 600 },
  focusRangeIndicator: { position: 'absolute', top: 16, right: 16, display: 'flex', alignItems: 'center', gap: 6, padding: '6px 12px', background: 'rgba(0,0,0,0.7)', borderRadius: 16, color: '#888', fontSize: 10 },
  advancedPanel: { position: 'absolute', right: 0, top: 0, bottom: 0, width: 320, background: '#141414', borderLeft: '1px solid #222', display: 'flex', flexDirection: 'column', zIndex: 10 },
  panelHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', borderBottom: '1px solid #222' },
  panelTitle: { fontSize: 13, fontWeight: 600 },
  closeBtn: { width: 28, height: 28, borderRadius: 6, border: 'none', background: 'transparent', color: '#666', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  tabs: { display: 'flex', borderBottom: '1px solid #222' },
  tab: { flex: 1, padding: '10px', border: 'none', background: 'transparent', color: '#666', fontSize: 11, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 },
  tabActive: { background: '#1a1a1a', color: '#fff', borderBottom: `2px solid ${gold}` },
  panelContent: { flex: 1, overflow: 'auto', padding: 16 },
  keyframeHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  kfCount: { fontSize: 12, color: '#888' },
  recordBtn: { display: 'flex', alignItems: 'center', gap: 6, padding: '6px 12px', borderRadius: 6, border: '1px solid #ff4444', background: 'rgba(255,68,68,0.1)', color: '#ff6666', fontSize: 11, fontWeight: 600, cursor: 'pointer' },
  addBtn: { display: 'flex', alignItems: 'center', gap: 6, padding: '6px 12px', borderRadius: 6, border: `1px solid ${gold}`, background: 'transparent', color: gold, fontSize: 11, cursor: 'pointer' },
  keyframeList: { display: 'flex', flexDirection: 'column', gap: 4, marginBottom: 16 },
  keyframeItem: { display: 'flex', alignItems: 'center', gap: 8, padding: '8px 10px', borderRadius: 6, background: '#1a1a1a', cursor: 'pointer', border: '1px solid transparent' },
  keyframeItemActive: { background: `${gold}15`, borderColor: `${gold}44` },
  kfLeft: { display: 'flex', alignItems: 'center', gap: 6, flex: 1 },
  kfIndex: { fontSize: 10, color: '#666' },
  kfScroll: { fontSize: 11, fontFamily: 'monospace', color: '#aaa' },
  easingSelect: { padding: '3px 6px', borderRadius: 4, border: '1px solid #333', background: '#0a0a0a', color: '#888', fontSize: 9, cursor: 'pointer' },
  deleteKfBtn: { width: 22, height: 22, borderRadius: 4, border: 'none', background: 'transparent', color: '#666', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  bookmarkItem: { display: 'flex', alignItems: 'center', gap: 8, padding: '8px 10px', borderRadius: 6, background: '#1a1a1a', cursor: 'pointer' },
  bookmarkInput: { flex: 1, background: 'transparent', border: 'none', color: '#fff', fontSize: 12, outline: 'none' },
  keyframeEditor: { padding: 12, background: '#1a1a1a', borderRadius: 8, marginTop: 8 },
  editorTitle: { fontSize: 11, fontWeight: 600, color: gold, marginBottom: 12, textTransform: 'uppercase', letterSpacing: '0.05em' },
  propertyGroup: { marginBottom: 10 },
  groupTitle: { fontSize: 9, color: '#666', marginBottom: 4, textTransform: 'uppercase' },
  propRow: { display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 },
  propLabel: { width: 55, fontSize: 9, color: '#888', fontFamily: 'monospace' },
  propSlider: { flex: 1, accentColor: gold, height: 3 },
  propValue: { width: 40, fontSize: 9, color: '#fff', fontFamily: 'monospace', textAlign: 'right' },
  emptyState: { padding: 24, textAlign: 'center', color: '#555' },
  emptyTitle: { fontSize: 13, fontWeight: 500, marginTop: 10, marginBottom: 6, color: '#888' },
  emptyText: { fontSize: 11, lineHeight: 1.4, color: '#555' },
  tip: { marginTop: 16, padding: 10, background: '#1a1a1a', borderRadius: 6, fontSize: 10, color: '#666', lineHeight: 1.4 },
  sectionTitle: { fontSize: 10, fontWeight: 600, textTransform: 'uppercase', color: '#666', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 },
  liveGrid: { display: 'flex', flexDirection: 'column', gap: 3 },
  liveRow: { display: 'flex', justifyContent: 'space-between', padding: '5px 8px', background: '#1a1a1a', borderRadius: 4, fontSize: 10 },
  bottomBar: { padding: '10px 16px', background: '#141414', borderTop: '1px solid #222' },
  bottomRow: { display: 'flex', alignItems: 'center', gap: 8 },
  label: { fontSize: 10, color: '#555', textTransform: 'uppercase', letterSpacing: '0.05em' },
  quickBtn: { display: 'flex', alignItems: 'center', gap: 5, padding: '6px 10px', border: '1px solid #333', borderRadius: 6, background: 'transparent', color: '#777', fontSize: 11, cursor: 'pointer' },
  separator: { width: 1, height: 20, background: '#333', margin: '0 4px' },
  fullscreenBtn: { width: 32, height: 32, borderRadius: 6, border: '1px solid #333', background: 'transparent', color: '#666', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', marginLeft: 'auto' },
}
