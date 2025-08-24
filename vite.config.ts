import { type ProxyOptions, defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const isProduction = mode === 'production';

  const serverConfig: {
    host: string;
    proxy?: Record<string, string | ProxyOptions>;
  } = {
    host: '0.0.0.0', // This allows access from other devices on the same network
  };

  if (!isProduction) {
    serverConfig.proxy = {
      '/api': {
        // This should point to your randomplayables backend server address
        target: 'http://localhost:3000', 
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
    };
  }

  return {
    plugins: [react()],
    server: serverConfig,
  };
});