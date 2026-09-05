import { defineConfig, loadEnv } from 'vite'
import { validateBuildEnvironment } from './build/validateEnvironment'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { visualizer } from 'rollup-plugin-visualizer'
import path from 'path'

// Rodar com ANALYZE=1 npm run build para gerar dist/stats.html (treemap interativo)
const analyze = process.env.ANALYZE === '1'

// https://vite.dev/config/
export default defineConfig(({ command, mode }) => {
  const env = loadEnv(mode, process.cwd(), 'VITE_')
  if (command === 'build') validateBuildEnvironment(env.VITE_API_URL)
  return {
    define: {
      'import.meta.env.VITE_APP_VERSION': JSON.stringify(process.env.VERCEL_GIT_COMMIT_SHA ?? env.VITE_APP_VERSION ?? 'unknown'),
    },
    plugins: [
      react(),
      tailwindcss(),
      ...(analyze
        ? [
            visualizer({
              filename: 'dist/stats.html',
              template: 'treemap',
              gzipSize: true,
              brotliSize: true,
              open: true,
            }),
          ]
        : []),
    ],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
  }
})
