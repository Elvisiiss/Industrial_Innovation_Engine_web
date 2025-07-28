import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    vueDevTools(),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    },
  },
  server: {
    host: '0.0.0.0', // 监听所有 IPv4 地址
    port: 5175,      // 指定端口（默认 5173）
    strictPort: true, // 如果端口被占用，直接退出
    allowedHosts: [
      'cal' // 允许 cal 主机名访问
    ]
  }
})
