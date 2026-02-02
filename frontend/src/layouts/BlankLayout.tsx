import { Outlet } from 'react-router-dom'

/**
 * 空白布局组件
 * 用于不需要导航栏的页面（如认证页面）
 * 只包含主内容区域，无边距无内边距
 *
 * @returns {React.ReactNode} 布局组件
 */
function BlankLayout() {
  return (
    <div style={{ margin: 0, padding: 0, width: '100%', height: '100%' }}>
      <Outlet />
    </div>
  )
}

export default BlankLayout
