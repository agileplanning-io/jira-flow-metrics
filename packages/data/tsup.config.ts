import { defineConfig } from "tsup";

export default defineConfig(({ watch }) => ({
  entry: ["index.ts"],
  outDir: "dist",
  splitting: false,
  sourcemap: true,
  minify: !watch,
  format: ["cjs", "esm"],
}));
