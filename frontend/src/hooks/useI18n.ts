import { useTranslation } from 'react-i18next'

/**
 * 国际化 Hook
 * 封装 react-i18next 的 useTranslation
 */
export const useI18n = () => {
  const { t, i18n } = useTranslation()

  return {
    t,
    language: i18n.language,
    changeLanguage: i18n.changeLanguage,
  }
}
