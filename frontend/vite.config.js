import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    proxy: {
    '/articles': 'http://127.0.0.1:5000',
    '/admin':    'http://127.0.0.1:5000',
    '/login':    'http://127.0.0.1:5000',
    '/register': 'http://127.0.0.1:5000',
    '/ai':       'http://127.0.0.1:5000',  
    '/notifications': 'http://127.0.0.1:5000',
    '/uploads':       'http://127.0.0.1:5000', 
    },
  }
})