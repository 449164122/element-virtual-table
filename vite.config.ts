import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    vueJsx(),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
      '@element-plus/utils': fileURLToPath(new URL('./node_modules/element-plus/es/utils', import.meta.url)),
      '@element-plus/hooks': fileURLToPath(new URL('./node_modules/element-plus/es/hooks', import.meta.url)),
      '@element-plus/directives': fileURLToPath(new URL('./node_modules/element-plus/es/directives', import.meta.url)),
      '@element-plus/components': fileURLToPath(new URL('./node_modules/element-plus/es/components', import.meta.url)),
    }
  }
})
