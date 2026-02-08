# Zustand Store 使用指南

本项目使用 Zustand 进行状态管理，采用模块化（Slices）架构。

## 架构说明

### 模块化结构

```
store/
├── index.ts           # 主 Store 和选择器导出
├── useAuthStore.ts    # 认证状态 Slice
├── useAppStore.ts     # 应用状态 Slice
└── README.md          # 使用文档
```

### 特性

- **模块化 Slices**: 每个功能模块独立管理
- **持久化**: 认证和主题状态自动保存到 localStorage
- **DevTools 支持**: 集成 Redux DevTools 用于调试
- **性能优化**: 提供选择器 Hooks 避免不必要的重渲染
- **TypeScript**: 完整的类型支持

## 使用方式

### 1. 使用完整 Store

```typescript
import { useStore } from '@/store'

function MyComponent() {
  const user = useStore((state) => state.user)
  const setUser = useStore((state) => state.setUser)
  const theme = useStore((state) => state.theme)
  
  // 使用状态...
}
```

### 2. 使用模块选择器（推荐）

```typescript
import { useAuth, useApp } from '@/store'

function MyComponent() {
  // 认证相关
  const { user, isAuthenticated, setUser, logout } = useAuth()
  
  // 应用状态相关
  const { theme, toggleTheme, loading, setLoading } = useApp()
  
  // 使用状态...
}
```

### 3. 使用单独选择器（最优性能）

```typescript
import { useUser, useTheme, useLoading } from '@/store'

function MyComponent() {
  // 只订阅需要的状态，避免不必要的重渲染
  const user = useUser()
  const theme = useTheme()
  const loading = useLoading()
  
  // 使用状态...
}
```

## 状态模块

### AuthSlice - 认证状态

管理用户认证相关状态：

```typescript
interface AuthSlice {
  user: UserInfo | null
  token: string | null
  isAuthenticated: boolean
  setUser: (user: UserInfo | null) => void
  setToken: (token: string | null) => void
  logout: () => void
}
```

**使用示例：**

```typescript
import { useAuth } from '@/store'

function LoginPage() {
  const { setUser, setToken } = useAuth()
  
  const handleLogin = async (credentials) => {
    const { user, token } = await loginAPI(credentials)
    setUser(user)
    setToken(token)
  }
  
  return <LoginForm onSubmit={handleLogin} />
}
```

### AppSlice - 应用状态

管理应用全局 UI 状态：

```typescript
interface AppSlice {
  // 侧边栏
  sidebarCollapsed: boolean
  setSidebarCollapsed: (collapsed: boolean) => void
  toggleSidebar: () => void
  
  // 主题
  theme: 'light' | 'dark'
  setTheme: (theme: 'light' | 'dark') => void
  toggleTheme: () => void
  
  // 加载状态
  loading: boolean
  setLoading: (loading: boolean) => void
  
  // 全局消息
  message: string | null
  messageType: 'success' | 'error' | 'info' | 'warning' | null
  setMessage: (message: string | null, type?: MessageType) => void
  clearMessage: () => void
}
```

**使用示例：**

```typescript
import { useApp } from '@/store'

function Sidebar() {
  const { sidebarCollapsed, toggleSidebar } = useApp()
  
  return (
    <aside className={sidebarCollapsed ? 'collapsed' : ''}>
      <button onClick={toggleSidebar}>切换</button>
    </aside>
  )
}

function ThemeToggle() {
  const { theme, toggleTheme } = useApp()
  
  return (
    <button onClick={toggleTheme}>
      当前主题: {theme}
    </button>
  )
}
```

## 添加新的 Slice

### 1. 创建 Slice 文件

```typescript
// store/useFeatureStore.ts
export interface FeatureSlice {
  data: any[]
  loading: boolean
  fetchData: () => Promise<void>
}

export const createFeatureSlice = (set: any): FeatureSlice => ({
  data: [],
  loading: false,
  
  fetchData: async () => {
    set({ loading: true }, false, 'feature/fetchData/start')
    try {
      const data = await api.fetchData()
      set({ data, loading: false }, false, 'feature/fetchData/success')
    } catch (error) {
      set({ loading: false }, false, 'feature/fetchData/error')
    }
  },
})
```

