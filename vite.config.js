// vite.config.js

// ✅ Log the env var at build time
console.log('🧪 VITE_APP_PASSWORD (build time):', process.env.VITE_APP_PASSWORD);

import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000
  }
});
