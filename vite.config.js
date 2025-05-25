import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    outDir: 'dist', // Optional: default is 'dist', you can adjust if needed
  },
  server: {
    // Enable SPA fallback for dev server
    historyApiFallback: true,
  }
});
