import { useNavigate, useLocation } from 'react-router-dom'
import { useState, useRef, useEffect, MouseEvent } from 'react'
import { useScreenSize } from '../contexts/ScreenSizeContext'
import { menuConfig } from '../router'
import { userService } from '../services/user'

function Navbar() {
  const { isLargeScreen, isExtraLargeScreen } = useScreenSize()
  const navigate = useNavigate()
  const location = useLocation()
  const [isDropdownOpen, setIsDropdownOpen] = useState<boolean>(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // 获取用户信息
  const user = userService.getLocalUserInfo()
  const userRole = user?.role || null

  // 过滤菜单项：根据角色权限显示
  const visibleMenuItems = menuConfig.filter((item) => {
    // 如果菜单项不需要角色，总是显示
    if (item.requiredRole === null) {
      return true
    }
    // 如果需要角色，检查用户是否有该角色
    return userRole === item.requiredRole
  })

  // 点击外部关闭下拉菜单
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent | any) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // 处理退出登录
  const handleLogout = async () => {
    try {
      await userService.logout()
      setIsDropdownOpen(false)
      navigate('/login')
      // 刷新页面以更新导航栏状态
      window.location.reload()
    } catch (error) {
      console.error('退出登录失败:', error)
    }
  }

  // 获取用户头像 URL（使用默认头像）
  const getAvatarUrl = (): string => {
    // 使用用户名生成默认头像
    const username = user?.username || 'User'
    const hash = btoa(username.toLowerCase().trim()).replace(/=/g, '')
    return `https://www.gravatar.com/avatar/${hash}?d=identicon&s=40`
  }

  // 获取用户名
  const getUserName = (): string => {
    return user?.username || 'User'
  }

  return (
    <nav className="bg-white/95 backdrop-blur-lg shadow-lg border-b border-gray-100 sticky top-0 z-50">
      <div className="mx-auto px-5">
        <div className={`flex justify-between items-center ${
          isExtraLargeScreen ? 'py-6' : isLargeScreen ? 'py-5' : 'py-4'
        }`}>
          {/* 左侧：Logo + 项目名 */}
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-3 hover:opacity-80 transition-opacity cursor-pointer"
          >
            {/* Logo */}
            <div className={`bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg ${
              isExtraLargeScreen ? 'w-12 h-12' : isLargeScreen ? 'w-11 h-11' : 'w-10 h-10'
            }`}>
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            {/* 项目名 */}
            <span className={`font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent ${
              isExtraLargeScreen ? 'text-2xl' : isLargeScreen ? 'text-xl' : 'text-lg'
            }`}>
              TaskFlow
            </span>
          </button>

          {/* 右侧：导航菜单 + 用户头像 */}
          <div className={`flex items-center ${
            isExtraLargeScreen ? 'gap-8' : isLargeScreen ? 'gap-6' : 'gap-4'
          }`}>
            {/* 导航菜单 */}
            {visibleMenuItems.map((item) => {
              const isActive = location.pathname === item.path
              return (
                <button
                  key={item.path}
                  onClick={() => navigate(item.path)}
                  className={`group relative flex items-center gap-2 transition-all duration-300 px-4 py-2 rounded-xl cursor-pointer ${
                    isActive
                      ? 'text-blue-600 bg-blue-50'
                      : 'text-gray-700 hover:text-blue-600 hover:bg-blue-50'
                  } ${isLargeScreen || isExtraLargeScreen ? 'text-base' : 'text-sm'}`}
                >
                  {(isLargeScreen || isExtraLargeScreen) && item.icon}
                  <span>{item.label}</span>
                </button>
              )
            })}

            {/* 用户头像和下拉菜单 */}
            {user && (
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="flex items-center gap-2 pl-4 border-l border-gray-200 hover:opacity-80 transition-opacity cursor-pointer"
                >
                  <img
                    src={getAvatarUrl()}
                    alt={getUserName()}
                    className="w-5 h-5 rounded-full object-cover ring-2 ring-blue-100 hover:ring-blue-300 transition-all"
                  />
                  {(isLargeScreen || isExtraLargeScreen) && (
                    <span className="text-gray-700 font-medium text-sm">{getUserName()}</span>
                  )}
                </button>

                {/* 下拉菜单 */}
                {isDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl border border-gray-100 py-2 z-50 animate-in fade-in slide-in-from-top-2">
                    <div className="px-4 py-3 border-b border-gray-100">
                      <p className="text-sm font-semibold text-gray-900">{getUserName()}</p>
                      {user?.email && (
                        <p className="text-xs text-gray-500 truncate">{user.email}</p>
                      )}
                      <p className="text-xs text-blue-600 mt-1">角色: {user?.role}</p>
                    </div>
                    <button
                      onClick={() => {
                        navigate('/profile')
                        setIsDropdownOpen(false)
                      }}
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors cursor-pointer"
                    >
                      <span className="flex items-center gap-2">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        个人资料
                      </span>
                    </button>
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors border-t border-gray-100 cursor-pointer"
                    >
                      <span className="flex items-center gap-2">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                        退出登录
                      </span>
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}

export default Navbar
