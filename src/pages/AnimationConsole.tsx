/**
 * Animation Console - Bolt DIY Style
 * AI Chat + Visual Element Selector
 * Using 100% inline styles (no Tailwind for colors/bg/spacing)
 */

import { useState, useEffect, useRef, useCallback, CSSProperties } from 'react'

// ========================
// COLORS (Bolt DIY palette)
// ========================

const colors = {
  bgMain: '#0D0D0D',
  bgChat: '#141414',
  bgInput: '#1A1A1A',
  bgHover: '#1F1F1F',
  border: '#262626',
  borderLight: '#333333',
  purple: '#9E75F0',
  purpleDark: '#8A2BE2',
  purpleGlow: 'rgba(158, 117, 240, 0.15)',
  text: '#FFFFFF',
  textSecondary: '#AAAAAA',
  textMuted: '#666666',
}

// ========================
// TYPES
// ========================

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

interface SelectedElement {
  id: string
  tag: string
  classes: string[]
  rect: { x: number; y: number; width: number; height: number }
  styles: Record<string, string>
}

// ========================
// ICONS
// ========================

const SendIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M22 2L11 13M22 2L15 22L11 13L2 9L22 2Z" />
  </svg>
)

const SelectorIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M3 3L10.07 19.97L12.58 12.58L19.97 10.07L3 3Z" />
    <path d="M13 13L19 19" />
  </svg>
)

const SparkleIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2L13.09 8.26L19 9L13.09 9.74L12 16L10.91 9.74L5 9L10.91 8.26L12 2Z" />
  </svg>
)

const XIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M18 6L6 18M6 6L18 18" />
  </svg>
)

const HomeIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
  </svg>
)

// ========================
// STYLES
// ========================

