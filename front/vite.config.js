import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// En desarrollo local apunta a localhost:8080, en producción o Render apunta al backend desplegado
const BACKEND_URL = process.env.VITE_BACKEND_URL || 'https://bibliometria-back.onrender.com'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    port: 5173,
    allowedHosts: true,
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        secure: false,
      },
    },
  },
  preview: {
    host: true,
    port: 5173,
    allowedHosts: true,
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        secure: false,
      },
    },
  },
})
