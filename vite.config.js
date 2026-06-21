import { defineConfig } from 'vite'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))

export default defineConfig(({ mode }) => {
  if (mode === 'lib') {
    return {
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
    }
  }

  return {
    root: 'demo',
    build: {
      outDir: resolve(__dirname, 'demo/dist'),
      emptyOutDir: true
    }
  }
})
