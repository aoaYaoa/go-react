import { GlobalOutlined } from '@ant-design/icons'
import { useApp } from '../store'
import i18n from '../locales'

export default function LanguageSwitcher() {
  const { language, setLanguage } = useApp()

  const handleLanguageChange = (lang: 'zh-CN' | 'en-US') => {
    setLanguage(lang)
    i18n.changeLanguage(lang)
  }

  return (
    <Dropdown
      menu={{
        items: [
          {
            key: 'zh-CN',
            label: '简体中文',
            onClick: () => handleLanguageChange('zh-CN'),
          },
          {
            key: 'en-US',
            label: 'English',
            onClick: () => handleLanguageChange('en-US'),
          },
        ],
        selectedKeys: [language],
      }}
      trigger={['click']}
    >
      <Button type="text" className="flex items-center gap-2">
        <GlobalOutlined />
        <span>{language === 'zh-CN' ? '中文' : 'EN'}</span>
      </Button>
    </Dropdown>
  )
}
