import { Link } from 'react-router-dom'
import { useScreenSize } from '../contexts/ScreenSizeContext'

function Home() {
  const { isLargeScreen, isExtraLargeScreen } = useScreenSize()

  const containerClass = isLargeScreen || isExtraLargeScreen
    ? 'max-w-7xl'
    : 'max-w-4xl'

  const gridCols = isExtraLargeScreen
    ? 'grid-cols-4'
    : isLargeScreen
    ? 'grid-cols-3'
    : 'md:grid-cols-4'

  const buttonSize = isLargeScreen || isExtraLargeScreen
    ? 'px-12 py-4 text-lg'
    : 'px-8 py-3'

  return (
    <div className={`${containerClass} mx-auto transition-all duration-300 relative`}>
      {/* 装饰性背景元素 */}
      {(isLargeScreen || isExtraLargeScreen) && (
        <>
          <div className="decorative-circle w-96 h-96 -top-48 -left-48 opacity-50"></div>
          <div className="decorative-circle w-96 h-96 -bottom-48 -right-48 opacity-50"></div>
        </>
      )}

      <div className={`text-center ${isLargeScreen || isExtraLargeScreen ? 'py-24' : 'py-16'} relative z-10`}>
        <div className="mb-8">
          <div className={`inline-block ${
            isExtraLargeScreen ? 'w-32 h-32' : isLargeScreen ? 'w-24 h-24' : 'w-20 h-20'
          } mb-6 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-2xl animate-float`}>
            <svg className={`${isExtraLargeScreen ? 'w-16 h-16' : 'w-12 h-12'} text-white`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
        </div>

        <h1 className={`font-bold text-gray-900 mb-6 ${
          isExtraLargeScreen
            ? 'text-7xl'
            : isLargeScreen
            ? 'text-6xl'
            : 'text-5xl'
        }`}>
          欢迎使用 Go-Gin + React19 全栈项目
        </h1>
        <p className={`text-gray-600 mb-8 max-w-3xl mx-auto ${
          isExtraLargeScreen
            ? 'text-2xl'
            : isLargeScreen
            ? 'text-xl'
            : 'text-xl'
        }`}>
          这是一个基于 Go-Gin 后端和 React 19 前端的现代化全栈应用示例
        </p>
        <div className="flex justify-center space-x-6 flex-wrap gap-4">
          <Link
            to="/tasks"
            className={`bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-300 font-semibold shadow-lg hover:shadow-2xl ${buttonSize}`}
          >
            开始使用任务管理
          </Link>
          <Link
            to="/crypto"
            className={`bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-lg hover:from-purple-700 hover:to-purple-800 transition-all duration-300 font-semibold shadow-lg hover:shadow-2xl ${buttonSize}`}
          >
            加密工具
          </Link>
          <Link
            to="/about"
            className={`bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-all duration-300 font-semibold shadow-md hover:shadow-lg ${buttonSize}`}
          >
            了解更多
          </Link>
        </div>
      </div>

      <div className={`grid ${gridCols} gap-8 mt-12 relative z-10`}>
        <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center mb-4">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01" />
            </svg>
          </div>
          <h3 className="text-xl font-bold text-blue-600 mb-4">Go-Gin 后端</h3>
          <p className="text-gray-600">
            使用 Go-Gin 框架构建的高性能 REST API，支持任务管理的增删改查操作
          </p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
          <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-cyan-600 rounded-xl flex items-center justify-center mb-4">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
            </svg>
          </div>
          <h3 className="text-xl font-bold text-cyan-600 mb-4">React 19 前端</h3>
          <p className="text-gray-600">
            基于 React 19 和 Vite 构建的现代化前端应用，提供流畅的用户体验
          </p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
          <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center mb-4">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h3 className="text-xl font-bold text-purple-600 mb-4">加密工具</h3>
          <p className="text-gray-600">
            集成 AES、RSA、哈希等加密算法，支持数据加密、解密和签名验证
          </p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
          <div className="w-12 h-12 bg-gradient-to-br from-pink-500 to-pink-600 rounded-xl flex items-center justify-center mb-4">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
            </svg>
          </div>
          <h3 className="text-xl font-bold text-pink-600 mb-4">Tailwind CSS</h3>
          <p className="text-gray-600">
            使用 Tailwind CSS 实现响应式设计，美观且易于维护的样式系统
          </p>
        </div>
      </div>

      {/* 大屏模式额外特性卡片 */}
      {(isLargeScreen || isExtraLargeScreen) && (
        <div className={`mt-16 ${isExtraLargeScreen ? 'grid grid-cols-2 gap-8' : 'grid md:grid-cols-2 gap-8'} relative z-10`}>
          <div className="bg-gradient-to-r from-blue-600 via-blue-700 to-purple-600 p-8 rounded-2xl shadow-2xl text-white hover:scale-105 transition-all duration-300">
            <div className="flex items-start gap-4">
              <div className="w-16 h-16 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <h3 className="text-2xl font-bold mb-4">🎨 大屏优化</h3>
                <p className="leading-relaxed">
                  本项目针对大屏幕设备进行了深度优化，提供更大的字体、更舒适的间距和更佳的视觉体验。
                </p>
              </div>
            </div>
          </div>
          <div className="bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 p-8 rounded-2xl shadow-2xl text-white hover:scale-105 transition-all duration-300">
            <div className="flex items-start gap-4">
              <div className="w-16 h-16 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <div>
                <h3 className="text-2xl font-bold mb-4">⚡ 高性能</h3>
                <p className="leading-relaxed">
                  采用现代化的技术栈，优化的构建流程，确保在各种设备上都能提供流畅的用户体验。
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Home
