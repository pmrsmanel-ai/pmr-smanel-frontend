import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

const SCRIPT_ID =
  'AKfycbwys1pq_WGaqIfoVgPvVdS6x3akXnEUftlcjzt68gqsjVgdBWnB3XKNBHm7-WiNXXW_EQ';

const SCRIPT_BASE =
  `https://script.google.com/macros/s/${SCRIPT_ID}/exec`;

export default defineConfig({
  // GitHub Pages berada di sub-path repository
  base: '/pmr-smanel-frontend/',

  plugins: [react()],

  server: {
    proxy: {
      '/api': {
        target: 'https://script.google.com',
        changeOrigin: true,
        secure: true,
        followRedirects: true,

        rewrite: (path) => {
          const [pathname, query] = path.split('?');

          const newPath = pathname.replace(
            /^\/api/,
            `/macros/s/${SCRIPT_ID}/exec`
          );

          return query
            ? `${newPath}?${query}`
            : newPath;
        },

        configure: (proxy) => {
          proxy.on('proxyReq', (proxyReq, req) => {
            console.log(
              '[PMR API]',
              req.method,
              req.url
            );
          });
        },
      },
    },
  },
});