import { useScreenSize } from '../contexts/ScreenSizeContext'

function About() {
  const { isLargeScreen, isExtraLargeScreen } = useScreenSize()

  const containerClass = isExtraLargeScreen
    ? 'max-w-7xl'
    : isLargeScreen
    ? 'max-w-5xl'
    : 'max-w-4xl'

  const headingClass = isExtraLargeScreen
    ? 'text-6xl'
    : isLargeScreen
    ? 'text-5xl'
    : 'text-4xl'

  const sectionHeadingClass = isExtraLargeScreen
    ? 'text-4xl'
    : isLargeScreen
    ? 'text-3xl'
    : 'text-2xl'

  const subHeadingClass = isExtraLargeScreen
    ? 'text-2xl'
    : isLargeScreen
    ? 'text-xl'
    : 'text-lg'

  const textClass = isLargeScreen || isExtraLargeScreen
    ? 'text-lg leading-loose'
    : 'text-base leading-relaxed'

  const cardPadding = isLargeScreen || isExtraLargeScreen
    ? 'p-10'
    : 'p-8'

  const codePadding = isLargeScreen || isExtraLargeScreen
    ? 'p-6 text-base'
    : 'p-4 text-sm'

  const listItemSpacing = isLargeScreen || isExtraLargeScreen
    ? 'space-y-3'
    : 'space-y-2'

  return (
    <div className={`${containerClass} mx-auto transition-all duration-300`}>
      <h1 className={`font-bold text-gray-900 mb-12 ${headingClass}`}>关于项目</h1>

      <div className={`bg-white rounded-lg shadow-md mb-8 hover:shadow-xl transition-shadow duration-300 ${cardPadding}`}>
        <h2 className={`font-bold text-blue-600 mb-6 ${sectionHeadingClass}`}>项目介绍</h2>
        <p className={`text-gray-700 mb-6 ${textClass}`}>
          这是一个演示如何使用 Go-Gin 和 React 19 构建全栈应用的示例项目。
          项目包含完整的 CRUD 功能，展示了前后端分离架构的最佳实践。
        </p>
        <p className={`text-gray-700 ${textClass}`}>
          前端使用 React 19 的新特性，后端使用 Go-Gin 框架提供高性能的 API 服务。
          通过 Vite 的代理配置，前后端可以无缝协作。
        </p>
      </div>

      <div className={`bg-white rounded-lg shadow-md mb-8 hover:shadow-xl transition-shadow duration-300 ${cardPadding}`}>
        <h2 className={`font-bold text-blue-600 mb-6 ${sectionHeadingClass}`}>技术栈</h2>
        <div className={`${isExtraLargeScreen ? 'grid grid-cols-2 gap-8' : 'md:grid-cols-2 gap-6'}`}>
          <div>
            <h3 className={`font-semibold text-gray-900 mb-4 ${subHeadingClass}`}>后端</h3>
            <ul className={`list-disc list-inside text-gray-700 ${listItemSpacing}`}>
              <li>Go 1.21+</li>
              <li>Gin Web Framework</li>
              <li>CORS 中间件</li>
              <li>RESTful API 设计</li>
              <li>企业级分层架构</li>
              <li>全面的中间件支持</li>
            </ul>
          </div>
          <div>
            <h3 className={`font-semibold text-gray-900 mb-4 ${subHeadingClass}`}>前端</h3>
            <ul className={`list-disc list-inside text-gray-700 ${listItemSpacing}`}>
              <li>React 19</li>
              <li>Vite 5.4+</li>
              <li>React Router DOM 6</li>
              <li>Tailwind CSS 3</li>
              <li>CryptoJS 加密工具</li>
              <li>大屏响应式设计</li>
            </ul>
          </div>
        </div>
      </div>

      <div className={`bg-white rounded-lg shadow-md mb-8 hover:shadow-xl transition-shadow duration-300 ${cardPadding}`}>
        <h2 className={`font-bold text-blue-600 mb-6 ${sectionHeadingClass}`}>快速开始</h2>
        <div className={`${isExtraLargeScreen ? 'space-y-8' : 'space-y-4'}`}>
          <div>
            <h3 className={`font-semibold text-gray-900 mb-3 ${subHeadingClass}`}>启动后端</h3>
            <div className={`bg-gray-100 rounded-lg ${codePadding}`}>
              <code>
                cd backend<br />
                go mod tidy<br />
                go run main.go
              </code>
            </div>
          </div>
          <div>
            <h3 className={`font-semibold text-gray-900 mb-3 ${subHeadingClass}`}>启动前端</h3>
            <div className={`bg-gray-100 rounded-lg ${codePadding}`}>
              <code>
                cd frontend<br />
                npm install<br />
                npm run dev
              </code>
            </div>
          </div>
        </div>
      </div>

      <div className={`bg-white rounded-lg shadow-md mb-8 hover:shadow-xl transition-shadow duration-300 ${cardPadding}`}>
        <h2 className={`font-bold text-blue-600 mb-6 ${sectionHeadingClass}`}>功能特性</h2>
        <ul className={`list-disc list-inside text-gray-700 ${listItemSpacing}`}>
          <li>完整的任务 CRUD 操作</li>
          <li>实时数据更新</li>
          <li>响应式设计，支持移动端</li>
          <li>CORS 跨域支持</li>
          <li>优雅的错误处理</li>
          <li>健康检查接口</li>
          <li>AES/RSA 加密解密</li>
          <li>多种哈希算法支持</li>
          <li>大屏模式适配</li>
          <li>自动屏幕模式切换</li>
        </ul>
      </div>

      {/* 大屏模式额外特性 */}
      {(isLargeScreen || isExtraLargeScreen) && (
        <div className={`bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg shadow-xl mb-8 text-white ${cardPadding}`}>
          <h2 className={`font-bold mb-6 ${sectionHeadingClass}`}>🎯 大屏优化</h2>
          <div className={`${isExtraLargeScreen ? 'grid grid-cols-2 gap-8' : 'md:grid-cols-2 gap-6'}`}>
            <div>
              <h3 className={`font-semibold mb-3 ${subHeadingClass}`}>视觉体验</h3>
              <p className={textClass}>
                专为 1920px+ 分辨率优化，提供更大的字体、更舒适的间距和更佳的视觉层次。
              </p>
            </div>
            <div>
              <h3 className={`font-semibold mb-3 ${subHeadingClass}`}>灵活切换</h3>
              <p className={textClass}>
                支持自动和手动切换屏幕模式，右下角提供快捷切换按钮，适应不同使用场景。
              </p>
            </div>
          </div>
        </div>
      )}

      {/* 快速链接 */}
      <div className={`bg-white rounded-lg shadow-md mb-8 hover:shadow-xl transition-shadow duration-300 ${cardPadding}`}>
        <h2 className={`font-bold text-blue-600 mb-6 ${sectionHeadingClass}`}>快速链接</h2>
        <div className={`${isExtraLargeScreen ? 'grid grid-cols-2 gap-6' : 'space-y-3'}`}>
          <a href="/" className="block text-gray-700 hover:text-blue-600 transition-colors">
            → 首页
          </a>
          <a href="/tasks" className="block text-gray-700 hover:text-blue-600 transition-colors">
            → 任务管理
          </a>
          <a href="/about" className="block text-gray-700 hover:text-blue-600 transition-colors">
            → 关于项目
          </a>
          <a href="/auth" className="block text-gray-700 hover:text-blue-600 transition-colors">
            → 认证演示
          </a>
        </div>
      </div>

      {/* 联系方式 */}
      <div className={`bg-white rounded-lg shadow-md mb-8 hover:shadow-xl transition-shadow duration-300 ${cardPadding}`}>
        <h2 className={`font-bold text-blue-600 mb-6 ${sectionHeadingClass}`}>联系我们</h2>
        <div className={`${isExtraLargeScreen ? 'grid grid-cols-3 gap-6' : 'space-y-4'}`}>
          <div className="flex items-center gap-3">
            <a
              href="#"
              className="w-12 h-12 rounded-full bg-gray-800 flex items-center justify-center hover:bg-blue-600 transition-colors text-white"
              title="GitHub"
            >
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v 3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
              </svg>
            </a>
            <span className="text-gray-700">GitHub</span>
          </div>
          <div className="flex items-center gap-3">
            <a
              href="#"
              className="w-12 h-12 rounded-full bg-gray-800 flex items-center justify-center hover:bg-blue-400 transition-colors text-white"
              title="Twitter"
            >
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2s9 5 20 5a9.5 9.5 0 00-9-5.5c4.75 2.25 7-7 7-7s1.1 5.2-5.2 8.3A15.7 15.7 0 010 22" />
              </svg>
            </a>
            <span className="text-gray-700">Twitter</span>
          </div>
          <div className="flex items-center gap-3">
            <a
              href="#"
              className="w-12 h-12 rounded-full bg-gray-800 flex items-center justify-center hover:bg-green-600 transition-colors text-white"
              title="Email"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </a>
            <span className="text-gray-700">Email</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default About
