/**
 * Ant Design 全局配置
 * 在 main.jsx 中统一引入，其他文件无需重复引入
 */
import { ConfigProvider } from 'antd'
import zhCN from 'antd/locale/zh_CN'

// 全局主题配置
export const antdTheme = {
  token: {
    colorPrimary: '#1890ff',
    borderRadius: 8,
  },
}

// 全局语言配置
export const antdLocale = zhCN

// ConfigProvider 组件
export { ConfigProvider }
