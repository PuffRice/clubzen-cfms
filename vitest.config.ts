import { defineConfig } from "vitest/config";
import path from "path";

export default defineConfig({
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "@core": path.resolve(__dirname, "./src"),
    },
  },
  test: {
    globals: true,
    include: ["src/tests/**/*.test.ts"],
    fileParallelism: false,
    testTimeout: 30000,
  },
});
