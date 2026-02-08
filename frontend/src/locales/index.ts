import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import LanguageDetector from 'i18next-browser-languagedetector'
import zhCN from './zh-CN'
import enUS from './en-US'

// 语言资源
const resources = {
  'zh-CN': {
    translation: zhCN,
  },
  'en-US': {
    translation: enUS,
  },
}

// 初始化 i18next
i18n
  .use(LanguageDetector) // 自动检测用户语言
  .use(initReactI18next) // 传递 i18n 实例给 react-i18next
  .init({
    resources,
    fallbackLng: 'zh-CN', // 默认语言
    lng: localStorage.getItem('language') || 'zh-CN', // 从 localStorage 读取语言设置
    debug: false,
    interpolation: {
      escapeValue: false, // React 已经安全处理了
    },
  })

export default i18n
