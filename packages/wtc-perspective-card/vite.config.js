import { defineConfig } from 'vite'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))

export default defineConfig({
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.js'),
      name: 'WTCPerspectiveCard',
      formats: ['es', 'umd'],
      fileName: (format) =>
        format === 'es'
          ? 'wtc-perspective-card.js'
          : 'wtc-perspective-card.umd.js'
    },
    outDir: 'dist',
    rollupOptions: {
      output: { exports: 'named' }
    }
  }
})
