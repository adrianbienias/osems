import { fileURLToPath } from "url"
import { defineConfig } from "vitest/config"

export default defineConfig({
  test: {
    clearMocks: true,
    threads: false,
    alias: {
      "@/": fileURLToPath(new URL("./src/", import.meta.url)),
    },
    exclude: ["node_modules", "e2e-tests"],
    coverage: {
      all: true,
      include: ["src/*"],
      exclude: [
        "**/*.tsx",
        "**/*.test.*",
        "src/libs/types.ts",
        "src/modules/**/index.ts",
      ],
    },
  },
})
