import { Outlet } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'

/**
 * 主布局组件
 * 包含导航栏和主内容区域
 *
 * @returns {React.ReactNode} 布局组件
 */
function MainLayout() {
  return (
    <div className="h-screen flex flex-col overflow-hidden">
      {/* 顶部导航栏 */}
      <Navbar />

      {/* 主内容区域 */}
      <main className="flex-1 relative overflow-auto">
        <Outlet />
      </main>

      {/* 页脚 */}
      <Footer />
    </div>
  )
}

export default MainLayout
