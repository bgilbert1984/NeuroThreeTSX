import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import fs from 'fs';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    host: true,
    port: 3000,
    // Important for WebXR development - use HTTPS in development
    https: {
      key: fs.readFileSync('./certificates/localhost-key.pem'),
      cert: fs.readFileSync('./certificates/localhost.pem'),
    },
  },
  build: {
    outDir: 'dist',
    // Chunk size warnings threshold
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        // Optimize chunks for better code splitting
        manualChunks: {
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'three-vendor': ['three'],
          'three-addons': ['@react-three/fiber', '@react-three/drei', '@react-three/xr'],
          'utils': ['lodash', 'd3'],
        },
      },
    },
  },
  // Optimize dependencies 
  optimizeDeps: {
    include: ['three', '@react-three/fiber', '@react-three/drei', '@react-three/xr'],
  },
});
