import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

const backend = 'http://127.0.0.1:8080';

export default defineConfig({
  plugins: [react()],
  server: {
    host: '127.0.0.1',
    port: 3000,
    strictPort: true,
    proxy: {
      '/login': { target: backend, changeOrigin: true },
      '/logout': { target: backend, changeOrigin: true },
      '/music': { target: backend, changeOrigin: true },
      '/artist': { target: backend, changeOrigin: true },
      '/user': { target: backend, changeOrigin: true },
      '/profile/me': { target: backend, changeOrigin: true },
      '/new': { target: backend, changeOrigin: true },
    },
  },
  build: {
    target: 'es2022',
    sourcemap: false,
  },
});
