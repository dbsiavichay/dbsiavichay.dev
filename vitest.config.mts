import mdx from "@mdx-js/rollup";
import react from "@vitejs/plugin-react";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

export default defineConfig({
  // MDX compiles before the React plugin sees the JSX it produces.
  plugins: [{ enforce: "pre", ...mdx() }, react()],
  resolve: {
    alias: { "@": fileURLToPath(new URL("./src", import.meta.url)) },
  },
  test: {
    environment: "jsdom",
    // Components link to "/en#section"; starting on /en keeps those same-document.
    environmentOptions: { jsdom: { url: "http://localhost/en" } },
    include: ["tests/unit/**/*.test.{ts,tsx}"],
    setupFiles: ["tests/setup.ts"],
    restoreMocks: true,
  },
});
