import path from "node:path";
import { fileURLToPath } from "node:url";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";
import { kbPlugin } from "./kb-plugin";

const here = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(here, "..");

export default defineConfig({
  plugins: [react(), kbPlugin(repoRoot)],
  server: {
    port: 5180,
    strictPort: true,
    host: "127.0.0.1",
    fs: { allow: [here, repoRoot] },
  },
  preview: {
    port: 5180,
    strictPort: true,
    host: "127.0.0.1",
  },
  test: {
    environment: "node",
    include: ["src/**/*.test.ts"],
  },
});