const styles: Record<string, CSSProperties> = {
  container: {
    display: 'flex',
    height: '100vh',
    width: '100vw',
    backgroundColor: colors.bgMain,
    color: colors.text,
    fontFamily: 'Inter, -apple-system, sans-serif',
    overflow: 'hidden',
  },

  // Chat Panel (LEFT)
  chatPanel: {
    width: 400,
    minWidth: 400,
    display: 'flex',
    flexDirection: 'column',
    backgroundColor: colors.bgChat,
    borderRight: `1px solid ${colors.border}`,
  },

  chatHeader: {
    height: 56,
    padding: '0 20px',
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    borderBottom: `1px solid ${colors.border}`,
  },

  chatAvatar: {
    width: 36,
    height: 36,
    borderRadius: '50%',
    background: `linear-gradient(135deg, ${colors.purple} 0%, ${colors.purpleDark} 100%)`,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: colors.text,
  },

  chatTitle: {
    fontSize: 14,
    fontWeight: 600,
    color: colors.text,
    margin: 0,
  },

  chatSubtitle: {
    fontSize: 11,
    color: colors.textMuted,
    margin: 0,
  },

  messagesArea: {
    flex: 1,
    overflowY: 'auto',
    padding: 20,
    display: 'flex',
    flexDirection: 'column',
    gap: 16,
  },

  messageRow: {
    display: 'flex',
  },

  messageRowUser: {
    justifyContent: 'flex-end',
  },

  messageRowAssistant: {
    justifyContent: 'flex-start',
  },

  messageBubble: {
    maxWidth: '85%',
    padding: '12px 16px',
    borderRadius: 16,
    fontSize: 14,
    lineHeight: 1.5,
  },

  messageBubbleUser: {
    backgroundColor: colors.purple,
    color: colors.text,
    borderBottomRightRadius: 4,
  },

  messageBubbleAssistant: {
    backgroundColor: 'transparent',
    border: `1px solid ${colors.border}`,
    color: colors.textSecondary,
    borderBottomLeftRadius: 4,
  },

  messageTime: {
    fontSize: 10,
    color: colors.textMuted,
    marginTop: 6,
    display: 'block',
  },

  inputArea: {
    padding: 20,
    borderTop: `1px solid ${colors.border}`,
  },

  inputWrapper: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
  },

  textarea: {
    width: '100%',
    backgroundColor: colors.bgInput,
    border: `1px solid ${colors.border}`,
    borderRadius: 12,
    padding: '14px 50px 14px 16px',
    fontSize: 14,
    color: colors.text,
    resize: 'none',
    outline: 'none',
    fontFamily: 'inherit',
    lineHeight: 1.4,
    minHeight: 48,
    maxHeight: 120,
  },

  sendButton: {
    position: 'absolute',
    right: 8,
    top: '50%',
    transform: 'translateY(-50%)',
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: colors.purple,
    border: 'none',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: colors.text,
    transition: 'opacity 0.2s',
  },

  sendButtonDisabled: {
    opacity: 0.3,
    cursor: 'not-allowed',
  },

  inputHint: {
    fontSize: 10,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: 10,
  },

  // Preview Panel (RIGHT)
  previewPanel: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    backgroundColor: colors.bgMain,
  },

  previewHeader: {
    height: 56,
    padding: '0 20px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottom: `1px solid ${colors.border}`,
  },

  previewTitle: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
  },

  previewTitleIcon: {
    color: colors.purple,
  },

  previewTitleText: {
    fontSize: 14,
    fontWeight: 600,
  },

  previewActions: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
  },

  button: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    padding: '8px 14px',
    borderRadius: 8,
    fontSize: 13,
    fontWeight: 500,
    border: 'none',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },

  buttonDefault: {
    backgroundColor: colors.bgInput,
    color: colors.textSecondary,
  },

  buttonActive: {
    backgroundColor: colors.purple,
    color: colors.text,
  },

  buttonIcon: {
    width: 36,
    height: 36,
    padding: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    border: 'none',
    backgroundColor: colors.bgInput,
    color: colors.textSecondary,
    cursor: 'pointer',
  },

  selectedBadge: {
    padding: '10px 20px',
    backgroundColor: colors.purpleGlow,
    borderBottom: `1px solid ${colors.border}`,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  selectedBadgeContent: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
  },

  selectedLabel: {
    fontSize: 11,
    color: colors.purple,
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },

  selectedCode: {
    fontSize: 13,
    backgroundColor: 'rgba(0,0,0,0.3)',
    padding: '4px 10px',
    borderRadius: 6,
    fontFamily: 'monospace',
  },

  closeButton: {
    width: 28,
    height: 28,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 6,
    border: 'none',
    backgroundColor: 'transparent',
    color: colors.textMuted,
    cursor: 'pointer',
  },

  iframeContainer: {
    flex: 1,
    padding: 16,
  },

  iframeWrapper: {
    height: '100%',
    borderRadius: 12,
    overflow: 'hidden',
    border: `1px solid ${colors.border}`,
    position: 'relative',
  },

  iframeWrapperActive: {
    border: `2px solid ${colors.purple}`,
    boxShadow: `0 0 30px ${colors.purpleGlow}`,
  },

  iframe: {
    width: '100%',
    height: '100%',
    border: 'none',
    backgroundColor: '#000',
  },

  selectorOverlay: {
    position: 'absolute',
    inset: 0,
    pointerEvents: 'none',
    border: `3px solid ${colors.purple}`,
    borderRadius: 12,
  },

  selectorBadge: {
    position: 'absolute',
    top: 12,
    left: 12,
    backgroundColor: colors.purple,
    color: '#000',
    fontSize: 11,
    fontWeight: 700,
    padding: '4px 10px',
    borderRadius: 4,
    textTransform: 'uppercase',
  },

  loadingDots: {
    display: 'flex',
    gap: 4,
    padding: '12px 16px',
    backgroundColor: 'transparent',
    border: `1px solid ${colors.border}`,
    borderRadius: 16,
    borderBottomLeftRadius: 4,
  },

  dot: {
    width: 8,
    height: 8,
    borderRadius: '50%',
    backgroundColor: colors.purple,
    animation: 'bounce 1s infinite',
  },
}

