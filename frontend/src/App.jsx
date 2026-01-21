/**
 * 应用根组件
 *
 * 功能说明：
 * - 配置路由系统
 * - 全局样式管理
 * - 屏幕尺寸上下文提供者
 * - 响应式布局容器
 *
 * 路由配置：
 * - /: 首页（Home 组件）
 * - /tasks: 任务管理页面（Tasks 组件）
 * - /about: 关于页面（About 组件）
 *
 * 使用方式：
 * 此组件是应用的入口点，在 main.jsx 中被渲染
 */
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { ScreenSizeProvider, ScreenModeToggle } from './contexts/ScreenSizeContext'
import { useEffect } from 'react'
import Navbar from './components/Navbar'
import Home from './pages/Home'
import Tasks from './pages/Tasks'
import About from './pages/About'

/**
 * App 主组件
 *
 * 包含：
 * 1. 屏幕尺寸上下文 Provider（为整个应用提供屏幕尺寸信息）
 * 2. 路由配置（React Router）
 * 3. 导航栏组件
 * 4. 主内容区域
 * 5. 屏幕模式切换按钮
 *
 * 样式说明：
 * - min-h-screen: 最小高度为屏幕高度
 * - bg-gray-50: 浅灰色背景
 * - transition-all duration-300: 平滑过渡效果（响应式切换时）
 */
function App() {
  // 动态导入大屏样式
  // 使用 import() 确保样式按需加载
  useEffect(() => {
    import('./styles/large-screen.css')
  }, []) // 空依赖数组，只在组件挂载时执行一次

  return (
    // 屏幕尺寸上下文 Provider
    // 为所有子组件提供屏幕尺寸信息（宽度、高度、设备类型等）
    <ScreenSizeProvider>
      {/* 路由器配置 */}
      <Router>
        {/* 应用主容器 */}
        <div className="min-h-screen bg-gray-50 transition-all duration-300">
          {/* 顶部导航栏 */}
          <Navbar />

          {/* 主内容区域 */}
          <main className="container mx-auto px-4 py-8">
            {/* 路由配置 */}
            <Routes>
              {/* 首页路由 */}
              <Route path="/" element={<Home />} />

              {/* 任务管理页面路由 */}
              <Route path="/tasks" element={<Tasks />} />

              {/* 关于页面路由 */}
              <Route path="/about" element={<About />} />
            </Routes>
          </main>

          {/* 屏幕模式切换按钮 */}
          {/* 固定在右下角，用于切换大屏/普通模式 */}
          <ScreenModeToggle />
        </div>
      </Router>
    </ScreenSizeProvider>
  )
}

// 导出 App 组件
export default App
