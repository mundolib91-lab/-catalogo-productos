import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['icon-registro-192.png', 'icon-registro-512.png'],
      devOptions: {
        enabled: true
      },
      manifest: {
        name: 'Mundo Lib - Registro',
        short_name: 'Mundo Lib',
        description: 'Sistema de gestión de inventario para Mundo Lib',
        theme_color: '#f59e0b',
        background_color: '#ffffff',
        display: 'standalone',
        orientation: 'portrait',
        scope: '/',
        start_url: '/',
        icons: [
          {
            src: '/icon-mundolib.svg',
            sizes: '512x512',
            type: 'image/svg+xml',
            purpose: 'any'
          },
          {
            src: '/icon-mundolib.svg',
            sizes: '512x512',
            type: 'image/svg+xml',
            purpose: 'maskable'
          },
          {
            src: '/icon-registro-192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any'
          },
          {
            src: '/icon-registro-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any'
          }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,jpg,jpeg}'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/zpvtovhomaykvcowbtda\.supabase\.co\/.*/i,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'supabase-cache',
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 60 * 60 * 24 // 24 horas
              },
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          },
          {
            urlPattern: /^https:\/\/catalogo-productos-production-9459\.up\.railway\.app\/api\/.*/i,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'api-cache',
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 60 * 5 // 5 minutos
              }
            }
          }
        ]
      }
    })
  ],
  server: {
    host: true,
    port: 5173,
    // Desactivar caché en desarrollo
    headers: {
      'Cache-Control': 'no-store'
    }
  }
})