// ========================
// MAIN COMPONENT
// ========================

export default function AnimationConsole() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: 'Ciao! Sono il tuo assistente per le animazioni. Seleziona un elemento nella pagina o chiedimi qualcosa.',
      timestamp: new Date()
    }
  ])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [selectorMode, setSelectorMode] = useState(false)
  const [selectedElement, setSelectedElement] = useState<SelectedElement | null>(null)
  const [streamingContent, setStreamingContent] = useState('')

  const iframeRef = useRef<HTMLIFrameElement>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, streamingContent])

  // Listen for messages from iframe
  useEffect(() => {
    const handleMessage = (e: MessageEvent) => {
      if (e.data.type === 'ELEMENT_SELECTED') {
        setSelectedElement(e.data.element)
        setSelectorMode(false)
      }
    }
    window.addEventListener('message', handleMessage)
    return () => window.removeEventListener('message', handleMessage)
  }, [])

  // Force dark background (override Tailwind global styles)
  useEffect(() => {
    const originalBodyBg = document.body.style.background
    const originalHtmlBg = document.documentElement.style.background

    document.body.style.background = colors.bgMain
    document.documentElement.style.background = colors.bgMain

    return () => {
      document.body.style.background = originalBodyBg
      document.documentElement.style.background = originalHtmlBg
    }
  }, [])

  // Toggle selector mode
  const toggleSelector = useCallback(() => {
    const newMode = !selectorMode
    setSelectorMode(newMode)
    iframeRef.current?.contentWindow?.postMessage(
      { type: newMode ? 'ENABLE_SELECTOR' : 'DISABLE_SELECTOR' },
      '*'
    )
  }, [selectorMode])

  // Send message to AI
  const sendMessage = async () => {
    if (!input.trim() || isLoading) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim(),
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInput('')
    setIsLoading(true)
    setStreamingContent('')

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages, userMessage].map(m => ({
            role: m.role,
            content: m.content
          })),
          selectedElement
        })
      })

      if (!response.ok) throw new Error('API error')

      const reader = response.body?.getReader()
      const decoder = new TextDecoder()
      let fullContent = ''

      while (reader) {
        const { done, value } = await reader.read()
        if (done) break

        const chunk = decoder.decode(value)
        const lines = chunk.split('\n')

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6)
            if (data === '[DONE]') continue

            try {
              const parsed = JSON.parse(data)
              if (parsed.type === 'content_block_delta') {
                const text = parsed.delta?.text || ''
                fullContent += text
                setStreamingContent(fullContent)
              }
            } catch {
              // Skip
            }
          }
        }
      }

      if (fullContent) {
        setMessages(prev => [...prev, {
          id: Date.now().toString(),
          role: 'assistant',
          content: fullContent,
          timestamp: new Date()
        }])
      }

    } catch (error) {
      console.error('Error:', error)
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        role: 'assistant',
        content: 'Mi dispiace, si è verificato un errore. Riprova.',
        timestamp: new Date()
      }])
    } finally {
      setIsLoading(false)
      setStreamingContent('')
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  return (
    <div style={styles.container}>
      {/* Keyframes for animation */}
      <style>{`
        @keyframes bounce {
          0%, 80%, 100% { transform: translateY(0); }
          40% { transform: translateY(-6px); }
        }
      `}</style>

      {/* CHAT PANEL - LEFT */}
      <div style={styles.chatPanel}>
        {/* Chat Header */}
        <div style={styles.chatHeader}>
          <div style={styles.chatAvatar}>
            <SparkleIcon />
          </div>
          <div>
            <p style={styles.chatTitle}>Claude AI</p>
            <p style={styles.chatSubtitle}>Assistente Animazioni</p>
          </div>
        </div>

        {/* Messages */}
        <div style={styles.messagesArea}>
          {messages.map((msg) => (
            <div
              key={msg.id}
              style={{
                ...styles.messageRow,
                ...(msg.role === 'user' ? styles.messageRowUser : styles.messageRowAssistant)
              }}
            >
              <div
                style={{
                  ...styles.messageBubble,
                  ...(msg.role === 'user' ? styles.messageBubbleUser : styles.messageBubbleAssistant)
                }}
              >
                <span style={{ whiteSpace: 'pre-wrap' }}>{msg.content}</span>
                <span style={styles.messageTime}>
                  {msg.timestamp.toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            </div>
          ))}

          {/* Streaming */}
          {streamingContent && (
            <div style={{ ...styles.messageRow, ...styles.messageRowAssistant }}>
              <div style={{ ...styles.messageBubble, ...styles.messageBubbleAssistant }}>
                <span style={{ whiteSpace: 'pre-wrap' }}>{streamingContent}</span>
                <span style={{
                  display: 'inline-block',
                  width: 2,
                  height: 16,
                  backgroundColor: colors.purple,
                  marginLeft: 4,
                  animation: 'pulse 1s infinite'
                }} />
              </div>
            </div>
          )}

          {/* Loading */}
          {isLoading && !streamingContent && (
            <div style={{ ...styles.messageRow, ...styles.messageRowAssistant }}>
              <div style={styles.loadingDots}>
                <span style={{ ...styles.dot, animationDelay: '0ms' }} />
                <span style={{ ...styles.dot, animationDelay: '150ms' }} />
                <span style={{ ...styles.dot, animationDelay: '300ms' }} />
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div style={styles.inputArea}>
          <div style={styles.inputWrapper}>
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Scrivi un messaggio..."
              rows={1}
              style={styles.textarea}
            />
            <button
              onClick={sendMessage}
              disabled={!input.trim() || isLoading}
              style={{
                ...styles.sendButton,
                ...(!input.trim() || isLoading ? styles.sendButtonDisabled : {})
              }}
            >
              <SendIcon />
            </button>
          </div>
          <p style={styles.inputHint as CSSProperties}>
            Premi Enter per inviare, Shift+Enter per nuova riga
          </p>
        </div>
      </div>

      {/* PREVIEW PANEL - RIGHT */}
      <div style={styles.previewPanel}>
        {/* Preview Header */}
        <div style={styles.previewHeader}>
          <div style={styles.previewTitle}>
            <span style={styles.previewTitleIcon}><SparkleIcon /></span>
            <span style={styles.previewTitleText}>Animation Console</span>
          </div>
          <div style={styles.previewActions}>
            <button
              onClick={toggleSelector}
              style={{
                ...styles.button,
                ...(selectorMode ? styles.buttonActive : styles.buttonDefault)
              }}
            >
              <SelectorIcon />
              {selectorMode ? 'Selezionando...' : 'Seleziona'}
            </button>
            <button
              onClick={() => window.location.href = '/'}
              style={styles.buttonIcon}
            >
              <HomeIcon />
            </button>
          </div>
        </div>

        {/* Selected Element Badge */}
        {selectedElement && (
          <div style={styles.selectedBadge}>
            <div style={styles.selectedBadgeContent}>
              <span style={styles.selectedLabel}>Selezionato:</span>
              <code style={styles.selectedCode}>
                {selectedElement.tag}
                {selectedElement.id && `#${selectedElement.id}`}
                {selectedElement.classes.length > 0 && `.${selectedElement.classes[0]}`}
              </code>
            </div>
            <button
              onClick={() => setSelectedElement(null)}
              style={styles.closeButton}
            >
              <XIcon />
            </button>
          </div>
        )}

        {/* Iframe */}
        <div style={styles.iframeContainer}>
          <div style={{
            ...styles.iframeWrapper,
            ...(selectorMode ? styles.iframeWrapperActive : {})
          }}>
            <iframe
              ref={iframeRef}
              src="/"
              style={styles.iframe}
              title="Preview"
            />
            {selectorMode && (
              <div style={styles.selectorOverlay}>
                <div style={styles.selectorBadge}>SELECTOR MODE</div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
