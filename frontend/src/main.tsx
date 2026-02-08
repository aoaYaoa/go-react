import { createRoot } from 'react-dom/client'
import { App as AntApp } from 'antd'
import 'antd/dist/reset.css'
import './styles/antd-theme.scss'
import './index.css'
import 'mars3d-cesium/Build/Cesium/Widgets/widgets.css'
import 'mars3d/mars3d.css'
import './locales'
import App from './App.tsx'

const rootElement = document.getElementById('root')
if (!rootElement) throw new Error('Root element not found')

createRoot(rootElement).render(
    <AntApp>
      <App />
    </AntApp>
)
