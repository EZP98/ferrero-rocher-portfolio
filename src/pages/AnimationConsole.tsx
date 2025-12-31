/**
 * Animation Console - Storyboard Edition
 *
 * Simple scene-based animation editor
 */

import { useState, useRef, useEffect, useCallback } from 'react'
import {
  Play, Pause, Plus, Trash2, Eye, EyeOff, Copy,
  Download, Upload, Home, Sparkles, Scan, RefreshCw,
  Send, MessageCircle, Bot, User
} from 'lucide-react'

// ========================
// TYPES
// ========================

interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
  action?: AnimationAction
}

interface AnimationAction {
  type: 'update_scene' | 'create_scene' | 'delete_scene' | 'play' | 'info' | 'error'
  sceneId?: string
  scrollPercent?: number
  label?: string
  changes?: Partial<SceneState>
  message: string
}

interface SceneState {
  visible: boolean
  opacity: number
  rotationX: number
  rotationY: number
  rotationZ: number
  positionX: number
  positionY: number
  scale: number
  glow: number
}

interface Scene {
  id: string
  scrollPercent: number
  label: string
  state: SceneState
  thumbnail?: string
}

const defaultState: SceneState = {
  visible: true,
  opacity: 1,
  rotationX: 0,
  rotationY: 0,
  rotationZ: 0,
  positionX: 0,
  positionY: 0,
  scale: 1,
  glow: 0,
}

// ========================
// INTERPOLATION
// ========================

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t
}

function interpolateStates(scenes: Scene[], scrollPercent: number): SceneState {
  if (scenes.length === 0) return defaultState
  if (scenes.length === 1) return scenes[0].state

  const sorted = [...scenes].sort((a, b) => a.scrollPercent - b.scrollPercent)

  // Find surrounding scenes
  let before = sorted[0]
  let after = sorted[sorted.length - 1]

  for (let i = 0; i < sorted.length - 1; i++) {
    if (scrollPercent >= sorted[i].scrollPercent && scrollPercent <= sorted[i + 1].scrollPercent) {
      before = sorted[i]
      after = sorted[i + 1]
      break
    }
  }

  if (scrollPercent <= before.scrollPercent) return before.state
  if (scrollPercent >= after.scrollPercent) return after.state

  // Interpolate
  const range = after.scrollPercent - before.scrollPercent
  const t = range > 0 ? (scrollPercent - before.scrollPercent) / range : 0

  return {
    visible: t < 0.5 ? before.state.visible : after.state.visible,
    opacity: lerp(before.state.opacity, after.state.opacity, t),
    rotationX: lerp(before.state.rotationX, after.state.rotationX, t),
    rotationY: lerp(before.state.rotationY, after.state.rotationY, t),
    rotationZ: lerp(before.state.rotationZ, after.state.rotationZ, t),
    positionX: lerp(before.state.positionX, after.state.positionX, t),
    positionY: lerp(before.state.positionY, after.state.positionY, t),
    scale: lerp(before.state.scale, after.state.scale, t),
    glow: lerp(before.state.glow, after.state.glow, t),
  }
}

// ========================
// COMPONENT
// ========================

