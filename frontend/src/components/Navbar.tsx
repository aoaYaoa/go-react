import type { MenuProps } from 'antd'
import { Avatar, Dropdown } from 'antd'
import { useMemo, useCallback, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate, useLocation } from 'react-router-dom'
import { useScreenSize } from '../contexts/ScreenSizeContext'
import { menuConfig } from '../router'
import { userService } from '../services/user'
import { MenuConfig } from '../types'
// import LanguageSwitcher from './LanguageSwitcher'
import { buildMenuTree, MenuTreeNode } from '../utils/menuUtils'

// 菜单键到翻译键的映射


function Navbar() {
  const { t } = useTranslation()
  const { isLargeScreen, isExtraLargeScreen } = useScreenSize()
  const navigate = useNavigate()
  const location = useLocation()
  const [openSubmenu, setOpenSubmenu] = useState<string | null>(null)

  // 获取用户信息和菜单
  const user = userService.getLocalUserInfo()
  const userRole = user?.role || null
  const backendMenus = userService.getLocalMenus()

  // 判断是否使用动态菜单
  const useDynamicMenu = backendMenus && backendMenus.length > 0

  // 构建动态菜单树
  const dynamicMenuTree = useMemo(() => {
    if (!useDynamicMenu) return []
    return buildMenuTree(backendMenus)
  }, [backendMenus, useDynamicMenu])

  // 递归过滤菜单项：根据角色权限显示（仅用于静态菜单）
  const filterMenuByRole = useCallback((items: MenuConfig[]): MenuConfig[] => {
    return items
      .filter((item) => {
        if (item.requiredRole === null) return true
        return userRole === item.requiredRole
      })
      .map((item) => ({
        ...item,
        children: item.children ? filterMenuByRole(item.children) : undefined
      }))
  }, [userRole])

  // 将后端菜单转换为前端 MenuConfig 格式
  const convertBackendMenuToConfig = useCallback((menu: MenuTreeNode): MenuConfig => {
    // 使用菜单 ID 作为唯一 key
    return {
      key: menu.id,
      path: menu.path || undefined,
      label: menu.name, // 直接使用后端返回的名称
      requiredRole: null, // 后端已经过滤了权限
      // 暂时不显示图标，因为后端返回的是图标名称而不是 SVG HTML
      icon: undefined,
      children: menu.children && menu.children.length > 0
        ? menu.children.map(convertBackendMenuToConfig)
        : undefined
    }
  }, [])

  // 最终显示的菜单项
  const visibleMenuItems = useMemo(() => {
    if (useDynamicMenu) {
      // 使用后端返回的动态菜单
      return dynamicMenuTree.map(convertBackendMenuToConfig)
    } else {
      // 使用静态菜单配置（根据角色过滤）
      return filterMenuByRole(menuConfig)
    }
  }, [useDynamicMenu, dynamicMenuTree, convertBackendMenuToConfig, filterMenuByRole])

  // 获取翻译后的标签
  const getLabel = (item: MenuConfig) => {
    // 动态菜单需要翻译
    if (useDynamicMenu) {
      // 尝试根据 label 找到对应的翻译键
      const labelToKeyMap: Record<string, string> = {
        '首页': 'home',
        '实时追踪': 'tracking',
        '实时地图': 'map',
        '航班列表': 'flights',
        '机场信息': 'airports',
        '无人机': 'drones',
        '无人机地图': 'droneMap',
        '设备管理': 'droneList',
        '任务管理': 'droneMissions',
        '数据分析': 'analytics',
        '数据总览': 'analyticsOverview',
        '航线分析': 'analyticsRoutes',
        '趋势分析': 'analyticsTrends',
        '社区': 'community',
        '飞行分享': 'communityPosts',
        '照片库': 'communityPhotos',
        '系统管理': 'admin',
        '用户管理': 'users',
        '角色管理': 'roles',
        '菜单管理': 'menus',
        '机场管理': 'adminAirports',
        '航空公司': 'airlines',
        '飞机管理': 'aircraft',
        '无人机管理': 'adminDrones',
        '运营商管理': 'operators',
        '禁飞区管理': 'noFlyZones',
        '系统日志': 'systemLogs',
        'API 文档': 'apiDocs',
        '关于': 'about',
      }
      
      const translationKey = labelToKeyMap[item.label]
      if (translationKey) {
        return t(`nav.${translationKey}`, item.label)
      }
      return item.label
    }
    
    // 静态菜单直接返回 label（已经是中文）
    return item.label
  }

  // 检查路径是否匹配
  const isPathActive = (item: MenuConfig): boolean => {
    if (item.path === location.pathname) return true
    if (item.children) {
      return item.children.some(child => child.path === location.pathname)
    }
    return false
  }

  // 处理菜单项点击
  const handleMenuClick = (item: MenuConfig) => {
    if (item.path) {
      navigate(item.path)
      setOpenSubmenu(null)
    } else if (item.children) {
      setOpenSubmenu(openSubmenu === item.key ? null : item.key)
    }
  }

  // 处理退出登录
  const handleLogout = async () => {
    try {
      await userService.logout()
      navigate('/login')
      window.location.reload()
    } catch (error) {
      console.error('退出登录失败:', error)
    }
  }

  // 获取用户头像 URL
  const getAvatarUrl = (): string => {
    const username = user?.username || 'User'
    const hash = btoa(username.toLowerCase().trim()).replace(/=/g, '')
    return `https://www.gravatar.com/avatar/${hash}?d=identicon&s=40`
  }

  // 获取用户名
  const getUserName = (): string => {
    return user?.username || 'User'
  }

  // 用户下拉菜单
  const userMenuItems: MenuProps['items'] = [
    {
      key: 'profile',
      label: t('user.profile', '个人资料'),
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      ),
      onClick: () => navigate('/profile')
    },
    {
      type: 'divider'
    },
    {
      key: 'logout',
      label: t('auth.logout', '退出登录'),
      danger: true,
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
        </svg>
      ),
      onClick: handleLogout
    }
  ]

  return (
    <nav className="bg-white/80 backdrop-blur-xl border-b border-white/40 sticky top-0 z-50 shadow-sm transition-all duration-300">
      <div className="mx-auto px-5">
        <div className={`flex justify-between items-center ${
          isExtraLargeScreen ? 'py-2.5' : isLargeScreen ? 'py-2' : 'py-1.5'
        }`}>
          {/* 左侧：Logo + 项目名 */}
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-3 hover:opacity-80 transition-opacity cursor-pointer"
          >
            <div className={`bg-gradient-to-br from-sky-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-sky-500/30 ${
              isExtraLargeScreen ? 'w-12 h-12' : isLargeScreen ? 'w-11 h-11' : 'w-10 h-10'
            }`}>
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <span className={`font-bold text-slate-800 tracking-tight ${
              isExtraLargeScreen ? 'text-2xl' : isLargeScreen ? 'text-xl' : 'text-lg'
            }`}>
              SkyTracker
            </span>
          </button>

          {/* 右侧：导航菜单 + 用户头像/登录按钮 */}
          <div className={`flex items-center ${
            isExtraLargeScreen ? 'gap-2' : isLargeScreen ? 'gap-1' : 'gap-1'
          }`}>
            {/* 自定义菜单 */}
            {visibleMenuItems.map((item) => {
              const isActive = isPathActive(item)
              const hasChildren = item.children && item.children.length > 0

              return (
                <div 
                  key={item.key} 
                  className="relative group"
                >
                  <button
                    onClick={() => handleMenuClick(item)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all font-medium ${
                      isActive
                        ? 'text-blue-700 bg-blue-500/10 border border-blue-500/20'
                        : 'text-slate-700 hover:text-black hover:bg-white/30'
                    } ${isLargeScreen || isExtraLargeScreen ? 'text-base' : 'text-sm'}`}
                  >
                    {item.icon}
                    <span>{getLabel(item)}</span>
                    {hasChildren && (
                      <svg 
                        className="w-4 h-4 transition-transform group-hover:rotate-180"
                        fill="none" 
                        stroke="currentColor" 
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    )}
                  </button>

                  {/* 子菜单下拉 */}
                  {hasChildren && (
                    <div className="absolute top-full left-0 pt-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                      <div className="bg-white/95 backdrop-blur-xl rounded-xl shadow-xl border border-white/40 py-2 min-w-[160px] overflow-hidden">
                        {item.children!.map((child) => (
                          <button
                            key={child.key}
                            onClick={() => {
                              if (child.path) {
                                navigate(child.path)
                              }
                            }}
                            className={`w-full text-left px-4 py-2 text-sm transition-colors flex items-center gap-2 ${
                              location.pathname === child.path
                                ? 'text-blue-700 bg-blue-500/10 border-l-2 border-blue-600'
                                : 'text-slate-700 hover:text-black hover:bg-white/40'
                            }`}
                          >
                            {child.icon}
                            {getLabel(child)}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )
            })}

            {/* 语言切换器 - 暂时隐藏 */}
            {/* <LanguageSwitcher /> */}

            {/* 用户头像和下拉菜单 或 登录按钮 */}
            {user ? (
              <Dropdown
                menu={{ items: userMenuItems }}
                trigger={['click']}
                placement="bottomRight"
              >
                  <div className="flex items-center gap-3 pl-4 border-l border-slate-900/10 hover:opacity-80 transition-opacity cursor-pointer">
                    <Avatar
                      src={getAvatarUrl()}
                      alt={getUserName()}
                      size={32}
                      className="ring-2 ring-blue-500/20 hover:ring-blue-400 transition-all bg-white"
                    />
                    {(isLargeScreen || isExtraLargeScreen) && (
                      <span className="text-slate-800 font-medium text-sm">{getUserName()}</span>
                    )}
                  </div>
              </Dropdown>
            ) : (
              <div className="flex items-center gap-3 pl-4 border-l border-slate-900/10">
                <button
                  onClick={() => navigate('/login')}
                  className="px-4 py-2 text-sm font-medium text-slate-700 hover:text-black transition-colors"
                >
                  {t('auth.login', '登录')}
                </button>
                <button
                  onClick={() => navigate('/register')}
                  className="px-5 py-2 text-sm font-bold text-white bg-blue-600 hover:bg-blue-500 rounded-lg transition-all shadow-md hover:shadow-lg"
                >
                  {t('auth.register', '注册')}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}

export default Navbar
