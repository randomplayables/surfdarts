import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import type { ProxyOptions } from 'vite'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const isProduction = mode === 'production'

  // Dev server configuration shared across RP games
  const server: {
    host: string
    allowedHosts: string[]
    proxy?: Record<string, string | ProxyOptions>
  } = {
    host: '0.0.0.0',
    allowedHosts: ['.loca.lt'],
  }

  // Only enable API proxy in development
  if (!isProduction) {
    server.proxy = {
      '/api': {
        // Match the backend used by other deployed games
        target: 'http://172.31.12.157:3000',
        changeOrigin: true,
        // Note: intentionally no 'rewrite' to keep /api prefix (matches other games)
      },
    }
  }

  const config: any = {
    plugins: [react()],
    server,
  }

  // Drop logs in production (top-level esbuild, consistent with GothamLoops)
  if (isProduction) {
    config.esbuild = { drop: ['console', 'debugger'] }
  }

  return config
})