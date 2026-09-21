import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'
import path from 'path'
import basicSsl from '@vitejs/plugin-basic-ssl'

function googleMapsResolverPlugin() {
  const ALLOWED_HOSTS = new Set([
    'maps.app.goo.gl',
    'goo.gl',
    'maps.google.com',
    'www.google.com',
    'google.com',
  ]);

  const isAllowedUrl = (urlStr: string): boolean => {
    try {
      const parsed = new URL(urlStr);
      if (parsed.protocol !== 'https:') return false;
      const host = parsed.hostname.toLowerCase();
      return (
        ALLOWED_HOSTS.has(host) ||
        host.endsWith('.google.com') ||
        host.endsWith('.goo.gl')
      );
    } catch {
      return false;
    }
  };

  const handler = async (req: any, res: any) => {
    if (req.method !== 'GET') {
      res.statusCode = 405;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ error: 'Method not allowed' }));
      return;
    }

    try {
      const urlObj = new URL(req.url, 'http://localhost');
      const targetUrl = urlObj.searchParams.get('url');
      if (!targetUrl || !isAllowedUrl(targetUrl)) {
        res.statusCode = 400;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ error: 'URL harus berupa link resmi Google Maps HTTPS' }));
        return;
      }

      let currentUrl = targetUrl;
      for (let i = 0; i < 5; i++) {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000);
        try {
          const response = await fetch(currentUrl, {
            redirect: 'manual',
            signal: controller.signal,
          });
          const location = response.headers.get('location');
          if (location) {
            const nextUrl = new URL(location, currentUrl).href;
            if (!isAllowedUrl(nextUrl)) {
              break;
            }
            currentUrl = nextUrl;
            if (currentUrl.includes('/place/') || currentUrl.includes('@') || currentUrl.includes('!3d')) {
              break;
            }
          } else {
            break;
          }
        } finally {
          clearTimeout(timeoutId);
        }
      }

      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ resolvedUrl: currentUrl }));
    } catch {
      res.statusCode = 500;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ error: 'Gagal menyelesaikan link Google Maps' }));
    }
  };

  return {
    name: 'google-maps-resolver',
    configureServer(server: any) {
      server.middlewares.use('/api/resolve-maps-url', handler);
    },
    configurePreviewServer(server: any) {
      server.middlewares.use('/api/resolve-maps-url', handler);
    },
  };
}

export default defineConfig({
  plugins: [
    react(),
    basicSsl(),
    tailwindcss(),
    googleMapsResolverPlugin(),
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
  server: {
    host: true,
    port: 5173,
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})