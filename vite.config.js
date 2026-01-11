import { defineConfig } from 'vite'

export default defineConfig({
  // Base URL untuk deployment
  base: './',
  
  // Build configuration
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    rollupOptions: {
      output: {
        // Pastikan assets tidak di-hash untuk file audio
        assetFileNames: (assetInfo) => {
          if (assetInfo.name.endsWith('.mp3') || assetInfo.name.endsWith('.wav')) {
            return 'assets/[name][extname]'
          }
          return 'assets/[name]-[hash][extname]'
        }
      }
    }
  },
  
  // Public directory untuk file statis
  publicDir: 'public',
  
  // Server configuration untuk development
  server: {
    port: 5173,
    open: true
  }
})
