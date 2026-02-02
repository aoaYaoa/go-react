import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import AutoImport from 'unplugin-auto-import/vite'

export default defineConfig({
  plugins: [
    react(),
    AutoImport({
      imports: [
        {
          'antd': [
            'Form',
            'Input',
            'Button',
            'Card',
            'message',
            'Divider',
            'Dropdown',
            'Space',
            'Avatar',
          ],
        },
      ],
      dts: 'src/auto-imports.d.ts',
    }),
  ],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        secure: false,
      },
    },
  },
})
