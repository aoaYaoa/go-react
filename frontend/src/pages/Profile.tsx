import { userService, UserInfo } from '../services/user'

/**
 * 个人资料页面
 * 显示当前登录用户的详细信息
 */
function Profile() {
  const { message } = App.useApp()
  const [user, setUser] = useState<UserInfo | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadUserProfile()
  }, [])

  const loadUserProfile = async () => {
    try {
      setLoading(true)
      const profile = await userService.getProfile()
      setUser(profile)
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '加载用户信息失败'
      message.error(errorMessage)
      
      // 如果获取失败，尝试从本地获取
      const localUser = userService.getLocalUserInfo()
      if (localUser) {
        setUser(localUser)
      }
    } finally {
      setLoading(false)
    }
  }

  const getRoleName = (role: string): string => {
    const roleMap: Record<string, string> = {
      'admin': '管理员',
      'user': '普通用户',
      'guest': '访客'
    }
    return roleMap[role] || role
  }

  const getRoleColor = (role: string): string => {
    const colorMap: Record<string, string> = {
      'admin': 'red',
      'user': 'blue',
      'guest': 'default'
    }
    return colorMap[role] || 'default'
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Spin size="large" tip="加载中..." />
      </div>
    )
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Card>
          <p className="text-gray-500">未找到用户信息</p>
        </Card>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-5 py-8">
      <Card
        title={
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center">
              <UserOutlined className="text-2xl text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold m-0">个人资料</h2>
              <p className="text-sm text-gray-500 m-0">查看和管理您的账户信息</p>
            </div>
          </div>
        }
        className="shadow-lg"
      >
        <Descriptions
          bordered
          column={1}
          labelStyle={{ width: '150px', fontWeight: '600' }}
        >
          <Descriptions.Item
            label={
              <span className="flex items-center gap-2">
                <UserOutlined />
                用户名
              </span>
            }
          >
            <span className="font-medium">{user.username}</span>
          </Descriptions.Item>

          <Descriptions.Item
            label={
              <span className="flex items-center gap-2">
                <MailOutlined />
                邮箱
              </span>
            }
          >
            {user.email || <span className="text-gray-400">未设置</span>}
          </Descriptions.Item>

          <Descriptions.Item
            label={
              <span className="flex items-center gap-2">
                <SafetyOutlined />
                角色
              </span>
            }
          >
            <Tag color={getRoleColor(user.role)}>
              {getRoleName(user.role)}
            </Tag>
          </Descriptions.Item>

          <Descriptions.Item
            label={
              <span className="flex items-center gap-2">
                <ClockCircleOutlined />
                用户 ID
              </span>
            }
          >
            <code className="px-2 py-1 bg-gray-100 rounded text-sm">
              {user.id}
            </code>
          </Descriptions.Item>
        </Descriptions>

        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <p className="text-sm text-gray-600 m-0">
            <span className="font-semibold">提示：</span>
            如需修改个人信息，请联系管理员或使用账户设置功能。
          </p>
        </div>
      </Card>
    </div>
  )
}

export default Profile
