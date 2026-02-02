import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { UserOutlined, LockOutlined, MailOutlined } from '@ant-design/icons'
import { userService } from '../services/user'

/**
 * 注册表单值
 */
interface RegisterFormValues {
  username: string
  email?: string
  password: string
  confirmPassword: string
}

/**
 * 注册页面
 * 用户通过用户名和密码创建新账户
 * 使用 Ant Design 组件和后端 JWT 认证
 *
 * @returns {React.ReactNode} 注册页面
 */
function Register() {
  const navigate = useNavigate()
  const [form] = Form.useForm<RegisterFormValues>()
  const [loading, setLoading] = useState<boolean>(false)

  /**
   * 处理注册提交
   */
  const handleSubmit = async (values: RegisterFormValues) => {
    setLoading(true)

    try {
      const result = await userService.register({
        username: values.username,
        email: values.email,
        password: values.password,
      })
      
      message.success('注册成功！请登录')
      console.log('注册成功:', result)
      
      // 跳转到登录页
      setTimeout(() => {
        navigate('/login')
      }, 1500)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '注册失败，请稍后重试'
      message.error(errorMessage)
      console.error('注册错误:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div 
      className="min-h-screen w-screen flex items-center justify-center"
      style={{
        background: 'linear-gradient(135deg, #764ba2 0%, #667eea 100%)',
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
              background: 'linear-gradient(135deg, #764ba2 0%, #667eea 100%)'
            }}>
              <UserOutlined className="text-2xl text-white" />
            </div>
            <h1 className="text-xl font-bold mb-1">创建账户</h1>
            <p className="text-gray-500 text-xs">加入我们，开始您的旅程</p>
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
                { min: 3, message: '用户名长度至少为 3 个字符' },
                { max: 20, message: '用户名长度不能超过 20 个字符' }
              ]}
            >
              <Input
                prefix={<UserOutlined />}
                placeholder="3-20个字符"
                size="middle"
              />
            </Form.Item>

            <Form.Item
              label="邮箱（可选）"
              name="email"
              style={{ marginBottom: '12px' }}
              rules={[
                { type: 'email', message: '请输入有效的邮箱地址' }
              ]}
            >
              <Input
                prefix={<MailOutlined />}
                placeholder="your@email.com"
                size="middle"
              />
            </Form.Item>

            <Form.Item
              label="密码"
              name="password"
              style={{ marginBottom: '12px' }}
              rules={[
                { required: true, message: '请输入密码' },
                { min: 6, message: '密码长度至少为 6 个字符' }
              ]}
            >
              <Input.Password
                prefix={<LockOutlined />}
                placeholder="至少6个字符"
                size="middle"
              />
            </Form.Item>

            <Form.Item
              label="确认密码"
              name="confirmPassword"
              style={{ marginBottom: '16px' }}
              rules={[
                { required: true, message: '请确认密码' },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (!value || getFieldValue('password') === value) {
                      return Promise.resolve()
                    }
                    return Promise.reject(new Error('两次输入的密码不一致'))
                  }
                })
              ]}
            >
              <Input.Password
                prefix={<LockOutlined />}
                placeholder="再次输入密码"
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
                  background: 'linear-gradient(135deg, #764ba2 0%, #667eea 100%)',
                  border: 'none',
                  height: '38px',
                  fontSize: '14px',
                  fontWeight: '600'
                }}
              >
                创建账户
              </Button>
            </Form.Item>
          </Form>

          <Divider plain style={{ margin: '12px 0', fontSize: '12px' }}>或</Divider>

          <div className="text-center mb-2">
            <span className="text-gray-600 text-xs">已有账户？</span>
            <Button
              type="link"
              onClick={() => navigate('/login')}
              size="small"
              style={{ color: '#764ba2', fontWeight: '600', padding: '0 4px', fontSize: '12px' }}
            >
              立即登录
            </Button>
          </div>

          <div className="p-2 bg-purple-50 rounded-lg text-center">
            <p className="text-xs text-gray-600 m-0 leading-tight">
              注册即表示您同意我们的
              <span className="text-purple-600 font-semibold cursor-pointer hover:underline"> 服务条款 </span>
              和
              <span className="text-purple-600 font-semibold cursor-pointer hover:underline"> 隐私政策</span>
            </p>
          </div>
        </Card>
      </div>
    </div>
  )
}

export default Register
