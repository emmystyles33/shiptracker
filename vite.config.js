import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:8787',
        changeOrigin: true,
      },
    },
  },
  build: {
    // Keep memory use down during build on low-RAM machines: smaller
    // worker pool, no source maps by default.
    sourcemap: false,
    chunkSizeWarningLimit: 600,
  },
});