export default function AnimationConsole() {
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const [iframeReady, setIframeReady] = useState(false)

  // Scroll & playback
  const [scroll, setScroll] = useState(0)
  const [playing, setPlaying] = useState(false)
  const [speed, setSpeed] = useState(1)

  // Scenes
  const [scenes, setScenes] = useState<Scene[]>([])
  const [selectedSceneId, setSelectedSceneId] = useState<string | null>(null)

  // const selectedScene = scenes.find(s => s.id === selectedSceneId)

  // ========================
  // IFRAME COMMUNICATION
  // ========================

  const sendToIframe = useCallback((state: SceneState) => {
    if (!iframeRef.current?.contentWindow) return

    // Send ferrero state (use correct property names from DebugContext)
    iframeRef.current.contentWindow.postMessage({
      type: 'DEBUG_UPDATE',
      component: 'ferrero',
      values: {
        enabled: true,
        rotX: state.rotationX,
        rotY: state.rotationY,
        rotZ: state.rotationZ,
        posX: state.positionX,
        posY: state.positionY,
        scale: state.scale,
        // Use emissive for "glow" effect on the model
        emissiveIntensity: state.visible ? state.opacity : 0,
      }
    }, '*')

    // Send bloom/post-processing
    iframeRef.current.contentWindow.postMessage({
      type: 'DEBUG_UPDATE',
      component: 'postProcessing',
      values: {
        enabled: true,
        bloomEnabled: state.glow > 0,
        bloomIntensity: state.glow,
      }
    }, '*')
  }, [])

  const syncScroll = useCallback((value: number) => {
    if (!iframeRef.current?.contentWindow) return
    try {
      const doc = iframeRef.current.contentWindow.document
      const max = doc.documentElement.scrollHeight - iframeRef.current.contentWindow.innerHeight
      iframeRef.current.contentWindow.scrollTo(0, value * max)
    } catch (e) {
      // Cross-origin, ignore
    }
  }, [])

  // Project structure from iframe
  const [projectStructure, setProjectStructure] = useState<{
    ferreroStages?: Array<{ name: string; range: string }>
    components?: Array<{ id: string; name: string; controls: string[] }>
  } | null>(null)

  // Live state from iframe
  const [liveState, setLiveState] = useState<Record<string, number> | null>(null)

  // Scanning state
  const [isScanning, setIsScanning] = useState(false)

  // Chat state
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    { role: 'assistant', content: 'Ciao! Dimmi cosa vuoi fare con le animazioni. Esempi:\n- "ruota il Ferrero di 45 gradi"\n- "a 30% nascondilo"\n- "fallo brillare di più"' }
  ])
  const [chatInput, setChatInput] = useState('')
  const [isChatLoading, setIsChatLoading] = useState(false)
  const [showChat, setShowChat] = useState(true)
  const chatEndRef = useRef<HTMLDivElement>(null)

  // ========================
  // EFFECTS
  // ========================

  // Listen for messages from iframe
  useEffect(() => {
    const handler = (event: MessageEvent) => {
      // Receive project structure (animation stages, components)
      if (event.data?.type === 'CODE_STRUCTURE') {
        console.log('Received CODE_STRUCTURE:', event.data.data)
        setProjectStructure(event.data.data)

        // Auto-create scenes from ferreroStages
        if (event.data.data?.ferreroStages && scenes.length === 0) {
          const stages = event.data.data.ferreroStages
          const newScenes: Scene[] = stages.map((stage: { name: string; range: string }, index: number) => {
            // Parse range like "15-30%" to get start percentage
            const match = stage.range.match(/(\d+)/)
            const scrollPercent = match ? parseInt(match[1]) : index * 15

            return {
              id: `scene-${Date.now()}-${index}`,
              scrollPercent,
              label: stage.name,
              state: { ...defaultState },
            }
          })
          setScenes(newScenes)
        }
      }

      // Receive live Ferrero state
      if (event.data?.type === 'FERRERO_STATE') {
        setLiveState(event.data.state)
      }
    }

    window.addEventListener('message', handler)
    return () => window.removeEventListener('message', handler)
  }, [scenes.length])

  // Sync scroll and interpolate
  useEffect(() => {
    if (iframeReady) {
      syncScroll(scroll)
      const state = interpolateStates(scenes, scroll * 100)
      sendToIframe(state)
    }
  }, [scroll, iframeReady, scenes, syncScroll, sendToIframe])

  // Playback
  useEffect(() => {
    if (!playing) return
    const interval = setInterval(() => {
      setScroll(prev => {
        const next = prev + 0.002 * speed
        if (next >= 1) {
          setPlaying(false)
          return 1
        }
        return next
      })
    }, 16)
    return () => clearInterval(interval)
  }, [playing, speed])

  // Scan function - captures state at multiple scroll positions
  const scanAnimations = async () => {
    if (!iframeRef.current?.contentWindow) return

    setIsScanning(true)
    const capturedScenes: Scene[] = []
    const positions = [0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100]

    for (const pos of positions) {
      // Scroll to position
      setScroll(pos / 100)
      syncScroll(pos / 100)

      // Wait for state update
      await new Promise(resolve => setTimeout(resolve, 300))

      // Capture current state from liveState if available
      if (liveState) {
        capturedScenes.push({
          id: `scan-${Date.now()}-${pos}`,
          scrollPercent: pos,
          label: `${pos}%`,
          state: {
            visible: true,
            opacity: 1,
            rotationX: liveState.rotX || 0,
            rotationY: liveState.rotY || 0,
            rotationZ: liveState.rotZ || 0,
            positionX: liveState.posX || 0,
            positionY: liveState.posY || 0,
            scale: liveState.scale || 1,
            glow: 0,
          },
        })
      }
    }

    if (capturedScenes.length > 0) {
      setScenes(capturedScenes)
    }

    setIsScanning(false)
    setScroll(0)
  }

  // ========================
  // AI CHAT
  // ========================

  const sendChatMessage = async () => {
    if (!chatInput.trim() || isChatLoading) return

    const userMessage = chatInput.trim()
    setChatInput('')
    setChatMessages(prev => [...prev, { role: 'user', content: userMessage }])
    setIsChatLoading(true)

    try {
      const response = await fetch('/api/animation-ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMessage,
          currentScenes: scenes.map(s => ({ scrollPercent: s.scrollPercent, label: s.label }))
        }),
      })

      const action: AnimationAction = await response.json()

      // Add assistant message
      setChatMessages(prev => [...prev, {
        role: 'assistant',
        content: action.message,
        action
      }])

      // Apply the action
      if (action.type === 'create_scene' && action.scrollPercent !== undefined) {
        const newScene: Scene = {
          id: `scene-${Date.now()}`,
          scrollPercent: action.scrollPercent,
          label: action.label || `Scena @ ${action.scrollPercent}%`,
          state: { ...defaultState, ...action.changes },
        }
        setScenes(prev => [...prev, newScene].sort((a, b) => a.scrollPercent - b.scrollPercent))
        setScroll(action.scrollPercent / 100)
      }

      if (action.type === 'update_scene' && action.changes) {
        // Find closest scene to current scroll or specified scrollPercent
        const targetScroll = action.scrollPercent ?? Math.round(scroll * 100)
        const closestScene = scenes.reduce((prev, curr) =>
          Math.abs(curr.scrollPercent - targetScroll) < Math.abs(prev.scrollPercent - targetScroll) ? curr : prev
        , scenes[0])

        if (closestScene) {
          setScenes(prev => prev.map(s =>
            s.id === closestScene.id
              ? { ...s, state: { ...s.state, ...action.changes }, label: action.label || s.label }
              : s
          ))
        } else if (scenes.length === 0) {
          // Create a new scene if none exist
          const newScene: Scene = {
            id: `scene-${Date.now()}`,
            scrollPercent: targetScroll,
            label: action.label || `Scena @ ${targetScroll}%`,
            state: { ...defaultState, ...action.changes },
          }
          setScenes([newScene])
        }
      }

      if (action.type === 'play') {
        setPlaying(true)
      }

    } catch (error) {
      console.error('Chat error:', error)
      setChatMessages(prev => [...prev, {
        role: 'assistant',
        content: 'Errore di connessione. Riprova.'
      }])
    }

    setIsChatLoading(false)
  }

  // Scroll chat to bottom
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [chatMessages])

  // ========================
  // SCENE MANAGEMENT
  // ========================

  const addScene = () => {
    console.log('addScene called, current scroll:', scroll)
    const newScene: Scene = {
      id: `scene-${Date.now()}`,
      scrollPercent: Math.round(scroll * 100),
      label: `Scena ${scenes.length + 1}`,
      state: scenes.length > 0
        ? { ...interpolateStates(scenes, scroll * 100) }
        : { ...defaultState },
    }
    console.log('newScene:', newScene)
    setScenes(prev => {
      const updated = [...prev, newScene].sort((a, b) => a.scrollPercent - b.scrollPercent)
      console.log('updated scenes:', updated)
      return updated
    })
    setSelectedSceneId(newScene.id)
  }

  const deleteScene = (id: string) => {
    setScenes(prev => prev.filter(s => s.id !== id))
    if (selectedSceneId === id) setSelectedSceneId(null)
  }

  const duplicateScene = (id: string) => {
    const scene = scenes.find(s => s.id === id)
    if (!scene) return
    const newScene: Scene = {
      ...scene,
      id: `scene-${Date.now()}`,
      scrollPercent: Math.min(100, scene.scrollPercent + 5),
      label: `${scene.label} (copia)`,
    }
    setScenes(prev => [...prev, newScene].sort((a, b) => a.scrollPercent - b.scrollPercent))
  }

  const updateSceneState = (id: string, key: keyof SceneState, value: number | boolean) => {
    setScenes(prev => prev.map(s =>
      s.id === id ? { ...s, state: { ...s.state, [key]: value } } : s
    ))
  }

  const updateSceneScroll = (id: string, percent: number) => {
    setScenes(prev => prev.map(s =>
      s.id === id ? { ...s, scrollPercent: Math.max(0, Math.min(100, percent)) } : s
    ).sort((a, b) => a.scrollPercent - b.scrollPercent))
  }

  const updateSceneLabel = (id: string, label: string) => {
    setScenes(prev => prev.map(s => s.id === id ? { ...s, label } : s))
  }

  const goToScene = (scene: Scene) => {
    setScroll(scene.scrollPercent / 100)
    setSelectedSceneId(scene.id)
  }

  // ========================
  // IMPORT/EXPORT
  // ========================

  const exportData = () => {
    const data = JSON.stringify({ scenes }, null, 2)
    const blob = new Blob([data], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'ferrero-animation.json'
    a.click()
  }

  const importData = () => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = '.json'
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (!file) return
      const reader = new FileReader()
      reader.onload = (ev) => {
        try {
          const data = JSON.parse(ev.target?.result as string)
          if (data.scenes) setScenes(data.scenes)
        } catch (err) {
          alert('File non valido')
        }
      }
      reader.readAsText(file)
    }
    input.click()
  }

  // ========================
  // STYLES
  // ========================

  const styles: Record<string, React.CSSProperties> = {
    container: {
      display: 'flex',
      flexDirection: 'column',
      height: '100vh',
      background: '#0a0a0a',
      color: 'white',
      fontFamily: 'Inter, system-ui, sans-serif',
    },

    // Top bar
    topBar: {
      display: 'flex',
      alignItems: 'center',
      gap: 12,
      padding: '12px 20px',
      borderBottom: '1px solid #222',
      background: '#111',
    },
    logo: {
      display: 'flex',
      alignItems: 'center',
      gap: 8,
      fontSize: 14,
      fontWeight: 600,
      color: '#d4a853',
    },
    topActions: {
      display: 'flex',
      alignItems: 'center',
      gap: 8,
      marginLeft: 'auto',
    },
    iconBtn: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      width: 36,
      height: 36,
      background: 'transparent',
      border: '1px solid #333',
      borderRadius: 8,
      color: '#888',
      cursor: 'pointer',
      transition: 'all 0.2s',
    },

    // Main content
    main: {
      display: 'flex',
      flex: 1,
      overflow: 'hidden',
    },

    // Preview area
    previewArea: {
      flex: 1,
      display: 'flex',
      flexDirection: 'column',
      borderRight: '1px solid #222',
    },
    preview: {
      flex: 1,
      position: 'relative',
      background: '#000',
    },
    iframe: {
      width: '100%',
      height: '100%',
      border: 'none',
    },
    scrollIndicator: {
      position: 'absolute',
      bottom: 20,
      right: 20,
      padding: '8px 16px',
      background: 'rgba(0,0,0,0.8)',
      borderRadius: 8,
      fontSize: 24,
      fontWeight: 700,
      color: '#d4a853',
    },

    // Timeline
    timeline: {
      padding: '16px 20px',
      borderTop: '1px solid #222',
      background: '#111',
    },
    timelineTrack: {
      position: 'relative',
      height: 40,
      background: '#1a1a1a',
      borderRadius: 8,
      cursor: 'pointer',
      marginBottom: 12,
    },
    timelineFill: {
      position: 'absolute',
      left: 0,
      top: 0,
      height: '100%',
      background: 'linear-gradient(90deg, #d4a853 0%, #8b6914 100%)',
      borderRadius: 8,
      transition: 'width 0.05s',
    },
    timelineMarker: {
      position: 'absolute',
      top: -4,
      width: 4,
      height: 48,
      background: '#d4a853',
      borderRadius: 2,
      transform: 'translateX(-50%)',
      boxShadow: '0 0 10px rgba(212, 168, 83, 0.5)',
    },
    sceneMarker: {
      position: 'absolute',
      top: 8,
      width: 24,
      height: 24,
      background: '#333',
      border: '2px solid #555',
      borderRadius: '50%',
      transform: 'translateX(-50%)',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: 10,
      fontWeight: 700,
      transition: 'all 0.2s',
    },
    sceneMarkerSelected: {
      background: '#d4a853',
      borderColor: '#d4a853',
      color: '#000',
    },
    playbackControls: {
      display: 'flex',
      alignItems: 'center',
      gap: 12,
    },
    playBtn: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      width: 48,
      height: 48,
      background: '#d4a853',
      border: 'none',
      borderRadius: '50%',
      color: '#000',
      cursor: 'pointer',
      transition: 'all 0.2s',
    },
    speedBtns: {
      display: 'flex',
      gap: 4,
    },
    speedBtn: {
      padding: '6px 10px',
      background: 'transparent',
      border: '1px solid #333',
      borderRadius: 6,
      color: '#666',
      fontSize: 12,
      cursor: 'pointer',
    },
    speedBtnActive: {
      background: '#d4a853',
      borderColor: '#d4a853',
      color: '#000',
    },

    // Sidebar
    sidebar: {
      width: 360,
      display: 'flex',
      flexDirection: 'column',
      background: '#111',
    },
    sidebarHeader: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '16px 20px',
      borderBottom: '1px solid #222',
    },
    sidebarTitle: {
      fontSize: 14,
      fontWeight: 600,
    },
    addBtn: {
      display: 'flex',
      alignItems: 'center',
      gap: 6,
      padding: '8px 14px',
      background: '#d4a853',
      border: 'none',
      borderRadius: 8,
      color: '#000',
      fontSize: 13,
      fontWeight: 600,
      cursor: 'pointer',
    },

    // Scene list
    sceneList: {
      flex: 1,
      overflow: 'auto',
      padding: 12,
    },
    sceneCard: {
      padding: 16,
      background: '#1a1a1a',
      borderRadius: 12,
      marginBottom: 12,
      cursor: 'pointer',
      border: '2px solid transparent',
      transition: 'all 0.2s',
    },
    sceneCardSelected: {
      borderColor: '#d4a853',
      background: '#1f1a10',
    },
    sceneHeader: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 12,
    },
    sceneLabel: {
      background: 'transparent',
      border: 'none',
      color: 'white',
      fontSize: 14,
      fontWeight: 600,
      width: 120,
    },
    scenePercent: {
      display: 'flex',
      alignItems: 'center',
      gap: 4,
    },
    percentInput: {
      width: 50,
      padding: '4px 8px',
      background: '#0a0a0a',
      border: '1px solid #333',
      borderRadius: 6,
      color: 'white',
      fontSize: 13,
      textAlign: 'right' as const,
    },
    sceneActions: {
      display: 'flex',
      gap: 4,
    },
    smallBtn: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      width: 28,
      height: 28,
      background: 'transparent',
      border: '1px solid #333',
      borderRadius: 6,
      color: '#666',
      cursor: 'pointer',
    },

    // Controls
    controlsGrid: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: 8,
    },
    controlItem: {
      display: 'flex',
      flexDirection: 'column',
      gap: 4,
    },
    controlLabel: {
      fontSize: 11,
      color: '#666',
      textTransform: 'uppercase' as const,
    },
    controlRow: {
      display: 'flex',
      alignItems: 'center',
      gap: 8,
    },
    slider: {
      flex: 1,
      height: 4,
      WebkitAppearance: 'none' as const,
      background: '#333',
      borderRadius: 2,
      cursor: 'pointer',
    },
    controlValue: {
      fontSize: 12,
      color: '#888',
      minWidth: 36,
      textAlign: 'right' as const,
    },
    visibilityToggle: {
      display: 'flex',
      alignItems: 'center',
      gap: 8,
      padding: '10px 12px',
      background: '#0a0a0a',
      borderRadius: 8,
      cursor: 'pointer',
      gridColumn: 'span 2',
    },

    // Empty state
    emptyState: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 40,
      color: '#666',
      textAlign: 'center' as const,
    },
    emptyIcon: {
      marginBottom: 16,
      opacity: 0.5,
    },
    emptyText: {
      fontSize: 14,
      marginBottom: 20,
    },

    // Chat styles
    chatSection: {
      borderTop: '1px solid #222',
      display: 'flex',
      flexDirection: 'column',
      height: 300,
      background: '#0d0d0d',
    },
    chatHeader: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '12px 16px',
      borderBottom: '1px solid #222',
    },
    chatTitle: {
      display: 'flex',
      alignItems: 'center',
      gap: 8,
      fontSize: 13,
      fontWeight: 600,
      color: '#d4a853',
    },
    chatMessages: {
      flex: 1,
      overflow: 'auto',
      padding: 12,
    },
    chatMessage: {
      marginBottom: 12,
      padding: '10px 14px',
      borderRadius: 12,
      fontSize: 13,
      lineHeight: 1.5,
    },
    chatMessageUser: {
      background: '#1a1a1a',
      marginLeft: 20,
    },
    chatMessageAssistant: {
      background: '#1f1a10',
      marginRight: 20,
      borderLeft: '2px solid #d4a853',
    },
    chatInputArea: {
      display: 'flex',
      gap: 8,
      padding: 12,
      borderTop: '1px solid #222',
    },
    chatInput: {
      flex: 1,
      padding: '10px 14px',
      background: '#1a1a1a',
      border: '1px solid #333',
      borderRadius: 8,
      color: 'white',
      fontSize: 13,
      outline: 'none',
    },
    chatSendBtn: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      width: 40,
      height: 40,
      background: '#d4a853',
      border: 'none',
      borderRadius: 8,
      color: '#000',
      cursor: 'pointer',
    },
  }

  // ========================
  // RENDER
  // ========================

  return (
    <div style={styles.container}>
      {/* Top Bar */}
      <div style={styles.topBar}>
        <div style={styles.logo}>
          <Sparkles size={18} />
          Ferrero Storyboard
        </div>

        <div style={styles.topActions}>
          <button style={styles.iconBtn} onClick={() => setScroll(0)} title="Home">
            <Home size={16} />
          </button>
          <button style={styles.iconBtn} onClick={importData} title="Import">
            <Upload size={16} />
          </button>
          <button style={styles.iconBtn} onClick={exportData} title="Export">
            <Download size={16} />
          </button>
        </div>
      </div>

      {/* Main */}
      <div style={styles.main}>
        {/* Preview Area */}
        <div style={styles.previewArea}>
          <div style={styles.preview}>
            <iframe
              ref={iframeRef}
              src="/?debug=true"
              style={styles.iframe}
              onLoad={() => setIframeReady(true)}
            />
            <div style={styles.scrollIndicator}>
              {Math.round(scroll * 100)}%
            </div>
          </div>

          {/* Timeline */}
          <div style={styles.timeline}>
            <div
              style={styles.timelineTrack}
              onClick={(e) => {
                const rect = e.currentTarget.getBoundingClientRect()
                setScroll((e.clientX - rect.left) / rect.width)
              }}
            >
              <div style={{ ...styles.timelineFill, width: `${scroll * 100}%` }} />
              <div style={{ ...styles.timelineMarker, left: `${scroll * 100}%` }} />

              {/* Scene markers on timeline */}
              {scenes.map((scene, i) => (
                <div
                  key={scene.id}
                  style={{
                    ...styles.sceneMarker,
                    ...(selectedSceneId === scene.id ? styles.sceneMarkerSelected : {}),
                    left: `${scene.scrollPercent}%`,
                  }}
                  onClick={(e) => {
                    e.stopPropagation()
                    goToScene(scene)
                  }}
                  title={scene.label}
                >
                  {i + 1}
                </div>
              ))}
            </div>

            <div style={styles.playbackControls}>
              <button
                style={styles.playBtn}
                onClick={() => setPlaying(!playing)}
              >
                {playing ? <Pause size={20} /> : <Play size={20} />}
              </button>

              <div style={styles.speedBtns}>
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

              <button
                style={{ ...styles.iconBtn, marginLeft: 'auto' }}
                onClick={() => { setScroll(0); setPlaying(false) }}
              >
                <Home size={16} />
              </button>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div style={styles.sidebar}>
          <div style={styles.sidebarHeader}>
            <span style={styles.sidebarTitle}>Scene ({scenes.length})</span>
            <div style={{ display: 'flex', gap: 8 }}>
              <button
                style={{ ...styles.addBtn, background: '#333', color: '#fff' }}
                onClick={scanAnimations}
                disabled={isScanning}
              >
                {isScanning ? <RefreshCw size={16} style={{ animation: 'spin 1s linear infinite' }} /> : <Scan size={16} />}
                {isScanning ? 'Scanning...' : 'Scan'}
              </button>
              <button style={styles.addBtn} onClick={addScene}>
                <Plus size={16} /> Aggiungi
              </button>
            </div>
          </div>

          {/* Show detected project info */}
          {projectStructure?.ferreroStages && (
            <div style={{ padding: '12px 16px', background: '#1a1a1a', borderBottom: '1px solid #222', fontSize: 12, color: '#888' }}>
              <strong style={{ color: '#d4a853' }}>Animazioni rilevate:</strong>
              <div style={{ marginTop: 8 }}>
                {projectStructure.ferreroStages.map((stage, i) => (
                  <div key={i} style={{ padding: '2px 0' }}>
                    • {stage.name} ({stage.range})
                  </div>
                ))}
              </div>
            </div>
          )}

          <div style={styles.sceneList}>
            {scenes.length === 0 ? (
              <div style={styles.emptyState}>
                <Scan size={40} style={styles.emptyIcon} />
                <div style={styles.emptyText}>
                  Nessuna scena<br />
                  Clicca "Scan" per rilevare le animazioni
                </div>
                <button
                  style={{ ...styles.addBtn, background: '#333', color: '#fff', marginBottom: 12 }}
                  onClick={scanAnimations}
                  disabled={isScanning}
                >
                  <Scan size={16} /> Scan animazioni
                </button>
                <button style={styles.addBtn} onClick={addScene}>
                  <Plus size={16} /> Crea manualmente
                </button>
              </div>
            ) : (
              scenes.map((scene) => (
                <div
                  key={scene.id}
                  style={{
                    ...styles.sceneCard,
                    ...(selectedSceneId === scene.id ? styles.sceneCardSelected : {}),
                  }}
                  onClick={() => goToScene(scene)}
                >
                  <div style={styles.sceneHeader}>
                    <input
                      style={styles.sceneLabel}
                      value={scene.label}
                      onChange={(e) => updateSceneLabel(scene.id, e.target.value)}
                      onClick={(e) => e.stopPropagation()}
                    />
                    <div style={styles.scenePercent}>
                      <input
                        type="number"
                        style={styles.percentInput}
                        value={scene.scrollPercent}
                        onChange={(e) => updateSceneScroll(scene.id, parseInt(e.target.value) || 0)}
                        onClick={(e) => e.stopPropagation()}
                      />
                      <span style={{ color: '#666' }}>%</span>
                    </div>
                    <div style={styles.sceneActions}>
                      <button
                        style={styles.smallBtn}
                        onClick={(e) => { e.stopPropagation(); duplicateScene(scene.id) }}
                        title="Duplica"
                      >
                        <Copy size={12} />
                      </button>
                      <button
                        style={styles.smallBtn}
                        onClick={(e) => { e.stopPropagation(); deleteScene(scene.id) }}
                        title="Elimina"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </div>

                  {/* Controls */}
                  <div style={styles.controlsGrid}>
                    {/* Visibility toggle */}
                    <div
                      style={styles.visibilityToggle}
                      onClick={(e) => {
                        e.stopPropagation()
                        updateSceneState(scene.id, 'visible', !scene.state.visible)
                      }}
                    >
                      {scene.state.visible ? <Eye size={16} /> : <EyeOff size={16} />}
                      <span>{scene.state.visible ? 'Visibile' : 'Nascosto'}</span>
                    </div>

                    {/* Opacity */}
                    <div style={styles.controlItem}>
                      <span style={styles.controlLabel}>Opacita</span>
                      <div style={styles.controlRow}>
                        <input
                          type="range"
                          style={styles.slider}
                          min={0} max={1} step={0.1}
                          value={scene.state.opacity}
                          onClick={(e) => e.stopPropagation()}
                          onChange={(e) => updateSceneState(scene.id, 'opacity', parseFloat(e.target.value))}
                        />
                        <span style={styles.controlValue}>{scene.state.opacity.toFixed(1)}</span>
                      </div>
                    </div>

                    {/* Scale */}
                    <div style={styles.controlItem}>
                      <span style={styles.controlLabel}>Scala</span>
                      <div style={styles.controlRow}>
                        <input
                          type="range"
                          style={styles.slider}
                          min={0.1} max={3} step={0.1}
                          value={scene.state.scale}
                          onClick={(e) => e.stopPropagation()}
                          onChange={(e) => updateSceneState(scene.id, 'scale', parseFloat(e.target.value))}
                        />
                        <span style={styles.controlValue}>{scene.state.scale.toFixed(1)}</span>
                      </div>
                    </div>

                    {/* Rotation Y */}
                    <div style={styles.controlItem}>
                      <span style={styles.controlLabel}>Rotazione</span>
                      <div style={styles.controlRow}>
                        <input
                          type="range"
                          style={styles.slider}
                          min={-180} max={180} step={5}
                          value={scene.state.rotationY * (180 / Math.PI)}
                          onClick={(e) => e.stopPropagation()}
                          onChange={(e) => updateSceneState(scene.id, 'rotationY', parseFloat(e.target.value) * (Math.PI / 180))}
                        />
                        <span style={styles.controlValue}>{Math.round(scene.state.rotationY * (180 / Math.PI))}°</span>
                      </div>
                    </div>

                    {/* Glow */}
                    <div style={styles.controlItem}>
                      <span style={styles.controlLabel}>Glow</span>
                      <div style={styles.controlRow}>
                        <input
                          type="range"
                          style={styles.slider}
                          min={0} max={3} step={0.1}
                          value={scene.state.glow}
                          onClick={(e) => e.stopPropagation()}
                          onChange={(e) => updateSceneState(scene.id, 'glow', parseFloat(e.target.value))}
                        />
                        <span style={styles.controlValue}>{scene.state.glow.toFixed(1)}</span>
                      </div>
                    </div>

                    {/* Position X */}
                    <div style={styles.controlItem}>
                      <span style={styles.controlLabel}>Pos. X</span>
                      <div style={styles.controlRow}>
                        <input
                          type="range"
                          style={styles.slider}
                          min={-2} max={2} step={0.1}
                          value={scene.state.positionX}
                          onClick={(e) => e.stopPropagation()}
                          onChange={(e) => updateSceneState(scene.id, 'positionX', parseFloat(e.target.value))}
                        />
                        <span style={styles.controlValue}>{scene.state.positionX.toFixed(1)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* AI Chat Section */}
          {showChat && (
            <div style={styles.chatSection}>
              <div style={styles.chatHeader}>
                <div style={styles.chatTitle}>
                  <Bot size={16} />
                  AI Assistant
                </div>
                <button
                  style={{ ...styles.smallBtn, background: 'transparent' }}
                  onClick={() => setShowChat(false)}
                >
                  <MessageCircle size={14} />
                </button>
              </div>

              <div style={styles.chatMessages}>
                {chatMessages.map((msg, i) => (
                  <div
                    key={i}
                    style={{
                      ...styles.chatMessage,
                      ...(msg.role === 'user' ? styles.chatMessageUser : styles.chatMessageAssistant),
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4, opacity: 0.6, fontSize: 11 }}>
                      {msg.role === 'user' ? <User size={12} /> : <Bot size={12} />}
                      {msg.role === 'user' ? 'Tu' : 'AI'}
                    </div>
                    <div style={{ whiteSpace: 'pre-wrap' }}>{msg.content}</div>
                  </div>
                ))}
                {isChatLoading && (
                  <div style={{ ...styles.chatMessage, ...styles.chatMessageAssistant, opacity: 0.6 }}>
                    <Bot size={12} /> Sto pensando...
                  </div>
                )}
                <div ref={chatEndRef} />
              </div>

              <div style={styles.chatInputArea}>
                <input
                  type="text"
                  style={styles.chatInput}
                  placeholder="Es: ruota di 45 gradi..."
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && sendChatMessage()}
                  disabled={isChatLoading}
                />
                <button
                  style={{ ...styles.chatSendBtn, opacity: isChatLoading ? 0.5 : 1 }}
                  onClick={sendChatMessage}
                  disabled={isChatLoading}
                >
                  <Send size={16} />
                </button>
              </div>
            </div>
          )}

          {/* Chat toggle when hidden */}
          {!showChat && (
            <button
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                padding: '12px 16px',
                background: '#1a1a1a',
                border: 'none',
                borderTop: '1px solid #222',
                color: '#d4a853',
                fontSize: 13,
                cursor: 'pointer',
              }}
              onClick={() => setShowChat(true)}
            >
              <Bot size={16} />
              Mostra AI Chat
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
