import { defineConfig } from 'vite';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export default defineConfig({
  publicDir: resolve(__dirname, 'public'),
  build: {
    outDir: resolve(__dirname, 'dist'),
    emptyOutDir: true,
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        axiovital: resolve(__dirname, 'src/pages/products/axiovital/index.html'),
        autonomousAgent: resolve(__dirname, 'src/pages/products/autonomous-agent/index.html'),
        intelligenceLayer: resolve(__dirname, 'src/pages/products/intelligence-layer/index.html'),
        connect: resolve(__dirname, 'src/pages/products/connect/index.html'),
        acadyk: resolve(__dirname, 'src/pages/products/acadyk/index.html'),
        docs: resolve(__dirname, 'src/pages/docs/index.html'),
        founders: resolve(__dirname, 'src/pages/founders/index.html'),
        contact: resolve(__dirname, 'src/pages/contact/index.html'),
        support: resolve(__dirname, 'src/pages/support/index.html'),
        privacy: resolve(__dirname, 'src/pages/privacy/index.html'),
        terms: resolve(__dirname, 'src/pages/terms/index.html')
      }
    }
  },
  server: {
    port: 8085,
    host: true
  }
});
