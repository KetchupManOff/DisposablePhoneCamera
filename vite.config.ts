import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import type { ServerOptions } from 'vite';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// 🔐 Charger les certs SSL seulement si elles existent (développement local)
// Sur GitHub Actions (CI), ces fichiers n'existent pas → pas de HTTPS
function getHttpsConfig(): ServerOptions['https'] {
  const keyPath = path.resolve(__dirname, 'certs/key.pem');
  const certPath = path.resolve(__dirname, 'certs/cert.pem');

  if (fs.existsSync(keyPath) && fs.existsSync(certPath)) {
    return {
      key: fs.readFileSync(keyPath),
      cert: fs.readFileSync(certPath),
    };
  }
  // En CI/build → pas de HTTPS, on retourne undefined
  return undefined;
}

export default defineConfig({
  base: '/camera/',
  server: {
    https: getHttpsConfig(),
    host: '0.0.0.0',
    port: 5173,
    strictPort: true,
    allowedHosts: true,
  },
  preview: {
    https: getHttpsConfig(),
    host: '0.0.0.0',
    allowedHosts: true,
  },
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['icons/icon-192.png', 'icons/icon-512.png'],
      manifest: {
        name: 'Disposable Phone Camera',
        short_name: 'DispoCam',
        description:
          "L'appareil photo jetable vintage dans votre poche. Prenez 24 poses, développez plus tard.",
        theme_color: '#1a1a2e',
        background_color: '#0f0f1a',
        display: 'standalone',
        orientation: 'portrait',
        start_url: '/camera/',
        scope: '/camera/',
        icons: [
          {
            src: '/camera/icons/icon-192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: '/camera/icons/icon-512.png',
            sizes: '512x512',
            type: 'image/png',
          },
          {
            src: '/camera/icons/icon-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
        runtimeCaching: [],
      },
    }),
  ],
});