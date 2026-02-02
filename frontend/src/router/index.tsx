import { createBrowserRouter } from 'react-router-dom'
import Home from '../pages/Home'
import Tasks from '../pages/Tasks'
import About from '../pages/About'
import AuthDemo from '../pages/AuthDemo'
import Login from '../pages/Login'
import Register from '../pages/Register'
import NotFound from '../pages/NotFound'
import ProtectedRoute from './ProtectedRoute'
import MainLayout from '../layouts/MainLayout'
import BlankLayout from '../layouts/BlankLayout'
import { MenuConfig, RouteConfig } from '../types'

/**
 * 菜单配置
 * 定义导航栏中显示的菜单项
 * 
 * 角色说明：
 * - null: 无需认证
 * - 'user': 普通用户
 * - 'admin': 管理员
 */
export const menuConfig: MenuConfig[] = [
  {
    path: '/',
    label: '首页',
    requiredRole: null,
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      </svg>
    )
  },
  {
    path: '/tasks',
    label: '任务管理',
    requiredRole: 'user',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
      </svg>
    )
  },
  {
    path: '/about',
    label: '关于',
    requiredRole: null,
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    )
  }
]

/**
 * 应用路由配置
 * 使用嵌套路由和布局组件
 *
 * 路由属性说明：
 * - path: 路由路径
 * - element: 路由组件或布局
 * - children: 子路由
 * - requiredRole: 所需角色（null 表示无需认证）
 * - meta: 路由元数据
 */
const routes: RouteConfig[] = [
  {
    element: <MainLayout />,
    children: [
      {
        path: '/',
        element: <Home />,
        requiredRole: null,
        meta: { title: '首页' }
      },
      {
        path: '/tasks',
        element: (
          <ProtectedRoute requiredRole="user">
            <Tasks />
          </ProtectedRoute>
        ),
        requiredRole: 'user',
        meta: { title: '任务管理' }
      },
      {
        path: '/about',
        element: <About />,
        requiredRole: null,
        meta: { title: '关于' }
      },
      {
        path: '/profile',
        element: (
          <ProtectedRoute requiredRole="user">
            <Home />
          </ProtectedRoute>
        ),
        requiredRole: 'user',
        meta: { title: '个人资料' }
      },
      {
        path: '*',
        element: <NotFound />,
        requiredRole: null,
        meta: { title: '页面未找到' }
      }
    ]
  },
  {
    element: <BlankLayout />,
    children: [
      {
        path: '/auth',
        element: <AuthDemo />,
        requiredRole: null,
        meta: { title: '认证演示' }
      },
      {
        path: '/login',
        element: <Login />,
        requiredRole: null,
        meta: { title: '登录' }
      },
      {
        path: '/register',
        element: <Register />,
        requiredRole: null,
        meta: { title: '注册' }
      }
    ]
  }
]

/**
 * 创建浏览器路由器
 */
export const router = createBrowserRouter(routes)

/**
 * 导出路由配置供其他地方使用
 */
export default routes
