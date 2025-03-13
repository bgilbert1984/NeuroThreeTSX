import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import fs from 'fs'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  base: '/',  // Using absolute paths
  server: {
    https: {
      key: fs.readFileSync(path.resolve(__dirname, 'certificates/localhost-key.pem')),
      cert: fs.readFileSync(path.resolve(__dirname, 'certificates/localhost.pem')),
    },
    host: true,
    port: 3001,
    proxy: {},
    strictPort: true,
    open: true
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets'
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  },
  root: './' // Specify the root directory where index.html is located
})