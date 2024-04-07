/// <reference types="vitest" />
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@app": path.resolve(__dirname, "src/app"),
      "@data": path.resolve(__dirname, "src/data"),
      "@entities": path.resolve(__dirname, "src/domain/entities"),
      "@usecases": path.resolve(__dirname, "src/domain/usecases"),
      "@lib": path.resolve(__dirname, "src/lib"),
    },
  },
  test: {
    globals: true,
    environment: "jsdom",
    mockReset: true,
    // setupFiles: ['./src/test/setup-mocks.ts'],
  },
});
