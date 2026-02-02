import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { UserOutlined, LockOutlined } from '@ant-design/icons'
import { userService } from '../services/user'

/**
 * 登录表单值
 */
interface LoginFormValues {
  username: string
  password: string
}

/**
 * 登录页面
 * 使用 Ant Design 组件和后端 JWT 认证
 *
 * @returns {React.ReactNode} 登录页面
 */
function Login() {
  const navigate = useNavigate()
  const [form] = Form.useForm<LoginFormValues>()
  const [loading, setLoading] = useState<boolean>(false)

  /**
   * 处理登录提交
   */
  const handleSubmit = async (values: LoginFormValues) => {
    setLoading(true)

    try {
      const result = await userService.login({
        username: values.username,
        password: values.password,
      })
      
      message.success('登录成功！')
      console.log('登录成功:', result.user)
      
      // 跳转到首页
      setTimeout(() => {
        navigate('/')
      }, 500)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '登录失败，请稍后重试'
      message.error(errorMessage)
      console.error('登录错误:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div 
      className="min-h-screen w-screen flex items-center justify-center"
      style={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        margin: 0,
        padding: '2rem 0'
      }}
    >
      <div className="w-full max-w-md mx-4">
        <Card 
          style={{
            borderRadius: '16px',
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)'
          }}
        >
          <div className="text-center mb-4">
            <div className="w-14 h-14 mx-auto mb-2 rounded-full flex items-center justify-center" style={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
            }}>
              <UserOutlined className="text-2xl text-white" />
            </div>
            <h1 className="text-xl font-bold mb-1">欢迎回来</h1>
            <p className="text-gray-500 text-xs">登录您的账户继续使用</p>
          </div>

          <Form
            form={form}
            layout="vertical"
            onFinish={handleSubmit}
            autoComplete="off"
            style={{ marginBottom: 0 }}
          >
            <Form.Item
              label="用户名"
              name="username"
              style={{ marginBottom: '12px' }}
              rules={[
                { required: true, message: '请输入用户名' },
                { min: 3, message: '用户名长度至少为 3 个字符' }
              ]}
            >
              <Input
                prefix={<UserOutlined />}
                placeholder="请输入用户名"
                size="middle"
              />
            </Form.Item>

            <Form.Item
              label="密码"
              name="password"
              style={{ marginBottom: '16px' }}
              rules={[
                { required: true, message: '请输入密码' },
                { min: 6, message: '密码长度至少为 6 个字符' }
              ]}
            >
              <Input.Password
                prefix={<LockOutlined />}
                placeholder="请输入密码"
                size="middle"
              />
            </Form.Item>

            <Form.Item style={{ marginBottom: '12px' }}>
              <Button
                type="primary"
                htmlType="submit"
                block
                loading={loading}
                size="middle"
                style={{
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  border: 'none',
                  height: '38px',
                  fontSize: '14px',
                  fontWeight: '600'
                }}
              >
                登录
              </Button>
            </Form.Item>
          </Form>

          <Divider plain style={{ margin: '12px 0', fontSize: '12px' }}>或</Divider>

          <div className="text-center mb-2">
            <span className="text-gray-600 text-xs">还没有账户？</span>
            <Button
              type="link"
              onClick={() => navigate('/register')}
              size="small"
              style={{ color: '#667eea', fontWeight: '600', padding: '0 4px', fontSize: '12px' }}
            >
              立即注册
            </Button>
          </div>

          <div className="p-2 bg-blue-50 rounded-lg text-center">
            <p className="text-xs text-gray-600 m-0 leading-tight">
              <span className="font-semibold">提示：</span>使用用户名和密码登录
            </p>
          </div>
        </Card>
      </div>
    </div>
  )
}

export default Login
