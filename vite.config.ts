import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const repoName = env.VITE_REPO_NAME || ''
  const base = repoName ? `/${repoName}/` : '/'

  return {
    base,
    plugins: [react()],
  }
})
