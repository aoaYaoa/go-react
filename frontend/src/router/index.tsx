import { createBrowserRouter } from 'react-router-dom'
import Home from '../pages/Home'
import About from '../pages/About'
import AuthDemo from '../pages/AuthDemo'
import Login from '../pages/Login'
import Register from '../pages/Register'
import Profile from '../pages/Profile'
import NotFound from '../pages/NotFound'
import ApiDocs from '../pages/ApiDocs'
import MapPage from '../pages/Map'
import Flights from '../pages/Flights'
import Airports from '../pages/Airports'
import DroneMap from '../pages/drones/DroneMap'
import DroneList from '../pages/drones/DroneList'
import DroneMissions from '../pages/drones/DroneMissions'
import AnalyticsOverview from '../pages/analytics/AnalyticsOverview'
import AnalyticsRoutes from '../pages/analytics/AnalyticsRoutes'
import AnalyticsTrends from '../pages/analytics/AnalyticsTrends'
import CommunityPosts from '../pages/community/CommunityPosts'
import CommunityPhotos from '../pages/community/CommunityPhotos'
import UserManagement from '../pages/admin/UserManagement'
import RoleManagement from '../pages/admin/RoleManagement'
import MenuManagement from '../pages/admin/MenuManagement'
import AirportManagement from '../pages/admin/AirportManagement'
import AirlineManagement from '../pages/admin/AirlineManagement'
import AircraftManagement from '../pages/admin/AircraftManagement'
import DroneManagement from '../pages/admin/DroneManagement'
import OperatorManagement from '../pages/admin/OperatorManagement'
import NoFlyZoneManagement from '../pages/admin/NoFlyZoneManagement'
import SystemLogs from '../pages/admin/SystemLogs'
import ProtectedRoute from './ProtectedRoute'
import MainLayout from '../layouts/MainLayout'
import BlankLayout from '../layouts/BlankLayout'
import { MenuConfig, RouteConfig } from '../types'

import HomeIcon from '../assets/icons/home.svg?react'
import TrackingIcon from '../assets/icons/tracking.svg?react'
import MapIcon from '../assets/icons/map.svg?react'
import FlightIcon from '../assets/icons/flight.svg?react'
import AirportIcon from '../assets/icons/airport.svg?react'
import DroneIcon from '../assets/icons/drone.svg?react'
import LocationIcon from '../assets/icons/location.svg?react'
import DeviceIcon from '../assets/icons/device.svg?react'
import MissionIcon from '../assets/icons/mission.svg?react'
import AnalyticsIcon from '../assets/icons/analytics.svg?react'
import DashboardIcon from '../assets/icons/dashboard.svg?react'
import RouteIcon from '../assets/icons/route.svg?react'
import TrendIcon from '../assets/icons/trend.svg?react'
import CommunityIcon from '../assets/icons/community.svg?react'
import ChatIcon from '../assets/icons/chat.svg?react'
import PhotoIcon from '../assets/icons/photo.svg?react'
import SettingsIcon from '../assets/icons/settings.svg?react'
import CodeIcon from '../assets/icons/code.svg?react'
import InfoIcon from '../assets/icons/info.svg?react'
import UsersIcon from '../assets/icons/users.svg?react'
import ShieldIcon from '../assets/icons/shield.svg?react'
import MenuIcon from '../assets/icons/menu.svg?react'
import BuildingIcon from '../assets/icons/building.svg?react'
import BriefcaseIcon from '../assets/icons/briefcase.svg?react'
import PaperAirplaneIcon from '../assets/icons/paper-airplane.svg?react'
import ViewGridIcon from '../assets/icons/view-grid.svg?react'
import BanIcon from '../assets/icons/ban.svg?react'
import DocumentTextIcon from '../assets/icons/document-text.svg?react'

/**
 * 菜单配置
 * 定义导航栏中显示的菜单项，支持二级菜单
 * 
 * 角色说明：
 * - null: 无需认证
 * - 'user': 普通用户
 * - 'premium': 高级用户
 * - 'admin': 管理员
 */
