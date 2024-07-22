import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "daypilot-pro-react": "daypilot-pro-react/daypilot-all.min.js",
    },
  },
});
