import { StateCreator } from 'zustand'

/**
 * 应用状态 Slice
 */
export interface AppSlice {
  // 侧边栏状态
  sidebarCollapsed: boolean
  setSidebarCollapsed: (collapsed: boolean) => void
  toggleSidebar: () => void

  // 主题模式
  theme: 'light' | 'dark'
  setTheme: (theme: 'light' | 'dark') => void
  toggleTheme: () => void

  // 语言设置
  language: 'zh-CN' | 'en-US'
  setLanguage: (language: 'zh-CN' | 'en-US') => void
  toggleLanguage: () => void

  // 加载状态
  loading: boolean
  setLoading: (loading: boolean) => void

  // 全局消息
  message: string | null
  messageType: 'success' | 'error' | 'info' | 'warning' | null
  setMessage: (message: string | null, type?: 'success' | 'error' | 'info' | 'warning') => void
  clearMessage: () => void
}

export const createAppSlice: StateCreator<AppSlice> = (set) => ({
  // 侧边栏
  sidebarCollapsed: false,
  setSidebarCollapsed: (collapsed) =>
    set({ sidebarCollapsed: collapsed }),
  toggleSidebar: () =>
    set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),

  // 主题
  theme: 'light',
  setTheme: (theme) => set({ theme }),
  toggleTheme: () =>
    set((state) => ({ theme: state.theme === 'light' ? 'dark' : 'light' })),

  // 语言
  language: 'zh-CN',
  setLanguage: (language) => {
    localStorage.setItem('language', language)
    set({ language })
  },
  toggleLanguage: () =>
    set((state) => {
      const newLanguage = state.language === 'zh-CN' ? 'en-US' : 'zh-CN'
      localStorage.setItem('language', newLanguage)
      return { language: newLanguage }
    }),

  // 加载
  loading: false,
  setLoading: (loading) => set({ loading }),

  // 消息
  message: null,
  messageType: null,
  setMessage: (message, type = 'info') =>
    set({ message, messageType: type }),
  clearMessage: () => set({ message: null, messageType: null }),
})
