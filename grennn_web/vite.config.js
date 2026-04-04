import { fileURLToPath, URL } from 'node:url'

import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
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
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (!id.includes('node_modules')) return

            if (id.includes('/qweather-icons/')) return 'weather-icons'
            if (id.includes('/element-plus/')) return 'element-plus'
            if (id.includes('/@element-plus/icons-vue/')) return 'element-plus-icons'
            if (id.includes('/vue/') || id.includes('/vue-router/') || id.includes('/pinia/')) {
              return 'vue-vendor'
            }
            if (id.includes('/axios/')) return 'axios'
            if (id.includes('/marked/')) return 'marked'
            if (id.includes('/nprogress/')) return 'nprogress'
            if (id.includes('/gsap/')) return 'gsap'
            if (id.includes('/ogl/')) return 'ogl'
          },
        },
      },
    },
  }
})
