import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Mirror the Firebase /en rewrite in local development and production preview.
function englishLandingRewrite() {
  const install = server => { server.middlewares.use((req, _res, next) => {
    if (/^\/en\/?(?:\?|$)/.test(req.url)) {
      req.url = req.url.replace(/^\/en\/?/, '/en/index.html')
    }
    next()
  }) }
  return { name: 'english-landing-rewrite', configureServer: install, configurePreviewServer: install }
}

export default defineConfig(({ mode }) => ({
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/__tests__/setup.js'],
    include: ['src/__tests__/**/*.test.{js,jsx}'],
  },
  plugins: [react(), englishLandingRewrite()],
  server: {
    allowedHosts: true,
  },
  resolve: {
    dedupe: ['react', 'react-dom', 'react-router-dom'],
  },
  base: '/',
  build: {
    outDir: './dist',
    emptyOutDir: true,
    chunkSizeWarningLimit: 1000,
    minify: mode === 'production' ? 'terser' : false,
    terserOptions: mode === 'production' ? {
      compress: { drop_console: true, drop_debugger: true },
    } : undefined,
    rollupOptions: {
      input: { main: 'index.html', en: 'en/index.html' },
      output: {
        manualChunks(id) {
          if (id.includes('node_modules/firebase'))      return 'vendor-firebase'
          if (id.includes('node_modules/react') ||
              id.includes('node_modules/react-dom') ||
              id.includes('node_modules/react-router-dom')) return 'vendor-react'
          if (id.includes('@mediapipe/tasks-vision'))    return 'vision_bundle'
          if (id.includes('@google/generative-ai'))      return 'vendor-gemini'
          if (id.includes('node_modules/'))              return 'vendor-misc'
        },
      },
    },
  },
}))
