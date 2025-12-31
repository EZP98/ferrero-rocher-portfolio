import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import './index.css'
import App from './App'
import AnimationConsole from './pages/AnimationConsole'

createRoot(document.getElementById('root')!).render(
  <BrowserRouter>
    <Routes>
      <Route path="/" element={<App />} />
      <Route path="/console/animations" element={<AnimationConsole />} />
    </Routes>
  </BrowserRouter>
)
