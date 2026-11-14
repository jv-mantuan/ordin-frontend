import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(({ command, mode }) => {
  // The e2e auth bypass (src/lib/authBypass.ts) is dev-server only. Refuse to build with it set,
  // whether it comes from .env* files or the shell (loadEnv includes process.env).
  if (command === 'build' && loadEnv(mode, process.cwd(), 'VITE_').VITE_AUTH_BYPASS === 'true') {
    throw new Error('VITE_AUTH_BYPASS=true is not allowed in a build (dev-only e2e auth bypass).')
  }
  return {
    plugins: [react()],
  }
})
