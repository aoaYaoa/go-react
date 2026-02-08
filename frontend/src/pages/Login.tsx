import { useNavigate } from 'react-router-dom'
import { Form, Input, Button, Card, Divider, message } from 'antd'
import { UserOutlined, LockOutlined, SafetyOutlined } from '@ant-design/icons'
import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { userService } from '../services/user'
import { useStore } from '../store'
import styles from './Login.module.css'

/**
 * 登录表单值
 */
interface LoginFormValues {
  username: string
  password: string
  captcha_code: string
}

/**
 * 登录页面
 * 使用 Ant Design 组件和后端 JWT 认证
 *
 * @returns {React.ReactNode} 登录页面
 */
function Login() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [form] = Form.useForm<LoginFormValues>()
  const [loading, setLoading] = useState<boolean>(false)
  const [captchaId, setCaptchaId] = useState<string>('')
  const [captchaImage, setCaptchaImage] = useState<string>('')
  const { setUser, setToken, setRoles, setMenus } = useStore()

  /**
   * 加载验证码
   */
  const loadCaptcha = async () => {
    try {
      const captcha = await userService.getCaptcha()
      setCaptchaId(captcha.captcha_id)
      setCaptchaImage(captcha.captcha_image)
    } catch (error) {
      message.error('获取验证码失败')
    }
  }

  // 组件挂载时加载验证码
  useEffect(() => {
    loadCaptcha()
  }, [])

  /**
   * 处理登录提交
   */
  const handleSubmit = async (values: LoginFormValues) => {
    setLoading(true)

    try {
      const result = await userService.login({
        username: values.username,
        password: values.password,
        captcha_id: captchaId,
        captcha_code: values.captcha_code,
      })
      
      // 保存用户信息、token、角色和菜单到 store
      setUser(result.user)
      setToken(result.token)
      setRoles(result.roles || [])
      setMenus(result.menus || [])
      
      message.success(t('auth.loginSuccess', '登录成功！'))
      
      // 跳转到首页
      setTimeout(() => {
        navigate('/')
        window.location.reload()
      }, 500)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : t('auth.loginFailed', '登录失败，请稍后重试')
      message.error(errorMessage)
      // 验证码错误后重新加载验证码
      loadCaptcha()
      form.setFieldValue('captcha_code', '')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={styles.loginContainer}>
      <ParticlesBackground particleCount={1500} variant="login" />
      <div className={styles.loginCard}>
        <Card variant="borderless" className={styles.cardContent}>
          <div className={styles.header}>
            <div className={styles.iconWrapper}>
              <UserOutlined style={{ fontSize: '20px', color: '#fff' }} />
            </div>
            <h1 className={styles.title}>{t('auth.welcomeBack')}</h1>
            <p className={styles.subtitle}>{t('auth.loginTip')}</p>
          </div>

          <Form
            form={form}
            layout="vertical"
            onFinish={handleSubmit}
            autoComplete="off"
            style={{ marginBottom: 0 }}
          >
            <Form.Item
              label={t('auth.username')}
              name="username"
              style={{ marginBottom: '12px' }}
              rules={[
                { required: true, message: t('auth.usernameRequired') },
                { min: 3, message: t('auth.usernameLength') }
              ]}
            >
              <Input
                prefix={<UserOutlined />}
                placeholder={t('auth.username')}
                size="middle"
              />
            </Form.Item>

            <Form.Item
              label={t('auth.password')}
              name="password"
              style={{ marginBottom: '12px' }}
              rules={[
                { required: true, message: t('auth.passwordRequired') },
                { min: 6, message: t('auth.passwordLength') }
              ]}
            >
              <Input.Password
                prefix={<LockOutlined />}
                placeholder={t('auth.password')}
                size="middle"
              />
            </Form.Item>

            <Form.Item
              label="验证码"
              name="captcha_code"
              style={{ marginBottom: '16px' }}
              rules={[
                { required: true, message: '请输入验证码' },
                { len: 4, message: '验证码为4位' }
              ]}
            >
              <div className={styles.captchaWrapper}>
                <Input
                  prefix={<SafetyOutlined />}
                  placeholder="请输入验证码"
                  size="middle"
                  maxLength={4}
                  className={styles.captchaInput}
                />
                {captchaImage && (
                  <img
                    src={captchaImage}
                    alt="验证码"
                    onClick={loadCaptcha}
                    className={styles.captchaImage}
                    title="点击刷新验证码"
                  />
                )}
              </div>
            </Form.Item>

            <Form.Item style={{ marginBottom: '12px' }}>
              <Button
                type="primary"
                htmlType="submit"
                block
                loading={loading}
                size="middle"
                className={styles.loginButton}
              >
                {t('auth.login')}
              </Button>
            </Form.Item>
          </Form>

          <Divider plain className={styles.divider}>{t('common.or', '或')}</Divider>

          <div className={styles.footer}>
            <span className={styles.footerText}>{t('auth.noAccount')}</span>
            <Button
              type="link"
              onClick={() => navigate('/register')}
              size="small"
              className={styles.registerLink}
            >
              {t('auth.registerNow')}
            </Button>
          </div>

          <div className={styles.infoBox}>
            <p className={styles.infoText}>
              <span className={styles.infoLabel}>{t('common.info', '提示')}：</span>{t('auth.loginTip')}
            </p>
          </div>
        </Card>
      </div>
    </div>
  )
}

export default Login
