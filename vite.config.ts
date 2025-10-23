import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    target: 'es2020',
    rollupOptions: {
      output: {
        manualChunks: {
          'mediapipe': ['@mediapipe/tasks-genai'],
          'react-vendor': ['react', 'react-dom'],
          'motion': ['framer-motion'],
        },
      },
    },
  },
  optimizeDeps: {
    exclude: ['@mediapipe/tasks-genai'],
    esbuildOptions: {
      target: 'es2020',
    },
  },
  worker: {
    format: 'es',
  },
  server: {
    headers: {
      'Cross-Origin-Embedder-Policy': 'require-corp',
      'Cross-Origin-Opener-Policy': 'same-origin',
    },
    fs: {
      allow: ['..'],
    },
  },
});
