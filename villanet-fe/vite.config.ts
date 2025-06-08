/// <reference types="vitest" />
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    exclude: ["node_modules"],
    maxConcurrency: 1,
    pool: "threads", // or 'forks', whichever works more reliably for you
    deps: {
      optimizer: {
        web: {
          include: ["@mui/material", "@mui/icons-material"],
        },
      },
    },
    coverage: {
      reporter: ["text", "lcov"],
      exclude: [
        "src/App.tsx",
        "eslint.config.js",
        "src/main.tsx",
        "src/common/**",
        "**/*.d.ts",
        "node_modules/**",
        "vite.config.ts",
      ],
    },
  },
});
