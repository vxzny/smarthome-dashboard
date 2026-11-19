import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Relative base path ('./') memastikan semua asset JS/CSS berjalan lancar
// di GitHub Pages project URL (https://<username>.github.io/<repo-name>/)
// maupun custom domain tanpa masalah path.
export default defineConfig({
  plugins: [react()],
  base: './',
  build: {
    outDir: 'dist',
    sourcemap: false,
    target: 'es2020',
  },
  server: {
    port: 5173,
    open: true,
  },
});
