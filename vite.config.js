import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// The frontend never talks to Anthropic directly — it calls our Express proxy
// (which holds ANTHROPIC_API_KEY) via /api, proxied here in dev.
export default defineConfig({
  plugins: [react()],
  server: {
    port: Number(process.env.VITE_PORT || 5173),
    proxy: {
      '/api': `http://localhost:${process.env.VITE_API_PORT || 8787}`,
    },
  },
})
