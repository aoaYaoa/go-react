import type { ReactNode } from 'react'
import { ScreenSizeContextType } from '../types'

const ScreenSizeContext = createContext<ScreenSizeContextType | undefined>(undefined)

interface ScreenSizeProviderProps {
  children: ReactNode
}

export function ScreenSizeProvider({ children }: ScreenSizeProviderProps) {
  const [screenWidth, setScreenWidth] = useState<number>(
    typeof window !== 'undefined' ? window.innerWidth : 1920
  )

  useEffect(() => {
    const handleResize = () => {
      setScreenWidth(window.innerWidth)
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const isLargeScreen = screenWidth >= 1920
  const isExtraLargeScreen = screenWidth >= 2560

  const value: ScreenSizeContextType = {
    isLargeScreen,
    isExtraLargeScreen,
  }

  return (
    <ScreenSizeContext.Provider value={value}>
      {children}
    </ScreenSizeContext.Provider>
  )
}

export function useScreenSize(): ScreenSizeContextType {
  const context = useContext(ScreenSizeContext)
  if (!context) {
    throw new Error('useScreenSize must be used within ScreenSizeProvider')
  }
  return context
}

export default ScreenSizeContext
