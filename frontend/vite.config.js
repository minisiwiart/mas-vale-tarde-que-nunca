import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Las llamadas a /api se redirigen al backend (puerto 3001) durante el desarrollo
export default defineConfig({
  plugins: [react()],
  server: { port: 5173, proxy: { '/api': 'http://localhost:3001' } }
});
