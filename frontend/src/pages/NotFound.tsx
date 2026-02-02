import { useNavigate } from 'react-router-dom'
import { useScreenSize } from '../contexts/ScreenSizeContext'

function NotFound() {
  const navigate = useNavigate()
  const { isLargeScreen, isExtraLargeScreen } = useScreenSize()

  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="text-center">
        {/* 404 图标 */}
        <div className="mb-8">
          <div className={`inline-block ${
            isExtraLargeScreen ? 'w-32 h-32' : isLargeScreen ? 'w-24 h-24' : 'w-20 h-20'
          } mb-6 rounded-2xl bg-gradient-to-br from-red-500 to-pink-600 flex items-center justify-center shadow-2xl`}>
            <svg className={`${isExtraLargeScreen ? 'w-16 h-16' : 'w-12 h-12'} text-white`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
        </div>

        {/* 404 文字 */}
        <h1 className={`font-bold text-gray-900 mb-4 ${
          isExtraLargeScreen ? 'text-9xl' : isLargeScreen ? 'text-8xl' : 'text-7xl'
        }`}>
          404
        </h1>

        <h2 className={`font-semibold text-gray-700 mb-4 ${
          isExtraLargeScreen ? 'text-3xl' : isLargeScreen ? 'text-2xl' : 'text-xl'
        }`}>
          页面未找到
        </h2>

        <p className={`text-gray-600 mb-8 ${
          isExtraLargeScreen ? 'text-xl' : isLargeScreen ? 'text-lg' : 'text-base'
        }`}>
          抱歉，您访问的页面不存在或已被移除
        </p>

        {/* 操作按钮 */}
        <div className="flex justify-center gap-4">
          <button
            onClick={() => navigate(-1)}
            className={`bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-all duration-300 font-semibold shadow-md hover:shadow-lg ${
              isLargeScreen || isExtraLargeScreen ? 'px-8 py-3 text-base' : 'px-6 py-2 text-sm'
            }`}
          >
            返回上一页
          </button>
          <button
            onClick={() => navigate('/')}
            className={`bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-300 font-semibold shadow-lg hover:shadow-2xl ${
              isLargeScreen || isExtraLargeScreen ? 'px-8 py-3 text-base' : 'px-6 py-2 text-sm'
            }`}
          >
            返回首页
          </button>
        </div>

        {/* 装饰性元素 */}
        {(isLargeScreen || isExtraLargeScreen) && (
          <div className="mt-12 text-gray-400">
            <p className="text-sm">常见原因：</p>
            <ul className="text-sm mt-2 space-y-1">
              <li>• 输入的网址有误</li>
              <li>• 页面已被删除或移动</li>
              <li>• 链接已过期</li>
            </ul>
          </div>
        )}
      </div>
    </div>
  )
}

export default NotFound
