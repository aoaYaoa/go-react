import { useNavigate } from 'react-router-dom'
import { Form, Input, Button, Card, Divider, message } from 'antd'
import { UserOutlined, LockOutlined, MailOutlined } from '@ant-design/icons'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { userService } from '../services/user'
import styles from './Register.module.css'

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
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [form] = Form.useForm<RegisterFormValues>()
  const [loading, setLoading] = useState<boolean>(false)

  /**
   * 处理注册提交
   */
  const handleSubmit = async (values: RegisterFormValues) => {
    setLoading(true)

    try {
      await userService.register({
        username: values.username,
        email: values.email,
        password: values.password,
      })
      
      message.success(t('auth.registerSuccess', '注册成功！请登录'))

      // 跳转到登录页
      setTimeout(() => {
        navigate('/login')
      }, 1500)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : t('auth.registerFailed', '注册失败，请稍后重试')
      message.error(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={styles.registerContainer}>
      <ParticlesBackground particleCount={1500} variant="register" />
      <div className={styles.registerCard}>
        <Card variant="borderless" className={styles.cardContent}>
          <div className={styles.header}>
            <div className={styles.iconWrapper}>
              <UserOutlined style={{ fontSize: '20px', color: '#fff' }} />
            </div>
            <h1 className={styles.title}>{t('auth.createAccount')}</h1>
            <p className={styles.subtitle}>{t('auth.registerTip')}</p>
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
                { min: 3, message: t('auth.usernameLength') },
                { max: 20, message: t('auth.usernameMaxLength') }
              ]}
            >
              <Input
                prefix={<UserOutlined />}
                placeholder={t('auth.usernamePlaceholder')}
                size="middle"
              />
            </Form.Item>

            <Form.Item
              label={t('auth.emailOptional')}
              name="email"
              style={{ marginBottom: '12px' }}
              rules={[
                { type: 'email', message: t('auth.emailInvalid') }
              ]}
            >
              <Input
                prefix={<MailOutlined />}
                placeholder={t('auth.emailPlaceholder')}
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
                placeholder={t('auth.passwordPlaceholder')}
                size="middle"
              />
            </Form.Item>

            <Form.Item
              label={t('auth.confirmPassword')}
              name="confirmPassword"
              style={{ marginBottom: '16px' }}
              rules={[
                { required: true, message: t('auth.confirmPasswordRequired') },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (!value || getFieldValue('password') === value) {
                      return Promise.resolve()
                    }
                    return Promise.reject(new Error(t('auth.passwordMismatch')))
                  }
                })
              ]}
            >
              <Input.Password
                prefix={<LockOutlined />}
                placeholder={t('auth.confirmPasswordPlaceholder')}
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
                className={styles.registerButton}
              >
                {t('auth.createAccount')}
              </Button>
            </Form.Item>
          </Form>

          <Divider plain className={styles.divider}>{t('common.or', '或')}</Divider>

          <div className={styles.footer}>
            <span className={styles.footerText}>{t('auth.hasAccount')}</span>
            <Button
              type="link"
              onClick={() => navigate('/login')}
              size="small"
              className={styles.loginLink}
            >
              {t('auth.loginNow')}
            </Button>
          </div>

          <div className={styles.infoBox}>
            <p className={styles.infoText}>
              {t('auth.agreeTo')}
              <span className={styles.infoLabel}>{t('auth.terms')}</span>
              {t('auth.and')}
              <span className={styles.infoLabel}>{t('auth.privacy')}</span>
            </p>
          </div>
        </Card>
      </div>
    </div>
  )
}

export default Register
