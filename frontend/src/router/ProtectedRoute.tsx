import { Navigate } from 'react-router-dom'
import { ReactNode } from 'react'
import { userService } from '../services/user'

interface ProtectedRouteProps {
  children: ReactNode
  requiredRole?: string | string[] | null
}

/**
 * 受保护的路由组件
 * 基于角色进行权限检查
 * 使用 JWT Token 认证
 */
function ProtectedRoute({ children, requiredRole = null }: ProtectedRouteProps) {
  // 如果不需要角色，直接返回
  if (requiredRole === null) {
    return children
  }

  // 检查是否已登录
  const isAuthenticated = userService.isAuthenticated()
  
  // 未认证，重定向到登录页面
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  // 获取用户信息
  const user = userService.getLocalUserInfo()
  
  // 如果没有用户信息，重定向到登录页
  if (!user) {
    return <Navigate to="/login" replace />
  }

  // 获取用户角色
  const userRole = user.role || 'user'

  // 检查角色权限
  // 支持多个角色：['user', 'admin']
  const allowedRoles = Array.isArray(requiredRole) ? requiredRole : [requiredRole]
  if (!allowedRoles.includes(userRole)) {
    return <Navigate to="/" replace />
  }

  return children
}

export default ProtectedRoute
