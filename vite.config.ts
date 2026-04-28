import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'
import path from 'path'
import basicSsl from '@vitejs/plugin-basic-ssl'

export default defineConfig({
  plugins: [
    react(),
    basicSsl(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'Absensi Dr. Meow',
        short_name: 'Absensi Dr. Meow',
        theme_color: '#ffffff',
        icons: [{ src: '/icon-192.png', sizes: '192x192', type: 'image/png' }],
      },
    }),
  ],
  // server: {
  //   host: true,
  //   port: 5173,
  // },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})