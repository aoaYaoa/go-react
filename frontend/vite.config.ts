import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import AutoImport from 'unplugin-auto-import/vite'
import { viteStaticCopy } from 'vite-plugin-static-copy'
import svgr from 'vite-plugin-svgr'

export default defineConfig({
  plugins: [
    react(),
    svgr(),
    AutoImport({
      imports: [
        'react',
        'react-router-dom',
        {
          'antd': [
            // 常用组件
            'Form',
            'Input',
            'Button',
            'Card',
            'Table',
            'Modal',
            'Drawer',
            'Select',
            'Space',
            'Tag',
            'Avatar',
            'Divider',
            'Dropdown',
            'message',
            'notification',
            'Statistic',
            'Row',
            'Col',
            'DatePicker',
            'InputNumber',
            'List',
            'Image',
            'Spin',
            'App',
            'Descriptions',
            'Alert',
            'Switch',
          ],
          '@ant-design/icons': [
            'SearchOutlined',
            'PlusOutlined',
            'EditOutlined',
            'DeleteOutlined',
            'EyeOutlined',
            'FilterOutlined',
            'ReloadOutlined',
            'FullscreenOutlined',
            'PlayCircleOutlined',
            'LikeOutlined',
            'CommentOutlined',
            'HeartOutlined',
            'ArrowUpOutlined',
            'ArrowDownOutlined',
            'EnvironmentOutlined',
            'UserOutlined',
            'LockOutlined',
            'MailOutlined',
            'SafetyOutlined',
            'ClockCircleOutlined',
            'DownloadOutlined',
          ],
        },
      ],
      dts: 'src/auto-imports.d.ts',
      eslintrc: {
        enabled: true,
      },
    }),
    viteStaticCopy({
      targets: [
        {
          src: 'node_modules/mars3d-cesium/Build/Cesium/Workers/*',
          dest: 'cesium/Workers'
        },
        {
          src: 'node_modules/mars3d-cesium/Build/Cesium/ThirdParty/*',
          dest: 'cesium/ThirdParty'
        },
        {
          src: 'node_modules/mars3d-cesium/Build/Cesium/Assets/*',
          dest: 'cesium/Assets'
        },
        {
          src: 'node_modules/mars3d-cesium/Build/Cesium/Widgets/*',
          dest: 'cesium/Widgets'
        }
      ]
    })
  ],
  define: {
    CESIUM_BASE_URL: JSON.stringify('/cesium'),
  },
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
