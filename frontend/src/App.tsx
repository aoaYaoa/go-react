/**
 * 应用根组件
 *
 * 功能说明：
 * - 配置路由系统
 * - 屏幕尺寸上下文提供者
 *
 * 使用方式：
 * 此组件是应用的入口点，在 main.tsx 中被渲染
 */
import { useEffect } from 'react'
import { RouterProvider } from 'react-router-dom'
import { App as AntApp } from 'antd'
import zhCN from 'antd/locale/zh_CN'
import enUS from 'antd/locale/en_US'
import { ScreenSizeProvider } from './contexts/ScreenSizeContext'
import { router } from './router'

/**
 * App 主组件
 *
 * 包含：
 * 1. 屏幕尺寸上下文 Provider
 * 2. 路由配置
 *
 * 样式说明：
 * - 全局样式在 index.css 中定义
 * - 大屏样式在 styles/large-screen.css 中定义
 */
function App() {
  // 动态导入大屏样式
  useEffect(() => {
    import('./styles/large-screen.css')
  }, [])

  return (
    <ScreenSizeProvider>
      <AntApp>
        <RouterProvider router={router} />
      </AntApp>
    </ScreenSizeProvider>
  )
}

export default App
