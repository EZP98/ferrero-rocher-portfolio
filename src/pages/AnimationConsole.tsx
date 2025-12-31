/**
 * Animation Console - Lovart Style
 *
 * Chat-based animation editor.
 * Talk to AI to modify animations.
 */

import { useState, useRef, useEffect } from 'react'
import { Send, Bot, User, RotateCcw, Download, Sparkles } from 'lucide-react'

interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
}

interface AnimationConfig {
  ferrero: {
    keyframes: Array<{
      scroll: number
      rotX?: number
      rotY?: number
      rotZ?: number
      posX?: number
      posY?: number
      scale?: number
      glow?: number
    }>
    baseScale: number
  }
}

export default function AnimationConsole() {
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const chatEndRef = useRef<HTMLDivElement>(null)
  const [iframeReady, setIframeReady] = useState(false)

  // Chat state
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: 'assistant',
      content: `Ciao! Sono il tuo assistente per le animazioni del Ferrero Rocher.

Dimmi cosa vuoi fare, per esempio:
• "a 30% ruota verso destra"
• "quando arrivo a meta' fallo brillare"
• "all'inizio fallo apparire lentamente"
• "alla fine fallo girare veloce"

Descrivi l'animazione che vuoi e la creo per te.`
    }
  ])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  // Current animation config from iframe
  const [currentConfig, setCurrentConfig] = useState<AnimationConfig | null>(null)

  // Listen for config from iframe
  useEffect(() => {
    const handler = (event: MessageEvent) => {
      if (event.data?.type === 'ANIMATION_CONFIG') {
        setCurrentConfig(event.data.config)
      }
    }

    window.addEventListener('message', handler)
    return () => window.removeEventListener('message', handler)
  }, [])

  // Request config when iframe loads
  useEffect(() => {
    if (iframeReady && iframeRef.current?.contentWindow) {
      iframeRef.current.contentWindow.postMessage({ type: 'GET_ANIMATION_CONFIG' }, '*')
    }
  }, [iframeReady])

  // Scroll chat to bottom
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Send message to AI
  const sendMessage = async () => {
    if (!input.trim() || isLoading) return

    const userMessage = input.trim()
    setInput('')
    setMessages(prev => [...prev, { role: 'user', content: userMessage }])
    setIsLoading(true)

    try {
      // Build context for AI
      const configContext = currentConfig
        ? `\n\nCONFIG ATTUALE:\n${JSON.stringify(currentConfig.ferrero.keyframes, null, 2)}`
        : ''

      const response = await fetch('/api/animation-ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMessage + configContext,
          currentScenes: currentConfig?.ferrero.keyframes.map(k => ({
            scrollPercent: k.scroll * 100,
            label: `${Math.round(k.scroll * 100)}%`
          })) || []
        }),
      })

      const result = await response.json()

      // Add AI response
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: result.message || 'Non ho capito, puoi ripetere?'
      }])

      // Apply changes to iframe
      if (result.type === 'update_scene' || result.type === 'create_scene') {
        const scroll = (result.scrollPercent || 0) / 100

        iframeRef.current?.contentWindow?.postMessage({
          type: 'ANIMATION_KEYFRAME_UPDATE',
          scroll,
          values: {
            rotX: result.changes?.rotationX,
            rotY: result.changes?.rotationY,
            rotZ: result.changes?.rotationZ,
            posX: result.changes?.positionX,
            posY: result.changes?.positionY,
            scale: result.changes?.scale,
            glow: result.changes?.glow,
          }
        }, '*')

        // Request updated config
        setTimeout(() => {
          iframeRef.current?.contentWindow?.postMessage({ type: 'GET_ANIMATION_CONFIG' }, '*')
        }, 100)
      }

    } catch (error) {
      console.error('Chat error:', error)
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'Errore di connessione. Riprova.'
      }])
    }

    setIsLoading(false)
  }

  // Reset animations
  const resetAnimations = () => {
    iframeRef.current?.contentWindow?.postMessage({ type: 'ANIMATION_RESET' }, '*')
    setMessages(prev => [...prev, {
      role: 'assistant',
      content: 'Animazioni resettate ai valori di default.'
    }])
  }

  // Export config
  const exportConfig = () => {
    if (!currentConfig) return
    const blob = new Blob([JSON.stringify(currentConfig, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'ferrero-animations.json'
    a.click()
  }

  return (
    <div style={styles.container}>
      {/* Header */}
      <header style={styles.header}>
        <div style={styles.logo}>
          <Sparkles size={20} />
          <span>Animation Studio</span>
        </div>
        <div style={styles.actions}>
          <button style={styles.actionBtn} onClick={resetAnimations} title="Reset">
            <RotateCcw size={16} />
          </button>
          <button style={styles.actionBtn} onClick={exportConfig} title="Export">
            <Download size={16} />
          </button>
        </div>
      </header>

      {/* Main content */}
      <div style={styles.main}>
        {/* Preview */}
        <div style={styles.preview}>
          <iframe
            ref={iframeRef}
            src="/?debug=true"
            style={styles.iframe}
            onLoad={() => setIframeReady(true)}
          />
        </div>

        {/* Chat */}
        <div style={styles.chat}>
          <div style={styles.chatMessages}>
            {messages.map((msg, i) => (
              <div
                key={i}
                style={{
                  ...styles.message,
                  ...(msg.role === 'user' ? styles.messageUser : styles.messageAI)
                }}
              >
                <div style={styles.messageHeader}>
                  {msg.role === 'user' ? <User size={14} /> : <Bot size={14} />}
                  <span>{msg.role === 'user' ? 'Tu' : 'AI'}</span>
                </div>
                <div style={styles.messageContent}>{msg.content}</div>
              </div>
            ))}
            {isLoading && (
              <div style={{ ...styles.message, ...styles.messageAI, opacity: 0.6 }}>
                <div style={styles.messageHeader}>
                  <Bot size={14} />
                  <span>AI sta pensando...</span>
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          <div style={styles.inputArea}>
            <input
              type="text"
              style={styles.input}
              placeholder="Descrivi l'animazione che vuoi..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
              disabled={isLoading}
            />
            <button
              style={{ ...styles.sendBtn, opacity: isLoading ? 0.5 : 1 }}
              onClick={sendMessage}
              disabled={isLoading}
            >
              <Send size={18} />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    height: '100vh',
    background: '#0a0a0a',
    color: 'white',
    fontFamily: 'Inter, system-ui, sans-serif',
  },

  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '16px 24px',
    borderBottom: '1px solid #1a1a1a',
  },
  logo: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    fontSize: 16,
    fontWeight: 600,
    color: '#d4a853',
  },
  actions: {
    display: 'flex',
    gap: 8,
  },
  actionBtn: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: 36,
    height: 36,
    background: '#1a1a1a',
    border: '1px solid #333',
    borderRadius: 8,
    color: '#888',
    cursor: 'pointer',
  },

  main: {
    display: 'flex',
    flex: 1,
    overflow: 'hidden',
  },

  preview: {
    flex: 1,
    background: '#000',
  },
  iframe: {
    width: '100%',
    height: '100%',
    border: 'none',
  },

  chat: {
    width: 400,
    display: 'flex',
    flexDirection: 'column',
    borderLeft: '1px solid #1a1a1a',
    background: '#0d0d0d',
  },
  chatMessages: {
    flex: 1,
    overflow: 'auto',
    padding: 16,
  },
  message: {
    marginBottom: 16,
    padding: '14px 16px',
    borderRadius: 12,
    fontSize: 14,
    lineHeight: 1.6,
  },
  messageUser: {
    background: '#1a1a1a',
    marginLeft: 24,
  },
  messageAI: {
    background: 'linear-gradient(135deg, #1a1510 0%, #0d0d0d 100%)',
    border: '1px solid #2a2015',
    marginRight: 24,
  },
  messageHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
    fontSize: 12,
    color: '#666',
  },
  messageContent: {
    whiteSpace: 'pre-wrap',
  },

  inputArea: {
    display: 'flex',
    gap: 10,
    padding: 16,
    borderTop: '1px solid #1a1a1a',
  },
  input: {
    flex: 1,
    padding: '14px 18px',
    background: '#1a1a1a',
    border: '1px solid #333',
    borderRadius: 12,
    color: 'white',
    fontSize: 14,
    outline: 'none',
  },
  sendBtn: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: 48,
    height: 48,
    background: '#d4a853',
    border: 'none',
    borderRadius: 12,
    color: '#000',
    cursor: 'pointer',
  },
}
