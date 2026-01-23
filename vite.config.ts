import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

export default defineConfig({
  server: {
    host: "::",
    port: 8080,
    proxy: {
      '/api/deepgram': {
        target: 'https://api.deepgram.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/deepgram/, ''),
      },
      '/api/openai': {
        target: 'https://api.openai.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/openai/, ''),
      },
      '/api/anthropic': {
        target: 'https://api.anthropic.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/anthropic/, ''),
      },
      '/api/google': {
        target: 'https://generativelanguage.googleapis.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/google/, ''),
      },
      '/api/elevenlabs': {
        target: 'https://api.elevenlabs.io',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/elevenlabs/, ''),
      },
      '/api/playht': {
        target: 'https://api.play.ht',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/playht/, ''),
      },
      '/api/assemblyai': {
        target: 'https://api.assemblyai.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/assemblyai/, ''),
      },
    },
  },
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
