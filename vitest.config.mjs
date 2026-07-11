import { defineConfig } from "vitest/config"

export default defineConfig({
  test: { environment: "jsdom", environmentOptions: { jsdom: { url: "http://localhost/" } }, setupFiles: ["./vitest.setup.js"] },
  resolve: { alias: { "@": new URL(".", import.meta.url).pathname } },
})
