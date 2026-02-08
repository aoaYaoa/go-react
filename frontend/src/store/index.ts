/**
 * Zustand Store 模块化配置
 * 使用 Slices 模式组织状态管理
 */
import { create } from 'zustand'
import { devtools, persist, createJSONStorage } from 'zustand/middleware'
import { createAuthSlice, type AuthSlice } from './useAuthStore'
import { createAppSlice, type AppSlice } from './useAppStore'

/**
 * 组合所有 Slices 的 Store 类型
 */
export type StoreState = AuthSlice & AppSlice

/**
 * 创建组合 Store
 * 使用 devtools 中间件支持 Redux DevTools
 * 使用 persist 中间件持久化认证状态
 */
export const useStore = create<StoreState>()(
  devtools(
    persist(
      (...a) => ({
        ...createAuthSlice(...a),
        ...createAppSlice(...a),
      }),
      {
        name: 'app-storage',
        storage: createJSONStorage(() => localStorage),
        // 只持久化认证相关状态
        partialize: (state) => ({
          user: state.user,
          token: state.token,
          isAuthenticated: state.isAuthenticated,
          theme: state.theme,
          language: state.language,
        }),
      }
    ),
    {
      name: 'AppStore',
    }
  )
)

/**
 * 选择器 Hooks - 用于性能优化
 */

import { useShallow } from 'zustand/react/shallow'

// ... (existing imports, no changes needed here but for context)

// 认证相关选择器
export const useAuth = () =>
  useStore(
    useShallow((state) => ({
      user: state.user,
      token: state.token,
      isAuthenticated: state.isAuthenticated,
      setUser: state.setUser,
      setToken: state.setToken,
      logout: state.logout,
    }))
  )

// 应用状态选择器
export const useApp = () =>
  useStore(
    useShallow((state) => ({
      sidebarCollapsed: state.sidebarCollapsed,
      setSidebarCollapsed: state.setSidebarCollapsed,
      toggleSidebar: state.toggleSidebar,
      theme: state.theme,
      setTheme: state.setTheme,
      toggleTheme: state.toggleTheme,
      language: state.language,
      setLanguage: state.setLanguage,
      toggleLanguage: state.toggleLanguage,
      loading: state.loading,
      setLoading: state.setLoading,
      message: state.message,
      messageType: state.messageType,
      setMessage: state.setMessage,
      clearMessage: state.clearMessage,
    }))
  )

// 单独导出各个 slice 的选择器
export const useUser = () => useStore((state) => state.user)
export const useTheme = () => useStore((state) => state.theme)
export const useLanguage = () => useStore((state) => state.language)
export const useLoading = () => useStore((state) => state.loading)
export const useSidebarCollapsed = () => useStore((state) => state.sidebarCollapsed)
