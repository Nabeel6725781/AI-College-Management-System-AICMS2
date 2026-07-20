import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/AI-College-Management-System-AICMS2/',
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
});
