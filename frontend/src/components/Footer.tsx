import { useScreenSize } from '../contexts/ScreenSizeContext'

/**
 * 页脚组件
 * 显示版权信息
 *
 * @returns {React.ReactNode} 页脚组件
 */
function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-gray-900 text-gray-300 border-t border-gray-800">
      <div className="container mx-auto px-4 py-4 text-center text-sm">
        <p>
          &copy; {currentYear} Go-Gin + React19. 保留所有权利。
        </p>
      </div>
    </footer>
  )
}

export default Footer
