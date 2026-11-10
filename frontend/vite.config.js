import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Proxy evita CORS em dev: o navegador chama /api e o Vite repassa para o Express.
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: { '/api': 'http://localhost:3333' },
  },
});
