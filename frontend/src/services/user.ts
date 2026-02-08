import { fetchWithInterceptor, getErrorMessage, isSuccessResponse, extractError } from '../utils/request'
import { setCookie, getCookie, deleteCookie, hasCookie } from '../utils/cookie'
import { ApiResponse } from '../types'

const API_BASE_URL = '/api'
const TOKEN_COOKIE_NAME = 'auth_token'
const USER_INFO_COOKIE_NAME = 'user_info'
const ROLES_COOKIE_NAME = 'user_roles'
const MENUS_COOKIE_NAME = 'user_menus'
const TOKEN_EXPIRES_DAYS = 7 // Token 过期时间：7天

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
  captcha_id: string
  captcha_code: string
}

/**
 * 验证码响应
 */
export interface CaptchaResponse {
  captcha_id: string
  captcha_image: string
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
  roles: Role[]
  menus: Menu[]
}

// 导入类型
import type { Role, Menu } from '../types'

/**
 * 用户服务
 */
export const userService = {
  /**
   * 获取验证码
   * @returns 验证码信息
   */
  getCaptcha: async (): Promise<CaptchaResponse> => {
    try {
      const response = await fetchWithInterceptor(`${API_BASE_URL}/auth/captcha`, {
        method: 'GET',
      })
      const result: ApiResponse<CaptchaResponse> = await response.json()
      
      if (!isSuccessResponse(result)) {
        throw new Error(extractError(result))
      }
      
      return result.data!
    } catch (error) {
      throw new Error(getErrorMessage(error))
    }
  },

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
      
      // 保存 token、用户信息、角色和菜单到 Cookie（7天过期）
      if (result.data?.token) {
        setCookie(TOKEN_COOKIE_NAME, result.data.token, TOKEN_EXPIRES_DAYS)
        setCookie(USER_INFO_COOKIE_NAME, JSON.stringify(result.data.user), TOKEN_EXPIRES_DAYS)
        setCookie(ROLES_COOKIE_NAME, JSON.stringify(result.data.roles || []), TOKEN_EXPIRES_DAYS)
        setCookie(MENUS_COOKIE_NAME, JSON.stringify(result.data.menus || []), TOKEN_EXPIRES_DAYS)
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
      // 清除 Cookie
      deleteCookie(TOKEN_COOKIE_NAME)
      deleteCookie(USER_INFO_COOKIE_NAME)
      deleteCookie(ROLES_COOKIE_NAME)
      deleteCookie(MENUS_COOKIE_NAME)
      
      // 可选：调用后端登出接口
      // await fetchWithInterceptor(`${API_BASE_URL}/auth/logout`, {
      //   method: 'POST',
      // })
    } catch (error) {
      console.error('登出失败:', error)
      // 即使失败也清除 Cookie
      deleteCookie(TOKEN_COOKIE_NAME)
      deleteCookie(USER_INFO_COOKIE_NAME)
      deleteCookie(ROLES_COOKIE_NAME)
      deleteCookie(MENUS_COOKIE_NAME)
    }
  },

  /**
   * 获取当前用户信息
   * @returns 用户信息
   */
  getProfile: async (): Promise<UserInfo> => {
    try {
      const token = getCookie(TOKEN_COOKIE_NAME)
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
      
      // 更新 Cookie 中的用户信息
      if (result.data) {
        setCookie(USER_INFO_COOKIE_NAME, JSON.stringify(result.data), TOKEN_EXPIRES_DAYS)
      }
      
      return result.data!
    } catch (error) {
      throw new Error(getErrorMessage(error))
    }
  },

  /**
   * 获取 Cookie 中的 token
   * @returns token 字符串或 null
   */
  getToken: (): string | null => {
    return getCookie(TOKEN_COOKIE_NAME)
  },

  /**
   * 获取 Cookie 中的用户信息
   * @returns 用户信息或 null
   */
  getLocalUserInfo: (): UserInfo | null => {
    const userInfoStr = getCookie(USER_INFO_COOKIE_NAME)
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
   * 获取 Cookie 中的角色列表
   * @returns 角色列表或空数组
   */
  getLocalRoles: (): Role[] => {
    const rolesStr = getCookie(ROLES_COOKIE_NAME)
    if (!rolesStr) {
      return []
    }
    try {
      return JSON.parse(rolesStr)
    } catch (error) {
      console.error('解析角色列表失败:', error)
      return []
    }
  },

  /**
   * 获取 Cookie 中的菜单列表
   * @returns 菜单列表或空数组
   */
  getLocalMenus: (): Menu[] => {
    const menusStr = getCookie(MENUS_COOKIE_NAME)
    if (!menusStr) {
      return []
    }
    try {
      return JSON.parse(menusStr)
    } catch (error) {
      console.error('解析菜单列表失败:', error)
      return []
    }
  },

  /**
   * 检查是否已登录
   * @returns 是否已登录
   */
  isAuthenticated: (): boolean => {
    return hasCookie(TOKEN_COOKIE_NAME)
  },

  /**
   * 列出所有用户（管理员功能）
   * @returns 用户列表
   */
  listUsers: async (): Promise<UserInfo[]> => {
    try {
      const token = getCookie(TOKEN_COOKIE_NAME)
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
  /**
   * 创建用户（管理员功能）
   * @param data 用户数据
   * @returns 创建的用户信息
   */
  createUser: async (data: any): Promise<UserInfo> => {
    try {
      const token = getCookie(TOKEN_COOKIE_NAME)
      if (!token) {
        throw new Error('未登录')
      }

      const response = await fetchWithInterceptor(`${API_BASE_URL}/admin/users`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      })
      const result: ApiResponse<UserInfo> = await response.json()
      
      if (!isSuccessResponse(result)) {
        throw new Error(extractError(result))
      }
      
      return result.data!
    } catch (error) {
      throw new Error(getErrorMessage(error))
    }
  },

  /**
   * 更新用户（管理员功能）
   * @param id 用户ID
   * @param data 更新的数据
   * @returns 更新后的用户信息
   */
  updateUser: async (id: number | string, data: any): Promise<UserInfo> => {
    try {
      const token = getCookie(TOKEN_COOKIE_NAME)
      if (!token) {
        throw new Error('未登录')
      }

      const response = await fetchWithInterceptor(`${API_BASE_URL}/admin/users/${id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      })
      const result: ApiResponse<UserInfo> = await response.json()
      
      if (!isSuccessResponse(result)) {
        throw new Error(extractError(result))
      }
      
      return result.data!
    } catch (error) {
      throw new Error(getErrorMessage(error))
    }
  },

  /**
   * 删除用户（管理员功能）
   * @param id 用户ID
   */
  deleteUser: async (id: number | string): Promise<void> => {
    try {
      const token = getCookie(TOKEN_COOKIE_NAME)
      if (!token) {
        throw new Error('未登录')
      }

      const response = await fetchWithInterceptor(`${API_BASE_URL}/admin/users/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })
      const result: ApiResponse<void> = await response.json()
      
      if (!isSuccessResponse(result)) {
        throw new Error(extractError(result))
      }
    } catch (error) {
      throw new Error(getErrorMessage(error))
    }
  },
}

export default userService
