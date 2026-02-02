import { Outlet } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'

/**
 * 主布局组件
 * 包含导航栏、主内容区域和页脚
 * 所有需要导航栏的页面都应该使用此布局
 *
 * @returns {React.ReactNode} 布局组件
 */
function MainLayout() {
  return (
    <div className="h-screen bg-gray-50 transition-all duration-300 flex flex-col overflow-hidden">
      {/* 顶部导航栏 */}
      <Navbar />

      {/* 主内容区域（flex-grow 使其占据剩余空间，overflow-y-auto 允许滚动） */}
      <main className="mx-auto px-5 py-8 flex-1 overflow-y-auto">
        <Outlet />
      </main>

      {/* 页脚 */}
      <Footer />
    </div>
  )
}

export default MainLayout