### 2. 集成到主 Store

```typescript
// store/index.ts
import { createFeatureSlice, type FeatureSlice } from './useFeatureStore'

export type StoreState = AuthSlice & AppSlice & FeatureSlice

export const useStore = create<StoreState>()(
  devtools(
    persist(
      (...a) => ({
        ...createAuthSlice(...a),
        ...createAppSlice(...a),
        ...createFeatureSlice(...a),
      }),
      {
        name: 'app-storage',
        partialize: (state) => ({
          // 添加需要持久化的状态
          user: state.user,
          token: state.token,
          theme: state.theme,
        }),
      }
    )
  )
)

// 添加选择器
export const useFeature = () =>
  useStore((state) => ({
    data: state.data,
    loading: state.loading,
    fetchData: state.fetchData,
  }))
```

## 最佳实践

### 1. 使用选择器避免重渲染

```typescript
// 不推荐 - 会在任何状态变化时重渲染
const store = useStore()

// 推荐 - 只在 user 变化时重渲染
const user = useStore((state) => state.user)

// 最推荐 - 使用预定义选择器
const user = useUser()
```

### 2. 批量更新状态

```typescript
// 不推荐 - 多次触发渲染
setUser(user)
setToken(token)
setLoading(false)

// 推荐 - 一次性更新
useStore.setState({
  user,
  token,
  loading: false,
})
```

### 3. 异步操作

```typescript
export const createAuthSlice = (set: any): AuthSlice => ({
  // ...
  
  login: async (credentials) => {
    set({ loading: true }, false, 'auth/login/start')
    
    try {
      const { user, token } = await loginAPI(credentials)
      set(
        { user, token, isAuthenticated: true, loading: false },
        false,
        'auth/login/success'
      )
    } catch (error) {
      set({ loading: false }, false, 'auth/login/error')
      throw error
    }
  },
})
```

### 4. 在组件外使用 Store

```typescript
// utils/auth.ts
import { useStore } from '@/store'

export function checkAuth() {
  const { isAuthenticated } = useStore.getState()
  return isAuthenticated
}

export function logout() {
  useStore.getState().logout()
}
```

## 调试

### 使用 Redux DevTools

1. 安装 Redux DevTools 浏览器扩展
2. 打开开发者工具
3. 切换到 Redux 标签
4. 查看状态变化和 action 历史

### Action 命名规范

```typescript
set({ data }, false, 'module/action/status')
// 例如：
// 'auth/login/start'
// 'auth/login/success'
// 'auth/login/error'
// 'app/toggleSidebar'
```

## 性能优化

### 1. 使用浅比较

```typescript
import { shallow } from 'zustand/shallow'

const { user, theme } = useStore(
  (state) => ({ user: state.user, theme: state.theme }),
  shallow
)
```

### 2. 拆分大型 Slice

如果一个 Slice 过大，考虑拆分为多个小 Slice：

```typescript
// 不推荐 - 单个大 Slice
createUserSlice() // 包含 profile, settings, preferences...

// 推荐 - 拆分为多个小 Slice
createUserProfileSlice()
createUserSettingsSlice()
createUserPreferencesSlice()
```

### 3. 避免在 Slice 中存储派生状态

```typescript
// 不推荐
interface AppSlice {
  users: User[]
  activeUsers: User[] // 派生状态
}

// 推荐 - 使用选择器计算
export const useActiveUsers = () =>
  useStore((state) => state.users.filter(u => u.active))
```

## 迁移指南

### 从 Context API 迁移

```typescript
// 之前 - Context API
const { user, setUser } = useContext(AuthContext)

// 之后 - Zustand
const { user, setUser } = useAuth()
```

### 从 Redux 迁移

```typescript
// 之前 - Redux
const user = useSelector(state => state.auth.user)
const dispatch = useDispatch()
dispatch(loginAction(credentials))

// 之后 - Zustand
const { user, login } = useAuth()
await login(credentials)
```
