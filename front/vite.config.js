import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: true, // Escucha en 0.0.0.0 para que cualquier túnel o red local lo alcance
    port: 5173,
    allowedHosts: true, // Permite cualquier host de túnel (localtunnel, ngrok, etc.)
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        secure: false,
      },
    },
  },
})
