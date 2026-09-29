import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    // Permit temporary zrok review links while retaining Vite's host check.
    allowedHosts: [".shares.zrok.io"],
    proxy: { "/api": "http://localhost:1327" }
  }
});
