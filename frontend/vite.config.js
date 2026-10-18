import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    host: '127.0.0.1', port: 5173, strictPort: true,
    allowedHosts: ['localhost', '127.0.0.1'],
    proxy: { '/api': { target: process.env.API_PROXY_TARGET || 'http://127.0.0.1:5000', changeOrigin: true, xfwd: false } },
  },
  preview: { host: '127.0.0.1', port: 4173, strictPort: true, allowedHosts: ['localhost', '127.0.0.1'] },
  test: { environment: 'jsdom', setupFiles: ['./src/test/setup.js'], include: ['src/**/*.test.{js,jsx}'] },
});
