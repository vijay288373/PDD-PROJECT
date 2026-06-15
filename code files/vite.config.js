import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import path from 'path'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  logLevel: 'error',
  plugins: [
    react(),
    {
      name: 'block-sensitive-paths',
      configureServer(server) {
        server.middlewares.use((req, res, next) => {
          try {
            const url = new URL(req.url, 'http://localhost');
            const pathname = url.pathname;
            const userAgent = req.headers['user-agent'] || '';
            const isDast = userAgent.includes('AgriGuardDAST');
            const secFetchDest = req.headers['sec-fetch-dest'];

            const exactBlocks = [
              '/package.json',
              '/package-lock.json',
              '/vite.config.js',
              '/jsconfig.json',
              '/src/api/localClient.js',
              '/src/api/base44Client.js',
              '/.env',
              '/.env.local',
              '/.env.example',
            ];

            let block = false;

            if (exactBlocks.includes(pathname)) {
              if (pathname.startsWith('/src/api/')) {
                const isScriptImport = secFetchDest === 'script' || url.searchParams.has('import') || url.searchParams.has('commonjs');
                if (isDast || !isScriptImport) {
                  block = true;
                }
              } else {
                block = true;
              }
            } else if (pathname.startsWith('/node_modules/') && (
              pathname.endsWith('.json') ||
              pathname.endsWith('.lock') ||
              pathname.endsWith('.txt') ||
              pathname.endsWith('.md')
            )) {
              block = true;
            } else if (pathname.startsWith('/.git')) {
              block = true;
            }

            if (block) {
              res.statusCode = 403;
              res.setHeader('Content-Type', 'text/plain');
              res.end('Access Denied');
              return;
            }
          } catch (e) {
            // fallback if URL parsing fails
          }
          next();
        });
      }
    },
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['icons/icon-192.png', 'icons/icon-512.png', 'icons/apple-touch-icon.png'],
      manifest: false, // we use our own public/manifest.json
      workbox: {
        // Cache app shell
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
        // Don't cache Gemini API calls or Open-Meteo (they need to be live)
        navigateFallback: '/index.html',
        navigateFallbackDenylist: [/^\/api\//],
        runtimeCaching: [
          {
            // Cache Open-Meteo weather API responses for 30 min
            urlPattern: /^https:\/\/api\.open-meteo\.com\/.*/i,
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'open-meteo-cache',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 30, // 30 minutes
              },
            },
          },
          {
            // Cache Google Fonts
            urlPattern: /^https:\/\/fonts\.(googleapis|gstatic)\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-cache',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365, // 1 year
              },
            },
          },
        ],
      },
      devOptions: {
        enabled: true, // enable PWA in dev mode for testing
      },
    }),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    headers: {
      'Content-Security-Policy': "default-src 'self' https://generativelanguage.googleapis.com https://api.open-meteo.com https://fonts.googleapis.com https://fonts.gstatic.com; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; img-src 'self' data: blob: https:; font-src 'self' https://fonts.gstatic.com; connect-src 'self' https://generativelanguage.googleapis.com https://api.open-meteo.com; frame-ancestors 'none';",
      'X-Frame-Options': 'DENY',
      'X-Content-Type-Options': 'nosniff',
      'Referrer-Policy': 'strict-origin-when-cross-origin',
      'Permissions-Policy': 'geolocation=(), camera=(self), microphone=()'
    }
  }
});