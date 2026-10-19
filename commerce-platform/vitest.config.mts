import path from "node:path";
import { defineConfig } from "vitest/config";

const __dirname = import.meta.dirname;

export default defineConfig({
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      // The real `server-only` package throws unconditionally outside of
      // Next's own build pipeline, which is the only place that aliases it
      // to a no-op on the server side — under plain Vitest there's no such
      // aliasing, so every module that imports it (correctly, to prevent a
      // client-bundle leak in the real app) would fail to even load here.
      // This stub keeps that real protection in the actual Next.js build
      // while letting these modules' own logic be unit-tested directly.
      "server-only": path.resolve(__dirname, "./test/server-only-stub.ts"),
    },
  },
  test: {
    environment: "node",
    // src/ only — tests/integration/ has its own config
    // (vitest.integration.config.mts) and must NOT be picked up here too,
    // or it runs twice under two different configs on a plain `npm run
    // test:unit`, hitting the backend's real auth throttle for no reason.
    //
    // `.test.tsx` added in Phase 3 for the storefront's component tests —
    // esbuild (via Vite) transforms JSX in a .tsx file automatically, and
    // tsconfig.json already sets `jsx: "react-jsx"`, so no new dependency
    // is needed just to pick the extension up.
    include: ["src/**/*.test.ts", "src/**/*.test.tsx"],
  },
});
