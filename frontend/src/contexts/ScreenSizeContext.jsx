/**
 * 屏幕尺寸上下文
 *
 * 功能说明：
 * - 实时检测屏幕尺寸变化
 * - 提供多种屏幕尺寸判断（移动端、平板、大屏、超大屏）
 * - 支持自动/手动模式切换
 * - 为响应式设计提供统一的数据源
 *
 * 使用方式：
 * 1. 在应用根节点包裹 ScreenSizeProvider
 * 2. 在组件中使用 useScreenSize hook 获取屏幕信息
 * 3. 根据屏幕尺寸动态调整 UI
 *
 * @example
 * // 在 App.jsx 中
 * <ScreenSizeProvider>
 *   <App />
 * </ScreenSizeProvider>
 *
 * @example
 * // 在组件中使用
 * function MyComponent() {
 *   const { isLargeScreen, isMobile } = useScreenSize()
 *   return <div className={isLargeScreen ? 'text-2xl' : 'text-sm'}>
 *     根据屏幕大小调整字体
 *   </div>
 * }
 */
import { createContext, useContext, useState, useEffect } from 'react'

/**
 * 屏幕尺寸上下文
 *
 * 默认值定义了上下文返回的数据结构
 * 包含屏幕尺寸判断、屏幕模式、以及切换方法
 */
const ScreenSizeContext = createContext({
  // 是否是大屏（>= 1920px）
  isLargeScreen: false,

  // 是否是超大屏（>= 2560px）
  isExtraLargeScreen: false,

  // 是否是小屏（< 1024px）
  isSmallScreen: false,

  // 是否是移动端（< 640px）
  isMobile: false,

  // 是否是平板（640px - 1024px）
  isTablet: false,

  // 屏幕宽度（px）
  screenWidth: 0,

  // 屏幕高度（px）
  screenHeight: 0,

  // 屏幕模式：'auto'（自动判断） | 'large'（强制大屏）
  screenMode: 'auto',

  // 切换屏幕模式的函数
  setScreenMode: () => {},
})

/**
 * 屏幕尺寸上下文 Provider
 *
 * 提供全局屏幕尺寸状态管理，监听窗口大小变化
 *
 * 功能：
 * - 自动监听窗口 resize 事件
 * - 根据屏幕宽度判断设备类型
 * - 支持手动切换大屏/普通模式
 * - 为所有子组件提供屏幕尺寸数据
 *
 * @param {Object} props - 组件属性
 * @param {React.ReactNode} props.children - 子组件
 *
 * @example
 * <ScreenSizeProvider>
 *   <YourApp />
 * </ScreenSizeProvider>
 */
export function ScreenSizeProvider({ children }) {
  // 屏幕宽度状态
  // 初始化时使用 window.innerWidth，避免服务端渲染时出错
  const [screenWidth, setScreenWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1920)

  // 屏幕高度状态
  const [screenHeight, setScreenHeight] = useState(typeof window !== 'undefined' ? window.innerHeight : 1080)

  // 屏幕模式状态
  // 'auto': 根据屏幕宽度自动判断
  // 'large': 强制使用大屏样式
  const [screenMode, setScreenMode] = useState('auto')

  // 监听窗口大小变化
  useEffect(() => {
    // 定义 resize 事件处理函数
    const handleResize = () => {
      setScreenWidth(window.innerWidth)
      setScreenHeight(window.innerHeight)
    }

    // 添加 resize 事件监听器
    window.addEventListener('resize', handleResize)

    // 清理函数：移除事件监听器
    return () => window.removeEventListener('resize', handleResize)
  }, []) // 空依赖数组，只在组件挂载时执行一次

  // ========== 屏幕类型判断 ==========
  // 根据 Tailwind CSS 的断点标准判断设备类型

  // 移动端：屏幕宽度 < 640px
  const isMobile = screenWidth < 640

  // 平板：屏幕宽度 640px - 1024px
  const isTablet = screenWidth >= 640 && screenWidth < 1024

  // 小屏：屏幕宽度 < 1024px（包含移动端和平板）
  const isSmallScreen = screenWidth < 1024

  // 大屏：屏幕宽度 >= 1920px 或强制大屏模式
  // 2K 分辨率及以上
  const isLargeScreen = screenMode === 'large' || (screenMode === 'auto' && screenWidth >= 1920)

  // 超大屏：屏幕宽度 >= 2560px 或强制大屏模式
  // 4K 分辨率及以上
  const isExtraLargeScreen = screenMode === 'large' || (screenMode === 'auto' && screenWidth >= 2560)

  return (
    // 提供 Context 值给所有子组件
    <ScreenSizeContext.Provider
      value={{
        isLargeScreen,      // 是否大屏
        isExtraLargeScreen, // 是否超大屏
        isSmallScreen,      // 是否小屏
        isMobile,           // 是否移动端
        isTablet,           // 是否平板
        screenWidth,        // 屏幕宽度
        screenHeight,       // 屏幕高度
        screenMode,         // 屏幕模式
        setScreenMode,      // 切换屏幕模式
      }}
    >
      {children}
    </ScreenSizeContext.Provider>
  )
}

