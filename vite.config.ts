import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],

  // Optimize package size by splitting large dependencies into separate chunks
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'mermaid': ['mermaid'],
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
        }
      }
    }
  }
})