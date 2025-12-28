import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import './index.css'
import App from './App'
import { AnimationConsole } from './pages/AnimationConsole'
import { VinylShelf } from './components/VinylShelf'

// Wrapper for VinylShelf demo
function VinylDemo() {
  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0a', padding: 40, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <h1 style={{ color: '#d4a853', marginBottom: 20, fontFamily: 'serif', letterSpacing: '0.1em' }}>VINYL COLLECTION</h1>
      <VinylShelf />
    </div>
  )
}

createRoot(document.getElementById('root')!).render(
  <BrowserRouter>
    <Routes>
      <Route path="/" element={<App />} />
      <Route path="/console/animations" element={<AnimationConsole />} />
      <Route path="/vinyl" element={<VinylDemo />} />
    </Routes>
  </BrowserRouter>
)
