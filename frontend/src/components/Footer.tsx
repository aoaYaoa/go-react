import { useTranslation } from 'react-i18next'

/**
 * 页脚组件
 * 显示版权信息
 *
 * @returns {React.ReactNode} 页脚组件
 */
function Footer() {
  const { t } = useTranslation()
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-white/80 backdrop-blur-xl border-t border-white/40 text-slate-600 relative z-50 transition-all duration-300">
      <div className="container mx-auto px-5 py-2 text-center text-xs font-mono tracking-wide">
        <div className="flex justify-center items-center gap-2 mb-0.5 opacity-90">
           <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
           <span className="uppercase text-slate-700 font-semibold tracking-wider">System Operational</span>
        </div>
        <p>
          &copy; {currentYear} SkyTracker. {t('common.allRightsReserved', '保留所有权利')}
        </p>
      </div>
    </footer>
  )
}

export default Footer
