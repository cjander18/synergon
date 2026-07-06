import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  // Relative base keeps the bundle runnable from any path — GitHub Pages
  // project URLs and file:// alike (ADR-0001).
  base: './',
  build: {
    rollupOptions: {
      input: {
        landing: 'index.html',
        app: 'app.html',
      },
    },
  },
  test: {
    // Domain and use-case tests are pure; UI (M4) will opt into jsdom per-file.
    environment: 'node',
    include: ['src/**/*.test.ts', 'src/**/*.test.tsx'],
  },
});
