import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  base: '/',
  plugins: [
    react(),
    {
      name: 'glsl',
      transform(code, id) {
        if (id.endsWith('.glsl')) {
          const transformedCode = JSON.stringify(code)
            .replace(/\u2028/g, '\\u2028')
            .replace(/\u2029/g, '\\u2029');
          
          return {
            code: `export default ${transformedCode};`,
            map: null
          };
        }
      }
    }
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 3002,
    host: true, // Listen on all addresses
    strictPort: false, // Allow fallback to next available port
    open: true, // Open browser on server start
  },
  build: {
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          three: ['three'],
          react: ['react', 'react-dom'],
        }
      }
    }
  }
});
