import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    // Emulator (10.0.2.2) and physical devices on LAN can reach the dev server.
    host: true,
    port: 5173,
    strictPort: true,
  },
});
