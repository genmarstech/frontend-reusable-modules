import { defineConfig } from "vitest/config";

/**
 * Separate from vitest.config.mts on purpose: these tests make real HTTP
 * requests to a running instance of this app (and, transitively, a
 * running backend) rather than importing and calling functions directly.
 * They require both servers to actually be up — see
 * tests/integration/README.md for exactly how this review ran them.
 */
export default defineConfig({
  test: {
    environment: "node",
    include: ["tests/integration/**/*.test.ts"],
    testTimeout: 15000,
  },
});