/**
 * 使用屏幕尺寸上下文的 Hook
 *
 * 这是一个自定义 Hook，用于在组件中访问屏幕尺寸数据
 * 必须在 ScreenSizeProvider 的子组件中使用
 *
 * @returns {Object} 屏幕尺寸相关状态和方法
 * @returns {boolean} returns.isLargeScreen - 是否是大屏
 * @returns {boolean} returns.isExtraLargeScreen - 是否是超大屏
 * @returns {boolean} returns.isSmallScreen - 是否是小屏
 * @returns {boolean} returns.isMobile - 是否是移动端
 * @returns {boolean} returns.isTablet - 是否是平板
 * @returns {number} returns.screenWidth - 屏幕宽度（px）
 * @returns {number} returns.screenHeight - 屏幕高度（px）
 * @returns {string} returns.screenMode - 屏幕模式（'auto' | 'large'）
 * @returns {Function} returns.setScreenMode - 切换屏幕模式
 *
 * @throws {Error} 如果不在 ScreenSizeProvider 中使用会抛出错误
 *
 * @example
 * function MyComponent() {
 *   const { isLargeScreen, screenWidth } = useScreenSize()
 *
 *   return (
 *     <div>
 *       {isLargeScreen && <div>大屏内容</div>}
 *       <p>当前宽度: {screenWidth}px</p>
 *     </div>
 *   )
 * }
 */
export function useScreenSize() {
  // 获取 Context 值
  const context = useContext(ScreenSizeContext)

  // 检查是否在 Provider 中使用
  if (!context) {
    throw new Error('useScreenSize must be used within ScreenSizeProvider')
  }

  // 返回 Context 值
  return context
}

/**
 * 屏幕模式切换组件
 *
 * 提供一个浮动按钮，用于切换大屏/普通模式
 * 用户可以手动切换，不受屏幕实际尺寸影响
 *
 * 特点：
 * - 固定在右下角
 * - 小屏幕自动隐藏
 * - 显示当前模式状态
 * - 提供切换动画效果
 *
 * @example
 * // 在 App.jsx 中
 * <ScreenSizeProvider>
 *   <App />
 *   <ScreenModeToggle />  // 添加切换按钮
 * </ScreenSizeProvider>
 */
export function ScreenModeToggle() {
  // 获取屏幕尺寸相关状态和方法
  const { screenMode, setScreenMode, isLargeScreen, isExtraLargeScreen, isSmallScreen } = useScreenSize()

  // 小屏幕自动隐藏切换按钮
  if (isSmallScreen && screenMode === 'auto') {
    return null
  }

  return (
    // 浮动按钮容器
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2">
      {/* 切换按钮 */}
      <button
        // 点击切换模式：auto <-> large
        onClick={() => setScreenMode(screenMode === 'large' ? 'auto' : 'large')}

        // 样式：大屏模式为蓝色，普通模式为白色
        className={`px-4 py-2 rounded-lg shadow-lg transition-all ${
          screenMode === 'large' || isLargeScreen
            ? 'bg-blue-600 text-white'
            : 'bg-white text-gray-700 hover:bg-gray-100'
        }`}

        // 鼠标悬停提示
        title={screenMode === 'large' ? '切换到自动模式' : '切换到大屏模式'}
      >
        <div className="flex items-center gap-2">
          {/* 图标：根据模式显示不同图标 */}
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            {isLargeScreen || isExtraLargeScreen ? (
              // 大屏模式：收缩图标
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4"
              />
            ) : (
              // 普通模式：展开图标
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z"
              />
            )}
          </svg>

          {/* 文本：显示当前模式 */}
          <span className="text-sm font-medium">
            {screenMode === 'large' ? '大屏' : isLargeScreen ? '大屏' : '普通'}
          </span>
        </div>
      </button>
    </div>
  )
}

// 导出 Context 以便在某些情况下直接使用
export default ScreenSizeContext
