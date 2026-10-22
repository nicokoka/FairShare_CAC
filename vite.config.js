import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// FairShare is a plain-JavaScript React SPA built with Vite.
export default defineConfig({
  plugins: [react()],
  // Vitest runs the pure logic in src/lib/ (fairness math, insights, exports).
  // Those functions have zero DOM/Firebase dependencies, so the plain Node
  // environment is all they need — fast, and no jsdom to install.
  test: {
    environment: 'node',
    include: ['src/**/*.test.js'],
  },
})
