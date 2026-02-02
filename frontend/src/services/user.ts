import { fetchWithInterceptor, getErrorMessage, isSuccessResponse, extractError } from '../utils/request'
import { ApiResponse } from '../types'

const API_BASE_URL = '/api'

/**
 * 注册请求参数
 */
export interface RegisterRequest {
  username: string
  email?: string
  password: string
}

/**
 * 登录请求参数
 */
export interface LoginRequest {
  username: string
  password: string
}

/**
 * 用户信息
 */
export interface UserInfo {
  id: number
  username: string
  email?: string
  role: string
}

/**
 * 注册响应
 */
export interface RegisterResponse {
  id: number
  username: string
  email?: string
  role: string
}

/**
 * 登录响应
 */
export interface LoginResponse {
  user: UserInfo
  token: string
  token_type: string
  expires_in: number
}

/**
 * 用户服务
 */
export const userService = {
  /**
   * 用户注册
   * @param data 注册信息
   * @returns 注册结果
   */
  register: async (data: RegisterRequest): Promise<RegisterResponse> => {
    try {
      // 清理数据：只包含非空字段
      const cleanData: any = {
        username: data.username,
        password: data.password,
      }
      
      // 只有当 email 有值且不为空时才添加
      if (data.email && data.email.trim()) {
        cleanData.email = data.email.trim()
      }
      // 注意：不添加 email 字段，而不是设置为 undefined 或空字符串
      
      const response = await fetchWithInterceptor(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        body: JSON.stringify(cleanData),
      })
      const result: ApiResponse<RegisterResponse> = await response.json()
      
      if (!isSuccessResponse(result)) {
        throw new Error(extractError(result))
      }
      
      return result.data!
    } catch (error) {
      throw new Error(getErrorMessage(error))
    }
  },

  /**
   * 用户登录
   * @param data 登录信息
   * @returns 登录结果（包含 token）
   */
  login: async (data: LoginRequest): Promise<LoginResponse> => {
    try {
      const response = await fetchWithInterceptor(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        body: JSON.stringify(data),
      })
      const result: ApiResponse<LoginResponse> = await response.json()
      
      if (!isSuccessResponse(result)) {
        throw new Error(extractError(result))
      }
      
      // 保存 token 到 localStorage
      if (result.data?.token) {
        localStorage.setItem('auth_token', result.data.token)
        localStorage.setItem('user_info', JSON.stringify(result.data.user))
      }
      
      return result.data!
    } catch (error) {
      throw new Error(getErrorMessage(error))
    }
  },

  /**
   * 用户登出
   */
  logout: async (): Promise<void> => {
    try {
      // 清除本地存储
      localStorage.removeItem('auth_token')
      localStorage.removeItem('user_info')
      
      // 可选：调用后端登出接口
      // await fetchWithInterceptor(`${API_BASE_URL}/auth/logout`, {
      //   method: 'POST',
      // })
    } catch (error) {
      console.error('登出失败:', error)
      // 即使失败也清除本地数据
      localStorage.removeItem('auth_token')
      localStorage.removeItem('user_info')
    }
  },

  /**
   * 获取当前用户信息
   * @returns 用户信息
   */
  getProfile: async (): Promise<UserInfo> => {
    try {
      const token = localStorage.getItem('auth_token')
      if (!token) {
        throw new Error('未登录')
      }

      const response = await fetchWithInterceptor(`${API_BASE_URL}/user/profile`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })
      const result: ApiResponse<UserInfo> = await response.json()
      
      if (!isSuccessResponse(result)) {
        throw new Error(extractError(result))
      }
      
      // 更新本地存储的用户信息
      if (result.data) {
        localStorage.setItem('user_info', JSON.stringify(result.data))
      }
      
      return result.data!
    } catch (error) {
      throw new Error(getErrorMessage(error))
    }
  },

  /**
   * 获取本地存储的 token
   * @returns token 字符串或 null
   */
  getToken: (): string | null => {
    return localStorage.getItem('auth_token')
  },

  /**
   * 获取本地存储的用户信息
   * @returns 用户信息或 null
   */
  getLocalUserInfo: (): UserInfo | null => {
    const userInfoStr = localStorage.getItem('user_info')
    if (!userInfoStr) {
      return null
    }
    try {
      return JSON.parse(userInfoStr)
    } catch (error) {
      console.error('解析用户信息失败:', error)
      return null
    }
  },

  /**
   * 检查是否已登录
   * @returns 是否已登录
   */
  isAuthenticated: (): boolean => {
    const token = localStorage.getItem('auth_token')
    return !!token
  },

  /**
   * 列出所有用户（管理员功能）
   * @returns 用户列表
   */
  listUsers: async (): Promise<UserInfo[]> => {
    try {
      const token = localStorage.getItem('auth_token')
      if (!token) {
        throw new Error('未登录')
      }

      const response = await fetchWithInterceptor(`${API_BASE_URL}/admin/users`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })
      const result: ApiResponse<UserInfo[]> = await response.json()
      
      if (!isSuccessResponse(result)) {
        throw new Error(extractError(result))
      }
      
      return result.data || []
    } catch (error) {
      throw new Error(getErrorMessage(error))
    }
  },
}

export default userService
