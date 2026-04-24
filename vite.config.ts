import { defineConfig } from 'vite';
import { resolve }      from 'path';

export default defineConfig({
  root: '.',
  build: {
    outDir:      'www/dist',
    emptyOutDir: true,
    rollupOptions: {
      input:    resolve(__dirname, 'index.html'),
      external: ['cordova']
    }
  },
  resolve: {
    alias: { '@': resolve(__dirname, 'src') }
  }
});
