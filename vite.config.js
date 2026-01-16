import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// repo name
const repoName = '/test_genshin-bot/'

export default defineConfig({
  plugins: [vue()],
  base: repoName
})