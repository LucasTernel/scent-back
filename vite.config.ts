import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'
import { defineConfig } from 'vite'

export default defineConfig({
  server: { host: true, allowedHosts: ['.trycloudflare.com'] },
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      injectRegister: false, // enregistré dans main.tsx
      workbox: { clientsClaim: true, skipWaiting: true, cleanupOutdatedCaches: true },
      includeAssets: ['favicon.ico', 'favicon-16.png', 'favicon-32.png', 'apple-touch-icon.png', 'og-image.png', 'logo-blanc.png', 'logo-bleu.png'],
      manifest: {
        name: 'Scent Back',
        short_name: 'Scent Back',
        description: 'Chasse aux Lapins Crétins dans Paris',
        lang: 'fr',
        theme_color: '#FCF5E3',
        background_color: '#023341',
        display: 'standalone',
        start_url: '/',
        icons: [
          { src: 'icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
          { src: 'icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
          { src: 'icon-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
    }),
  ],
})
