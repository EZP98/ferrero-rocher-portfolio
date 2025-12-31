/**
 * Animation Console - Bolt DIY Style
 * AI Chat + Visual Element Selector
 */

import { useState, useEffect, useRef, useCallback } from 'react'

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
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M22 2L11 13M22 2L15 22L11 13L2 9L22 2Z" />
  </svg>
)

const SelectorIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
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
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M18 6L6 18M6 6L18 18" />
  </svg>
)

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
  const inputRef = useRef<HTMLTextAreaElement>(null)

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
      if (e.data.type === 'ELEMENT_HOVER') {
        // Could show hover preview
      }
    }
    window.addEventListener('message', handleMessage)
    return () => window.removeEventListener('message', handleMessage)
  }, [])

  // Toggle selector mode in iframe
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

      // Handle streaming
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
              // Skip invalid JSON
            }
          }
        }
      }

      // Add final message
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

  // Handle Enter key
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  return (
    <div className="h-screen bg-[#0a0a0a] text-white flex overflow-hidden">

      {/* Left Panel - Preview */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="h-14 border-b border-white/10 flex items-center justify-between bg-[#111]" style={{ paddingLeft: '20px', paddingRight: '20px' }}>
          <div className="flex items-center gap-3">
            <div className="text-amber-400">
              <SparkleIcon />
            </div>
            <span className="font-semibold text-white/90">Animation Console</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={toggleSelector}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                selectorMode
                  ? 'bg-amber-500 text-black'
                  : 'bg-white/10 hover:bg-white/20 text-white/80'
              }`}
            >
              <SelectorIcon />
              {selectorMode ? 'Selezionando...' : 'Seleziona'}
            </button>

            <button
              onClick={() => window.location.href = '/'}
              className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
            </button>
          </div>
        </header>

        {/* Selected Element Badge */}
        {selectedElement && (
          <div className="bg-amber-500/10 border-b border-amber-500/20 flex items-center justify-between" style={{ paddingLeft: '20px', paddingRight: '20px', paddingTop: '10px', paddingBottom: '10px' }}>
            <div className="flex items-center gap-2">
              <span className="text-xs text-amber-400 uppercase tracking-wider">Selezionato:</span>
              <code className="text-sm text-white/90 bg-black/30 px-2 py-0.5 rounded">
                {selectedElement.tag}
                {selectedElement.id && `#${selectedElement.id}`}
                {selectedElement.classes.length > 0 && `.${selectedElement.classes[0]}`}
              </code>
            </div>
            <button
              onClick={() => setSelectedElement(null)}
              className="p-1 hover:bg-white/10 rounded transition-colors text-white/50 hover:text-white"
            >
              <XIcon />
            </button>
          </div>
        )}

        {/* Iframe Preview */}
        <div className="flex-1 min-h-0" style={{ padding: '16px' }}>
          <div className={`h-full rounded-xl overflow-hidden border relative ${
            selectorMode ? 'border-amber-500 shadow-lg shadow-amber-500/20' : 'border-white/10'
          }`}>
            <iframe
              ref={iframeRef}
              src="/"
              className="w-full h-full border-0 bg-black"
              title="Preview"
            />

            {selectorMode && (
              <div className="absolute inset-0 pointer-events-none border-4 border-amber-500/50 rounded-xl">
                <div className="absolute top-2 left-2 bg-amber-500 text-black text-xs font-bold px-2 py-1 rounded">
                  SELECTOR MODE
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Right Panel - Chat (Bolt DIY Style) */}
      <div className="w-[420px] border-l border-white/10 flex flex-col bg-[#0d0d0d]">
        {/* Chat Header */}
        <div className="h-14 border-b border-white/10 flex items-center gap-3" style={{ paddingLeft: '20px', paddingRight: '20px' }}>
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
            <SparkleIcon />
          </div>
          <div>
            <div className="font-medium text-white/90">Claude AI</div>
            <div className="text-xs text-white/40">Assistente Animazioni</div>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-auto space-y-4" style={{ padding: '20px' }}>
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[85%] rounded-2xl px-4 py-3 ${
                  msg.role === 'user'
                    ? 'bg-violet-600 text-white'
                    : 'bg-white/5 text-white/90 border border-white/10'
                }`}
              >
                <p className="text-sm whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                <span className="text-[10px] text-white/30 mt-2 block">
                  {msg.timestamp.toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            </div>
          ))}

          {/* Streaming message */}
          {streamingContent && (
            <div className="flex justify-start">
              <div className="max-w-[85%] rounded-2xl px-4 py-3 bg-white/5 text-white/90 border border-white/10">
                <p className="text-sm whitespace-pre-wrap leading-relaxed">{streamingContent}</p>
                <span className="inline-block w-2 h-4 bg-violet-500 animate-pulse ml-1" />
              </div>
            </div>
          )}

          {/* Loading indicator */}
          {isLoading && !streamingContent && (
            <div className="flex justify-start">
              <div className="bg-white/5 rounded-2xl px-4 py-3 border border-white/10">
                <div className="flex gap-1">
                  <span className="w-2 h-2 bg-violet-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-2 h-2 bg-violet-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-2 h-2 bg-violet-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="border-t border-white/10" style={{ padding: '20px' }}>
          <div className="relative">
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Scrivi un messaggio..."
              rows={1}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 pr-12 text-sm text-white placeholder-white/30 resize-none focus:outline-none focus:border-violet-500/50 focus:ring-1 focus:ring-violet-500/50 transition-all"
              style={{ minHeight: '48px', maxHeight: '120px' }}
            />
            <button
              onClick={sendMessage}
              disabled={!input.trim() || isLoading}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-lg bg-violet-600 hover:bg-violet-500 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
            >
              <SendIcon />
            </button>
          </div>
          <p className="text-[10px] text-white/30 mt-2 text-center">
            Premi Enter per inviare, Shift+Enter per nuova riga
          </p>
        </div>
      </div>
    </div>
  )
}
