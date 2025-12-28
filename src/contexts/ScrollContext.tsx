import { createContext, useContext, useState, useEffect, ReactNode } from 'react'

interface ScrollContextType {
  scrollProgress: number
  setScrollProgress: (value: number) => void
  isDebugMode: boolean
}

const ScrollContext = createContext<ScrollContextType>({
  scrollProgress: 0,
  setScrollProgress: () => {},
  isDebugMode: false,
})

export function useScrollProgress() {
  return useContext(ScrollContext)
}

// Provider for real scrolling (used in App.tsx)
export function ScrollProvider({ children }: { children: ReactNode }) {
  const [scrollProgress, setScrollProgress] = useState(0)

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY
      const docHeight = document.documentElement.scrollHeight - window.innerHeight
      setScrollProgress(docHeight > 0 ? scrollTop / docHeight : 0)
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    handleScroll() // Initial call
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <ScrollContext.Provider value={{ scrollProgress, setScrollProgress, isDebugMode: false }}>
      {children}
    </ScrollContext.Provider>
  )
}

// Provider for debug mode (used in DebugPage.tsx)
export function DebugScrollProvider({
  children,
  value
}: {
  children: ReactNode
  value: number
}) {
  return (
    <ScrollContext.Provider value={{
      scrollProgress: value,
      setScrollProgress: () => {},
      isDebugMode: true
    }}>
      {children}
    </ScrollContext.Provider>
  )
}
