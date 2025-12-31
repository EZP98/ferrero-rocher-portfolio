/**
 * Animation Console - Generic UI for any project
 * Discovers and controls animations via iframe
 */

import { useState, useEffect, useRef } from 'react'
import { DISCOVERY_SCRIPT, type DiscoveredElement, type DiscoveryResult } from '../utils/animationDiscovery'

// Particle generator for Luma buttons
const generateParticles = (count: number) => {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    left: Math.random() * 100,
    top: Math.random() * 100,
    size: 0.5 + Math.random() * 0.5,
    delay: Math.random() * 2,
    duration: 2 + Math.random() * 2,
  }))
}

interface LumaButtonProps {
  children: React.ReactNode
  onClick?: () => void
  active?: boolean
  small?: boolean
  className?: string
  disabled?: boolean
}

const LumaButton = ({ children, onClick, active, small, className = '', disabled }: LumaButtonProps) => {
  const [isHovered, setIsHovered] = useState(false)
  const [particles] = useState(() => generateParticles(8))

  return (
    <button
      className={`relative cursor-pointer ${small ? 'text-xs' : 'text-sm'} ${className} ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onClick}
      disabled={disabled}
      style={{ background: 'none', border: 'none', padding: 0 }}
    >
      <div
        className="relative overflow-hidden rounded-full p-px transition-all duration-300"
        style={{
          background: active
            ? 'linear-gradient(180deg, rgba(100, 100, 255, 1) 0%, rgba(60, 60, 180, 1) 100%)'
            : 'linear-gradient(180deg, rgba(60, 60, 60, 1) 0%, rgba(34, 34, 34, 1) 100%)',
          boxShadow: active
            ? '0 0 30px rgba(99, 102, 241, 0.3)'
            : '0 0 20px rgba(255, 255, 255, 0.05)',
        }}
      >
        {active && (
          <div
            className="absolute inset-0"
            style={{
              background: `conic-gradient(from 0deg, transparent 0deg, transparent 60deg, rgba(255, 255, 255, 0.6) 120deg, white 180deg, rgba(255, 255, 255, 0.6) 240deg, transparent 300deg, transparent 360deg)`,
              filter: 'blur(6px)',
              animation: 'rotate 4s linear infinite',
            }}
          />
        )}

        <div
          className={`relative rounded-full flex items-center justify-center gap-2 transition-all duration-300 ${small ? 'px-3 py-1.5' : 'px-4 py-2'}`}
          style={{ background: 'rgb(10, 10, 15)' }}
        >
          <div className="absolute inset-0 overflow-hidden rounded-full pointer-events-none">
            {particles.map((particle) => (
              <div
                key={particle.id}
                className="absolute"
                style={{
                  left: `${particle.left}%`,
                  top: `${particle.top}%`,
                  width: `${particle.size}px`,
                  height: `${particle.size}px`,
                  backgroundColor: 'rgba(255, 255, 255, 0.6)',
                  borderRadius: '50%',
                  animation: `twinkle ${particle.duration}s ease-in-out infinite`,
                  animationDelay: `${particle.delay}s`,
                }}
              />
            ))}
          </div>
          <span
            className="text-white font-medium tracking-wide transition-all duration-300 relative z-10"
            style={{
              textShadow: isHovered || active ? '0 0 10px rgba(255, 255, 255, 0.5)' : 'none',
            }}
          >
            {children}
          </span>
        </div>
      </div>
    </button>
  )
}

const SparkleIcon = ({ size = 16 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <path d="M12 2L13.09 8.26L19 9L13.09 9.74L12 16L10.91 9.74L5 9L10.91 8.26L12 2Z" fill="currentColor"/>
    <path d="M18 14L18.54 16.46L21 17L18.54 17.54L18 20L17.46 17.54L15 17L17.46 16.46L18 14Z" fill="currentColor" opacity="0.7"/>
  </svg>
)

// Generate color for animation type
const getTypeColor = (type: string): string => {
  switch (type) {
    case 'three': return '#d4af37'
    case 'gsap': return '#6366f1'
    case 'css': return '#8b5cf6'
    case 'framer': return '#ec4899'
    default: return '#f59e0b'
  }
}

const getTypeBadgeClasses = (type: string): string => {
  switch (type) {
    case 'three': return 'bg-amber-500/20 text-amber-400 border-amber-500/30'
    case 'gsap': return 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30'
    case 'css': return 'bg-purple-500/20 text-purple-400 border-purple-500/30'
    case 'framer': return 'bg-pink-500/20 text-pink-400 border-pink-500/30'
    default: return 'bg-orange-500/20 text-orange-400 border-orange-500/30'
  }
}

export default function AnimationConsole() {
  const iframeRef = useRef<HTMLIFrameElement>(null)

  // URL state
  const [url, setUrl] = useState('')
  const [loadedUrl, setLoadedUrl] = useState('')
  const [isScanning, setIsScanning] = useState(false)

  // Discovery state
  const [discovery, setDiscovery] = useState<DiscoveryResult | null>(null)
  const [selectedElement, setSelectedElement] = useState<DiscoveredElement | null>(null)
  const [filter, setFilter] = useState('All')

  // Timeline state
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)

  // Listen for discovery results from iframe
  useEffect(() => {
    const handler = (event: MessageEvent) => {
      if (event.data?.type === 'DISCOVERY_RESULT') {
        setDiscovery(event.data.data)
        setIsScanning(false)
        if (event.data.data.elements.length > 0) {
          setSelectedElement(event.data.data.elements[0])
        }
      }
      if (event.data?.type === 'APPLY_CONFIRMED') {
        console.log('Animation applied:', event.data)
      }
    }
    window.addEventListener('message', handler)
    return () => window.removeEventListener('message', handler)
  }, [])

  // Timeline playback
  useEffect(() => {
    if (isPlaying) {
      const interval = setInterval(() => {
        setCurrentTime(t => (t >= 100 ? 0 : t + 0.5))
      }, 50)
      return () => clearInterval(interval)
    }
  }, [isPlaying])

  // Load URL into iframe
  const loadUrl = () => {
    if (!url.trim()) return
    const finalUrl = url.startsWith('http') ? url : url.startsWith('/') ? url : `https://${url}`
    setLoadedUrl(finalUrl)
    setDiscovery(null)
    setSelectedElement(null)
  }

  // Scan iframe for animations
  const scanAnimations = () => {
    if (!iframeRef.current?.contentWindow) return
    setIsScanning(true)

    try {
      // Same-origin: inject script directly
      const script = document.createElement('script')
      script.textContent = DISCOVERY_SCRIPT
      iframeRef.current.contentDocument?.body.appendChild(script)
    } catch {
      // Cross-origin: use postMessage
      iframeRef.current.contentWindow.postMessage({ type: 'RUN_DISCOVERY' }, '*')
      setTimeout(() => setIsScanning(false), 3000)
    }
  }

  // Apply animation change
  const applyChange = (elementId: string, property: string, value: string | number) => {
    if (!iframeRef.current?.contentWindow) return

    const script = `
      (function() {
        let el = document.getElementById('${elementId}');
        if (!el) el = document.querySelector('[data-animate="${elementId}"]');
        if (!el) el = document.querySelector('${elementId}');

        if (el) {
          if ('${property}' === 'opacity') el.style.opacity = '${value}';
          if ('${property}' === 'scale') el.style.transform = 'scale(${value})';
          if ('${property}' === 'rotate') el.style.transform = 'rotate(${value}deg)';
          if ('${property}' === 'translateX') el.style.transform = 'translateX(${value}px)';
          if ('${property}' === 'translateY') el.style.transform = 'translateY(${value}px)';
        }

        if (window.gsap && el) {
          gsap.to(el, { ${property}: ${value}, duration: 0.3 });
        }

        window.parent.postMessage({ type: 'APPLY_CONFIRMED', elementId: '${elementId}', property: '${property}', value: '${value}' }, '*');
      })();
    `

    try {
      const scriptEl = document.createElement('script')
      scriptEl.textContent = script
      iframeRef.current.contentDocument?.body.appendChild(scriptEl)
    } catch {
      // Cross-origin fallback
    }
  }

  // Export config
  const exportConfig = () => {
    if (!discovery) return
    const config = {
      url: loadedUrl,
      libraries: discovery.libraries,
      elements: discovery.elements,
      animations: discovery.animations,
      exportedAt: new Date().toISOString()
    }
    const blob = new Blob([JSON.stringify(config, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'animation-config.json'
    a.click()
    URL.revokeObjectURL(url)
  }

  // Filter animations
  const filteredElements = filter === 'All'
    ? discovery?.elements || []
    : discovery?.elements.filter(e => e.type.toUpperCase() === filter) || []

  // Generate timeline keyframes from elements
  const keyframes = discovery?.elements.map((el, i) => ({
    id: el.id,
    name: el.name,
    start: i * 10,
    end: Math.min((i + 1) * 20, 100),
    color: getTypeColor(el.type)
  })) || []

  // Get display URL
  const displayUrl = loadedUrl ? new URL(loadedUrl.startsWith('http') ? loadedUrl : `https://${loadedUrl}`).hostname : ''

  return (
    <div className="h-screen bg-neutral-950 text-white flex flex-col overflow-hidden">
      <style>{`
        @keyframes rotate {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes twinkle {
          0%, 100% { opacity: 0.3; transform: scale(0.8); }
          50% { opacity: 1; transform: scale(1.2); }
        }
        @keyframes pulse-gold {
          0%, 100% { box-shadow: 0 0 20px rgba(212, 175, 55, 0.3); }
          50% { box-shadow: 0 0 40px rgba(212, 175, 55, 0.6); }
        }
        .gold-glow { animation: pulse-gold 2s ease-in-out infinite; }
      `}</style>

      {/* Header */}
      <header className="border-b border-white/10 px-4 py-3 flex-shrink-0 bg-black/50 backdrop-blur-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="text-amber-400"><SparkleIcon size={22} /></div>
            <h1 className="text-lg font-semibold bg-gradient-to-r from-amber-200 to-amber-400 bg-clip-text text-transparent">
              Animation Console
            </h1>
            <span className="text-xs text-white/40 bg-white/5 px-2 py-0.5 rounded-full">v0.2</span>
          </div>

          <div className="flex items-center gap-3">
            {/* URL Input */}
            <div className="flex items-center gap-2 bg-white/5 rounded-full px-3 py-1.5 border border-white/10">
              <input
                type="text"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && loadUrl()}
                placeholder="Enter project URL..."
                className="bg-transparent text-xs text-white/70 w-64 focus:outline-none placeholder:text-white/30"
              />
              <button
                onClick={loadUrl}
                className="p-1 hover:bg-white/10 rounded transition-colors"
                title="Load URL"
              >
                <svg className="w-4 h-4 text-white/50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </button>
            </div>

            {loadedUrl && (
              <div className="flex items-center gap-2 bg-white/5 rounded-full px-3 py-1.5 border border-white/10">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                <span className="text-xs text-white/70">{displayUrl}</span>
              </div>
            )}

            <LumaButton small onClick={exportConfig} disabled={!discovery}>
              <span className="flex items-center gap-1.5">
                <SparkleIcon size={12} />
                Export JSON
              </span>
            </LumaButton>
          </div>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <aside className="w-64 border-r border-white/10 flex flex-col flex-shrink-0 bg-black/30">
          <div className="p-3 border-b border-white/10">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-xs font-medium text-white/50 uppercase tracking-wider">Detected Animations</h2>
              <span className="text-xs text-white/30">{discovery?.elements.length || 0}</span>
            </div>
            <div className="flex gap-1.5 flex-wrap">
              {['All', 'CSS', 'GSAP', 'THREE', 'DOM'].map(f => (
                <LumaButton
                  key={f}
                  small
                  active={filter === f}
                  onClick={() => setFilter(f)}
                >
                  {f}
                </LumaButton>
              ))}
            </div>
          </div>

          <div className="flex-1 overflow-auto p-2 space-y-1.5">
            {filteredElements.length === 0 ? (
              <div className="text-center text-white/30 text-xs py-8">
                {loadedUrl ? 'Click "Scan" to detect animations' : 'Load a URL to start'}
              </div>
            ) : (
              filteredElements.map(el => (
                <div
                  key={el.id}
                  onClick={() => setSelectedElement(el)}
                  className={`p-3 rounded-lg cursor-pointer transition-all duration-200 ${
                    selectedElement?.id === el.id
                      ? 'bg-amber-500/20 border border-amber-500/50 gold-glow'
                      : 'bg-white/5 border border-transparent hover:bg-white/10 hover:border-white/20'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-mono text-sm text-white/90 truncate">{el.name}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium border ${getTypeBadgeClasses(el.type)}`}>
                      {el.type.toUpperCase()}
                    </span>
                  </div>
                  <div className="flex gap-1 mt-2 flex-wrap">
                    {el.properties.slice(0, 4).map(prop => (
                      <span key={prop} className="text-xs bg-white/10 px-1.5 py-0.5 rounded text-white/60">
                        {prop}
                      </span>
                    ))}
                    {el.properties.length > 4 && (
                      <span className="text-xs text-white/40">+{el.properties.length - 4}</span>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="p-3 border-t border-white/10">
            <LumaButton
              active
              className="w-full"
              onClick={scanAnimations}
              disabled={!loadedUrl || isScanning}
            >
              <span className="flex items-center justify-center gap-2">
                {isScanning ? (
                  <>
                    <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                    </svg>
                    Scanning...
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    Scan Animations
                  </>
                )}
              </span>
            </LumaButton>
          </div>
        </aside>

        {/* Main */}
        <main className="flex-1 flex flex-col min-w-0">
          {/* Preview iframe */}
          <div className="flex-1 p-3 min-h-0">
            <div className="h-full rounded-xl overflow-hidden border border-white/10 relative bg-neutral-900">
              {/* Browser chrome */}
              <div className="absolute top-0 left-0 right-0 z-10 flex items-center gap-3 bg-neutral-900/95 backdrop-blur border-b border-white/10 px-3 py-2">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-500/80 hover:bg-red-500 transition-colors cursor-pointer"></div>
                  <div className="w-3 h-3 rounded-full bg-yellow-500/80 hover:bg-yellow-500 transition-colors cursor-pointer"></div>
                  <div className="w-3 h-3 rounded-full bg-green-500/80 hover:bg-green-500 transition-colors cursor-pointer"></div>
                </div>
                <div className="flex-1 flex justify-center">
                  <div className="flex items-center gap-2 bg-white/5 rounded-full px-4 py-1 border border-white/10 max-w-md w-full">
                    <svg className="w-3 h-3 text-white/30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                    <span className="text-xs text-white/50 truncate">{displayUrl || 'No URL loaded'}</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => iframeRef.current?.contentWindow?.location.reload()}
                    className="p-1.5 rounded hover:bg-white/10 transition-colors"
                    title="Refresh"
                  >
                    <svg className="w-4 h-4 text-white/50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                  </button>
                  <button
                    onClick={() => window.open(loadedUrl, '_blank')}
                    className="p-1.5 rounded hover:bg-white/10 transition-colors"
                    title="Open in new tab"
                    disabled={!loadedUrl}
                  >
                    <svg className="w-4 h-4 text-white/50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Actual iframe */}
              {loadedUrl ? (
                <iframe
                  ref={iframeRef}
                  src={loadedUrl}
                  className="w-full h-full pt-10"
                  title="Project Preview"
                  sandbox="allow-scripts allow-same-origin"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-white/30">
                  <div className="text-center">
                    <SparkleIcon size={48} />
                    <p className="mt-4 text-sm">Enter a URL above to load a project</p>
                  </div>
                </div>
              )}

              {/* Overlay hint */}
              {discovery && discovery.elements.length > 0 && (
                <div className="absolute bottom-4 left-4 right-4 flex justify-center pointer-events-none">
                  <div className="bg-black/70 backdrop-blur-sm rounded-full px-4 py-2 border border-white/10 text-xs text-white/50">
                    {discovery.elements.length} animations detected - {discovery.libraries.join(', ') || 'DOM'}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Timeline */}
          <div className="h-48 border-t border-white/10 flex flex-col flex-shrink-0 bg-black/30">
            {/* Timeline controls */}
            <div className="flex items-center justify-between px-4 py-2 border-b border-white/10">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setCurrentTime(0)}
                  className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors border border-white/10"
                  title="Reset"
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="white">
                    <rect x="4" y="4" width="6" height="16" />
                  </svg>
                </button>
                <button
                  onClick={() => setIsPlaying(!isPlaying)}
                  className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                    isPlaying
                      ? 'bg-amber-500 hover:bg-amber-400 shadow-lg shadow-amber-500/30'
                      : 'bg-white/10 hover:bg-white/20'
                  }`}
                >
                  {isPlaying ? (
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="white">
                      <rect x="6" y="4" width="4" height="16" rx="1" />
                      <rect x="14" y="4" width="4" height="16" rx="1" />
                    </svg>
                  ) : (
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="white">
                      <polygon points="5,3 19,12 5,21" />
                    </svg>
                  )}
                </button>
                <div className="flex items-center gap-2 bg-white/5 rounded-lg px-3 py-1.5 border border-white/10">
                  <span className="font-mono text-sm text-amber-400">
                    {(currentTime / 100 * 5).toFixed(2)}s
                  </span>
                  <span className="text-white/30">/</span>
                  <span className="font-mono text-sm text-white/50">5.00s</span>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-white/40">Speed</span>
                  <select className="bg-white/5 border border-white/10 rounded px-2 py-1 text-xs focus:outline-none focus:border-amber-500">
                    <option value="0.5">0.5x</option>
                    <option value="1" defaultValue="1">1x</option>
                    <option value="2">2x</option>
                  </select>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-white/40">Zoom</span>
                  <input
                    type="range"
                    min="1"
                    max="4"
                    defaultValue="2"
                    className="w-20 accent-amber-500"
                  />
                </div>
              </div>
            </div>

            {/* Timeline tracks */}
            <div className="flex-1 overflow-auto relative">
              {/* Time ruler */}
              <div className="sticky top-0 h-6 bg-neutral-900/90 backdrop-blur border-b border-white/10 flex items-end z-10">
                <div className="w-28 flex-shrink-0"></div>
                <div className="flex-1 relative">
                  {[0, 1, 2, 3, 4, 5].map(t => (
                    <span
                      key={t}
                      className="absolute text-xs text-white/30 -translate-x-1/2"
                      style={{ left: `${(t / 5) * 100}%` }}
                    >
                      {t}s
                    </span>
                  ))}
                </div>
              </div>

              {/* Playhead */}
              <div
                className="absolute top-0 bottom-0 w-0.5 bg-amber-500 z-20 pointer-events-none"
                style={{ left: `calc(112px + ${currentTime}% * 0.85)` }}
              >
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-6 border-l-transparent border-r-transparent border-t-amber-500"></div>
              </div>

              {/* Tracks */}
              <div className="py-1">
                {keyframes.length === 0 ? (
                  <div className="text-center text-white/30 text-xs py-4">
                    Scan a project to see timeline
                  </div>
                ) : (
                  keyframes.map(kf => (
                    <div key={kf.id} className="flex items-center h-8 px-2 hover:bg-white/5 group">
                      <div className="w-24 text-xs text-white/50 font-mono truncate pr-2 group-hover:text-white/70">
                        {kf.name}
                      </div>
                      <div className="flex-1 relative h-6 bg-white/5 rounded mx-2">
                        <div
                          className="absolute h-full rounded cursor-pointer hover:brightness-125 transition-all group/track"
                          style={{
                            left: `${kf.start}%`,
                            width: `${kf.end - kf.start}%`,
                            background: `linear-gradient(90deg, ${kf.color}30, ${kf.color}60)`,
                            border: `1px solid ${kf.color}`,
                            boxShadow: `0 0 10px ${kf.color}20`,
                          }}
                        >
                          <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1/2 w-2.5 h-2.5 rounded-full bg-white border-2 cursor-ew-resize opacity-0 group-hover/track:opacity-100 transition-opacity" style={{ borderColor: kf.color }} />
                          <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 w-2.5 h-2.5 rounded-full bg-white border-2 cursor-ew-resize opacity-0 group-hover/track:opacity-100 transition-opacity" style={{ borderColor: kf.color }} />
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </main>

        {/* Properties panel */}
        {selectedElement && (
          <aside className="w-72 border-l border-white/10 overflow-auto flex-shrink-0 bg-black/30">
            <div className="p-4 border-b border-white/10 bg-gradient-to-r from-amber-500/10 to-transparent">
              <h2 className="text-xs font-medium text-white/50 mb-1 uppercase tracking-wider">Properties</h2>
              <span className="font-mono text-lg text-amber-400">{selectedElement.name}</span>
              <div className="flex gap-2 mt-2">
                <span className={`text-xs px-2 py-0.5 rounded-full border ${getTypeBadgeClasses(selectedElement.type)}`}>
                  {selectedElement.type.toUpperCase()}
                </span>
              </div>
            </div>

            <div className="p-4 space-y-4">
              {/* Selector */}
              {selectedElement.selector && (
                <div>
                  <label className="text-xs text-white/40 block mb-1.5 uppercase tracking-wider">Selector</label>
                  <div className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm font-mono text-white/60">
                    {selectedElement.selector}
                  </div>
                </div>
              )}

              {/* Properties */}
              <div>
                <label className="text-xs text-white/40 block mb-1.5 uppercase tracking-wider">Animated Properties</label>
                <div className="space-y-2">
                  {selectedElement.properties.map(prop => (
                    <div key={prop} className="flex items-center gap-2 bg-white/5 rounded-lg p-2 border border-white/10">
                      <span className="text-xs text-white/60 w-20 font-mono">{prop}</span>
                      <input
                        type="text"
                        defaultValue={String(selectedElement.currentValues[prop] || '0')}
                        className="flex-1 bg-white/10 border border-white/10 rounded px-2 py-1 text-xs focus:outline-none focus:border-amber-500 text-center"
                      />
                      <button
                        onClick={() => {
                          const input = document.querySelector(`input[data-prop="${prop}"]`) as HTMLInputElement
                          if (input) applyChange(selectedElement.id, prop, input.value)
                        }}
                        className="p-1 hover:bg-white/10 rounded transition-colors"
                        title="Apply"
                      >
                        <svg className="w-3 h-3 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Current Values */}
              {Object.keys(selectedElement.currentValues).length > 0 && (
                <div>
                  <label className="text-xs text-white/40 block mb-1.5 uppercase tracking-wider">Current Values</label>
                  <div className="bg-white/5 border border-white/10 rounded-lg p-3 space-y-1">
                    {Object.entries(selectedElement.currentValues).map(([key, val]) => (
                      <div key={key} className="flex justify-between text-xs">
                        <span className="text-white/50 font-mono">{key}</span>
                        <span className="text-white/80">{String(val)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="p-4 border-t border-white/10 space-y-2">
              <LumaButton active className="w-full" onClick={() => {
                if (selectedElement) {
                  applyChange(selectedElement.id, 'opacity', 1)
                }
              }}>
                <span className="flex items-center justify-center gap-2">
                  <SparkleIcon size={14} />
                  Apply Changes
                </span>
              </LumaButton>
            </div>
          </aside>
        )}
      </div>
    </div>
  )
}
