import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'node:path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: { '@': path.resolve(__dirname, './src') },
  },
  server: { port: 5173 },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes('node_modules')) return undefined;
          if (id.includes('react-router')) return 'router';
          if (id.includes('react-dom') || id.includes('/react/')) return 'react';
          if (id.includes('@tanstack')) return 'query';
          if (id.includes('socket.io')) return 'socket';
          if (id.includes('@radix-ui') || id.includes('lucide-react')) return 'ui';
          return 'vendor';
        },
      },
    },
  },
});
