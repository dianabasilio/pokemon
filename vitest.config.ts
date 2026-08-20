import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  plugins: [tsconfigPaths(), react()],
  test: {
    environment: "jsdom",
    setupFiles: ["./vitest.setup.ts"],
    globals: true,
    clearMocks: true,
    coverage: {
      provider: "v8",
      reporter: ["text", "html"],
      include: ["app/**/*.{ts,tsx}", "features/**/*.{ts,tsx}"],
      exclude: [
        "**/*.test.{ts,tsx}", // co-located tests: never count as their own coverage target
        "**/*.config.*",
        "app/layout.tsx", // next/font/local wiring only, no testable business logic
        "features/pokemon/types.ts", // type-only, no runtime code
        "**/*.d.ts",
      ],
      thresholds: {
        lines: 80,
        functions: 80,
        branches: 80,
        statements: 80,
      },
    },
  },
});
