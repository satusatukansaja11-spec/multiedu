import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { offlinePlugin } from './offline-plugin.js';
export default defineConfig({
  base: './',
  plugins: [react(), offlinePlugin()],
  server: { proxy: { '/api': 'http://127.0.0.1:3001' } },
});
