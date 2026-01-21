import { Link } from 'react-router-dom'
import { useScreenSize } from '../contexts/ScreenSizeContext'

function Navbar() {
  const { isLargeScreen, isExtraLargeScreen } = useScreenSize()

  return (
    <nav className="bg-white/95 backdrop-blur-lg shadow-lg border-b border-gray-100 sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className={`flex justify-between items-center ${
          isExtraLargeScreen ? 'py-6' : isLargeScreen ? 'py-5' : 'py-4'
        }`}>
          <Link to="/" className={`font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent transition-all hover:opacity-80 ${
            isExtraLargeScreen ? 'text-4xl' : isLargeScreen ? 'text-3xl' : 'text-2xl'
          }`}>
            Go-Gin + React19
          </Link>
          <div className={`flex items-center gap-1${
            isExtraLargeScreen ? 'space-x-10' : isLargeScreen ? 'space-x-8' : 'space-x-6'
          }`}>
            {[
              { path: '/', label: '首页', icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
              )},
              { path: '/tasks', label: '任务管理', icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                </svg>
              )},
              { path: '/about', label: '关于', icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              )},
            ].map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`group relative flex items-center gap-2 text-gray-700 hover:text-blue-600 transition-all duration-300 px-4 py-2 rounded-xl hover:bg-blue-50 ${
                  isLargeScreen || isExtraLargeScreen ? 'text-lg' : ''
                }`}
              >
                {isLargeScreen || isExtraLargeScreen && item.icon}
                <span>{item.label}</span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </nav>
  )
}

export default Navbar
