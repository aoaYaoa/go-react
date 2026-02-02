import { useState, useEffect } from 'react'
import { userService } from '../services/user'
import type { UserInfo } from '../services/user'

/**
 * 认证示例组件
 * 演示用户认证功能
 * 使用后端 JWT 认证
 */
const AuthDemo = () => {
  const [user, setUser] = useState<UserInfo | null>(null)
  const [loading, setLoading] = useState(true)
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [message, setMessage] = useState('')
  const [messageType, setMessageType] = useState('info') // 'success' | 'error' | 'info'

  // 检查登录状态
  useEffect(() => {
    const checkAuth = async () => {
      try {
        if (userService.isAuthenticated()) {
          const userInfo = userService.getLocalUserInfo()
          setUser(userInfo)
        }
      } catch (error) {
        console.error('检查认证状态失败:', error)
      } finally {
        setLoading(false)
      }
    }
    checkAuth()
  }, [])

  const showMessage = (msg: string, type = 'info') => {
    setMessage(msg)
    setMessageType(type)
    setTimeout(() => setMessage(''), 5000)
  }

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!username || !password) {
      showMessage('请输入用户名和密码', 'error')
      return
    }
    
    try {
      const result = await userService.register({
        username,
        email: email || undefined,
        password,
      })
      showMessage('注册成功！', 'success')
      console.log('注册成功:', result)
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '注册失败'
      showMessage(errorMessage, 'error')
    }
  }

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!username || !password) {
      showMessage('请输入用户名和密码', 'error')
      return
    }
    
    try {
      const result = await userService.login({
        username,
        password,
      })
      showMessage('登录成功！', 'success')
      setUser(result.user)
      console.log('登录成功:', result.user)
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '登录失败'
      showMessage(errorMessage, 'error')
    }
  }

  const handleSignOut = async () => {
    try {
      await userService.logout()
      showMessage('已安全退出', 'success')
      setUser(null)
      setUsername('')
      setEmail('')
      setPassword('')
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '退出失败'
      showMessage(errorMessage, 'error')
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-gray-600">加载中...</div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-2">用户认证</h1>
      <p className="text-gray-600 mb-6">使用后端 API 进行用户认证管理</p>

      {/* 消息提示 */}
      {message && (
        <div className={`p-4 mb-6 rounded-lg ${
          messageType === 'success' ? 'bg-green-50 text-green-700 border border-green-200' :
          messageType === 'error' ? 'bg-red-50 text-red-700 border border-red-200' :
          'bg-blue-50 text-blue-700 border border-blue-200'
        }`}>
          {message}
        </div>
      )}

      {user ? (
        /* 已登录状态 */
        <div className="bg-white shadow-md rounded-lg p-6">
          <h2 className="text-2xl font-semibold mb-4">欢迎回来！</h2>
          
          <div className="space-y-3 mb-6">
            <div className="flex items-center gap-2">
              <span className="font-medium text-gray-700">用户名：</span>
              <span className="text-gray-900">{user.username}</span>
            </div>
            {user.email && (
              <div className="flex items-center gap-2">
                <span className="font-medium text-gray-700">邮箱：</span>
                <span className="text-gray-900">{user.email}</span>
              </div>
            )}
            <div className="flex items-center gap-2">
              <span className="font-medium text-gray-700">角色：</span>
              <span className="text-gray-900">{user.role}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-medium text-gray-700">用户ID：</span>
              <span className="text-gray-500 text-sm font-mono">{user.id}</span>
            </div>
          </div>
          
          <button
            onClick={handleSignOut}
            className="bg-red-500 text-white px-6 py-2 rounded-lg hover:bg-red-600 transition-colors"
          >
            退出登录
          </button>

          {/* 提示信息 */}
          <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <p className="text-sm text-blue-800">
              💡 <strong>提示：</strong>所有数据操作通过后端 API 进行。
            </p>
          </div>
        </div>
      ) : (
        /* 未登录状态 */
        <div className="max-w-md mx-auto">
          {/* 用户名密码登录/注册 */}
          <div className="bg-white shadow-md rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">用户登录 / 注册</h2>
            <form className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  用户名
                </label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="请输入用户名（3-20个字符）"
                  autoComplete="username"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  邮箱地址（可选）
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="your@email.com（可选）"
                  autoComplete="email"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  密码
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="至少 6 个字符"
                  autoComplete="current-password"
                />
              </div>
              
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={handleSignIn}
                  className="flex-1 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors font-medium"
                >
                  登录
                </button>
                <button
                  type="button"
                  onClick={handleSignUp}
                  className="flex-1 bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors font-medium"
                >
                  注册
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 使用说明 */}
      <div className="mt-8 bg-gray-50 rounded-lg p-6 border border-gray-200">
        <h3 className="text-lg font-semibold mb-3">📖 架构说明</h3>
        <div className="space-y-2 text-sm text-gray-700">
          <div className="flex items-start gap-2">
            <span className="text-blue-500 font-bold">•</span>
            <p><strong>前端：</strong>React 19 + TypeScript + Vite</p>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-blue-500 font-bold">•</span>
            <p><strong>后端：</strong>Go + Gin 处理所有业务逻辑和数据操作</p>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-blue-500 font-bold">•</span>
            <p><strong>数据库：</strong>PostgreSQL（通过 Go 后端访问）</p>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-blue-500 font-bold">•</span>
            <p><strong>认证：</strong>JWT Token 认证</p>
          </div>
        </div>

        <div className="mt-4 p-3 bg-white rounded border border-gray-200">
          <p className="text-sm font-mono text-gray-600">
            前端 (React) → Go 后端 API (JWT) → PostgreSQL
          </p>
        </div>
      </div>
    </div>
  )
}

export default AuthDemo
