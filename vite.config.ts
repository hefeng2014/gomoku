import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
    plugins: [vue()],
    resolve: {
        alias: {
            '@': fileURLToPath(new URL('./src', import.meta.url)),
        },
    },
    server: {
        port: 5174,
        open: true,
    },
    // 规则与引擎（src/game/）零 Vue import，所以测试跑在 node 环境即可，
    // 不需要 jsdom，也不需要挂载组件。
    test: {
        environment: 'node',
        include: ['src/tests/**/*.spec.ts'],
    },
})