export const menuConfig: MenuConfig[] = [
  {
    key: 'home',
    path: '/',
    label: '首页',
    requiredRole: null,
    icon: <HomeIcon className="w-4 h-4" />
  },
  {
    key: 'tracking',
    label: '实时追踪',
    requiredRole: null,
    icon: <TrackingIcon className="w-4 h-4" />,
    children: [
      {
        key: 'map',
        path: '/map',
        label: '实时地图',
        requiredRole: null,
        icon: <MapIcon className="w-3.5 h-3.5" />
      },
      {
        key: 'flights',
        path: '/flights',
        label: '航班列表',
        requiredRole: null,
        icon: <FlightIcon className="w-3.5 h-3.5" />
      },
      {
        key: 'airports',
        path: '/airports',
        label: '机场信息',
        requiredRole: null,
        icon: <AirportIcon className="w-3.5 h-3.5" />
      }
    ]
  },
  {
    key: 'drones',
    label: '无人机',
    requiredRole: 'user',
    icon: <DroneIcon className="w-4 h-4" />,
    children: [
      {
        key: 'drone-map',
        path: '/drones/map',
        label: '无人机地图',
        requiredRole: 'user',
        icon: <LocationIcon className="w-3.5 h-3.5" />
      },
      {
        key: 'drone-list',
        path: '/drones/list',
        label: '设备管理',
        requiredRole: 'user',
        icon: <DeviceIcon className="w-3.5 h-3.5" />
      },
      {
        key: 'drone-missions',
        path: '/drones/missions',
        label: '任务管理',
        requiredRole: 'user',
        icon: <MissionIcon className="w-3.5 h-3.5" />
      }
    ]
  },
  {
    key: 'analytics',
    label: '数据分析',
    requiredRole: 'premium',
    icon: <AnalyticsIcon className="w-4 h-4" />,
    children: [
      {
        key: 'analytics-overview',
        path: '/analytics/overview',
        label: '数据总览',
        requiredRole: 'premium',
        icon: <DashboardIcon className="w-3.5 h-3.5" />
      },
      {
        key: 'analytics-routes',
        path: '/analytics/routes',
        label: '航线分析',
        requiredRole: 'premium',
        icon: <RouteIcon className="w-3.5 h-3.5" />
      },
      {
        key: 'analytics-trends',
        path: '/analytics/trends',
        label: '趋势分析',
        requiredRole: 'premium',
        icon: <TrendIcon className="w-3.5 h-3.5" />
      }
    ]
  },
  {
    key: 'community',
    label: '社区',
    requiredRole: 'user',
    icon: <CommunityIcon className="w-4 h-4" />,
    children: [
      {
        key: 'community-posts',
        path: '/community/posts',
        label: '飞行分享',
        requiredRole: 'user',
        icon: <ChatIcon className="w-3.5 h-3.5" />
      },
      {
        key: 'community-photos',
        path: '/community/photos',
        label: '照片库',
        requiredRole: 'user',
        icon: <PhotoIcon className="w-3.5 h-3.5" />
      }
    ]
  },
  {
    key: 'system',
    label: '系统',
    requiredRole: null,
    icon: <SettingsIcon className="w-4 h-4" />,
    children: [
      {
        key: 'admin-users',
        path: '/admin/users',
        label: '用户管理',
        requiredRole: null,
        icon: <UsersIcon className="w-3.5 h-3.5" />
      },
      {
        key: 'admin-roles',
        path: '/admin/roles',
        label: '角色管理',
        requiredRole: null,
        icon: <ShieldIcon className="w-3.5 h-3.5" />
      },
      {
        key: 'admin-menus',
        path: '/admin/menus',
        label: '菜单管理',
        requiredRole: null,
        icon: <MenuIcon className="w-3.5 h-3.5" />
      },
      {
        key: 'admin-airports',
        path: '/admin/airports',
        label: '机场管理',
        requiredRole: null,
        icon: <BuildingIcon className="w-3.5 h-3.5" />
      },
      {
        key: 'admin-airlines',
        path: '/admin/airlines',
        label: '航空公司管理',
        requiredRole: null,
        icon: <BriefcaseIcon className="w-3.5 h-3.5" />
      },
      {
        key: 'admin-aircraft',
        path: '/admin/aircraft',
        label: '飞机管理',
        requiredRole: null,
        icon: <PaperAirplaneIcon className="w-3.5 h-3.5" />
      },
      {
        key: 'admin-drones',
        path: '/admin/drones',
        label: '无人机管理',
        requiredRole: null,
        icon: <ViewGridIcon className="w-3.5 h-3.5" />
      },
      {
        key: 'admin-operators',
        path: '/admin/operators',
        label: '运营商管理',
        requiredRole: null,
        icon: <BuildingIcon className="w-3.5 h-3.5" />
      },
      {
        key: 'admin-no-fly-zones',
        path: '/admin/no-fly-zones',
        label: '禁飞区管理',
        requiredRole: null,
        icon: <BanIcon className="w-3.5 h-3.5" />
      },
      {
        key: 'admin-logs',
        path: '/admin/logs',
        label: '系统日志',
        requiredRole: null,
        icon: <DocumentTextIcon className="w-3.5 h-3.5" />
      },
      {
        key: 'api-docs',
        path: '/system/api-docs',
        label: 'API 文档',
        requiredRole: 'admin',
        icon: <CodeIcon className="w-3.5 h-3.5" />
      }
    ]
  },
  {
    key: 'about',
    path: '/about',
    label: '关于',
    requiredRole: null,
    icon: <InfoIcon className="w-4 h-4" />
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
        path: '/map',
        element: <MapPage />,
        requiredRole: null,
        meta: { title: '实时地图' }
      },
      {
        path: '/flights',
        element: <Flights />,
        requiredRole: null,
        meta: { title: '航班列表' }
      },
      {
        path: '/airports',
        element: <Airports />,
        requiredRole: null,
        meta: { title: '机场信息' }
      },
      {
        path: '/drones/map',
        element: (
          <ProtectedRoute requiredRole="user">
            <DroneMap />
          </ProtectedRoute>
        ),
        requiredRole: 'user',
        meta: { title: '无人机地图' }
      },
      {
        path: '/drones/list',
        element: (
          <ProtectedRoute requiredRole="user">
            <DroneList />
          </ProtectedRoute>
        ),
        requiredRole: 'user',
        meta: { title: '设备管理' }
      },
      {
        path: '/drones/missions',
        element: (
          <ProtectedRoute requiredRole="user">
            <DroneMissions />
          </ProtectedRoute>
        ),
        requiredRole: 'user',
        meta: { title: '任务管理' }
      },
      {
        path: '/analytics/overview',
        element: (
          <ProtectedRoute requiredRole="premium">
            <AnalyticsOverview />
          </ProtectedRoute>
        ),
        requiredRole: 'premium',
        meta: { title: '数据总览' }
      },
      {
        path: '/analytics/routes',
        element: (
          <ProtectedRoute requiredRole="premium">
            <AnalyticsRoutes />
          </ProtectedRoute>
        ),
        requiredRole: 'premium',
        meta: { title: '航线分析' }
      },
      {
        path: '/analytics/trends',
        element: (
          <ProtectedRoute requiredRole="premium">
            <AnalyticsTrends />
          </ProtectedRoute>
        ),
        requiredRole: 'premium',
        meta: { title: '趋势分析' }
      },
      {
        path: '/community/posts',
        element: (
          <ProtectedRoute requiredRole="user">
            <CommunityPosts />
          </ProtectedRoute>
        ),
        requiredRole: 'user',
        meta: { title: '飞行分享' }
      },
      {
        path: '/community/photos',
        element: (
          <ProtectedRoute requiredRole="user">
            <CommunityPhotos />
          </ProtectedRoute>
        ),
        requiredRole: 'user',
        meta: { title: '照片库' }
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
            <Profile />
          </ProtectedRoute>
        ),
        requiredRole: 'user',
        meta: { title: '个人资料' }
      },
      {
        path: '/system/api-docs',
        element: (
          <ProtectedRoute requiredRole="user">
            <ApiDocs />
          </ProtectedRoute>
        ),
        requiredRole: 'user',
        meta: { title: '接口文档' }
      },
      {
        path: '/admin/users',
        element: <UserManagement />,
        requiredRole: null,
        meta: { title: '用户管理' }
      },
      {
        path: '/admin/roles',
        element: <RoleManagement />,
        requiredRole: null,
        meta: { title: '角色管理' }
      },
      {
        path: '/admin/menus',
        element: <MenuManagement />,
        requiredRole: null,
        meta: { title: '菜单管理' }
      },
      {
        path: '/admin/airports',
        element: <AirportManagement />,
        requiredRole: null,
        meta: { title: '机场管理' }
      },
      {
        path: '/admin/airlines',
        element: <AirlineManagement />,
        requiredRole: null,
        meta: { title: '航空公司管理' }
      },
      {
        path: '/admin/aircraft',
        element: <AircraftManagement />,
        requiredRole: null,
        meta: { title: '飞机管理' }
      },
      {
        path: '/admin/drones',
        element: <DroneManagement />,
        requiredRole: null,
        meta: { title: '无人机管理' }
      },
      {
        path: '/admin/operators',
        element: <OperatorManagement />,
        requiredRole: null,
        meta: { title: '运营商管理' }
      },
      {
        path: '/admin/no-fly-zones',
        element: <NoFlyZoneManagement />,
        requiredRole: null,
        meta: { title: '禁飞区管理' }
      },
      {
        path: '/admin/logs',
        element: <SystemLogs />,
        requiredRole: null,
        meta: { title: '系统日志' }
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
