import { fileURLToPath, URL } from 'node:url'

import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import { VitePWA } from 'vite-plugin-pwa'
import vueDevTools from 'vite-plugin-vue-devtools'
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '', '')
  const siliconflowApiKey = env.SILICONFLOW_API_KEY

  return {
    plugins: [
      vue(),
      VitePWA({
        registerType: 'autoUpdate',
        devOptions: {
          enabled: true,
        },
        manifest: {
          id: '/',
          name: 'GreenSight-绿我同行',
          short_name: 'GreenSight',
          description: '通过 AI 技术促进环保行为的绿色生活平台',
          theme_color: '#2E7D32',
          background_color: '#F4FBF2',
          display: 'standalone',
          orientation: 'portrait',
          scope: '/',
          start_url: '/',
          icons: [
            {
              src: '/pwa-192.png',
              sizes: '192x192',
              type: 'image/png',
            },
            {
              src: '/pwa-512.png',
              sizes: '512x512',
              type: 'image/png',
            },
            {
              src: '/pwa-512.png',
              sizes: '512x512',
              type: 'image/png',
              purpose: 'any maskable',
            },
          ],
        },
      }),
      vueDevTools(),
      AutoImport({
        dts: './auto-imports.d.ts',
        imports: ['vue'],
        resolvers: [ElementPlusResolver()],
        eslintrc: {
          enabled: false,
        },
      }),
      Components({
        dts: './components.d.ts',
        resolvers: [ElementPlusResolver()],
      }),
    ],
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
      },
    },
    server: {
      host: '0.0.0.0',
      proxy: {
        '/api': {
          target: 'http://localhost:3000',
          changeOrigin: true,
        },
        '/siliconflow-api': {
          target: 'https://api.siliconflow.cn',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/siliconflow-api/, ''),
          configure: (proxy) => {
            proxy.on('proxyReq', (proxyReq) => {
              if (siliconflowApiKey) {
                proxyReq.setHeader('Authorization', `Bearer ${siliconflowApiKey}`)
              }
            })
          },
        },
      },
    },
    build: {
      outDir: '../dist',
      rollupOptions: {
        output: {},
      },
    },
  }
})
