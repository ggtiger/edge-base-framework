import { defineConfig } from 'vite'
import path from 'node:path'
import electron from 'vite-plugin-electron/simple'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vitejs.dev/config/
export default defineConfig({
  base: './',
  plugins: [
    react(),
    tailwindcss(),
    electron({
      main: {
        entry: 'src/main/index.ts',
        onstart(args) {
          args.startup()
        },
        vite: {
          build: {
            sourcemap: false,
            minify: false,
            outDir: 'dist-electron/main',
            rollupOptions: {
              external: ['serialport', 'sqlite3', 'electron-store', 'systeminformation', 'koffi'],
            },
          },
        },
      },
      preload: {
        input: 'src/preload/index.ts',
        onstart(args) {
          args.reload()
        },
        vite: {
          build: {
            sourcemap: false, // Source map support for preload
            minify: false,
            outDir: 'dist-electron/preload',
            rollupOptions: {
              external: ['serialport', 'sqlite3', 'electron-store', 'systeminformation', 'koffi'],
            },
          },
        },
      },
      renderer: {},
    }),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src/renderer'),
    },
  },
})
