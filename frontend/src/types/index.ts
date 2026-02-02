/**
 * 全局类型定义
 */

import { ReactNode } from 'react'

// 用户类型（后端返回的用户信息）
export interface User {
  id: number
  username: string
  email?: string
  role: string
  created_at?: number
  updated_at?: number
}

// API 响应类型
export interface ApiResponse<T = any> {
  code?: number
  success?: boolean
  message?: string
  error?: string
  data?: T
}

// 任务类型
export interface Task {
  id: string
  title: string
  description?: string
  completed: boolean
  createdAt: string
  updatedAt: string
}

// 菜单配置类型
export interface MenuConfig {
  path: string
  label: string
  icon?: ReactNode
  requiredRole: string | null
}

// 路由配置类型
export interface RouteConfig {
  path?: string
  element: ReactNode
  children?: RouteConfig[]
  requiredRole?: string | null
  meta?: {
    title?: string
  }
}

// 屏幕尺寸上下文类型
export interface ScreenSizeContextType {
  isLargeScreen: boolean
  isExtraLargeScreen: boolean
}

// 表单值类型（在各自组件中定义，这里保留作为参考）
// LoginFormValues 和 RegisterFormValues 已在各自页面组件中定义

// 加密数据类型
export interface EncryptedData {
  encrypted: boolean
  data: string
}

// 请求选项类型
export interface RequestOptions extends RequestInit {
  headers?: Record<string, string>
}
