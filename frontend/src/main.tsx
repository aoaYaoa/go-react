import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { ConfigProvider, antdTheme, antdLocale } from './config/antdConfig'

const rootElement = document.getElementById('root')
if (!rootElement) throw new Error('Root element not found')

createRoot(rootElement).render(
  <StrictMode>
    <ConfigProvider theme={antdTheme} locale={antdLocale}>
      <App />
    </ConfigProvider>
  </StrictMode>,
)
