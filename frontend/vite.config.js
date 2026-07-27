import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import mkcert from 'vite-plugin-mkcert'; // 1. Imported mkcert instead of basicSsl
import path from 'path';
import {defineConfig} from 'vite';

export default defineConfig(() => {
  return {
    plugins: [
      react(), 
      tailwindcss(), 
      mkcert() // 2. Replaced basicSsl() with mkcert()
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      https: true,
      hmr: process.env.DISABLE_HMR !== 'true',
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});