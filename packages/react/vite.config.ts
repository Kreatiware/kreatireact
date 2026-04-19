import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import dts from "vite-plugin-dts";
import { resolve } from "path";
import { copyFileSync, mkdirSync, readdirSync } from "fs";

export default defineConfig({
  plugins: [
    react(),
    dts({
      tsconfigPath: "./tsconfig.build.json",
      insertTypesEntry: true,
    }),
    {
      name: "copy-themes",
      closeBundle() {
        const themesDir = resolve(__dirname, "src/themes");
        const outDir = resolve(__dirname, "dist/themes");
        mkdirSync(outDir, { recursive: true });
        for (const file of readdirSync(themesDir)) {
          if (file.endsWith(".css")) {
            copyFileSync(resolve(themesDir, file), resolve(outDir, file));
          }
        }
      },
    },
  ],
  build: {
    lib: {
      entry: resolve(__dirname, "src/index.ts"),
      name: "KreatiReact",
      formats: ["es", "umd"],
      fileName: format => `index.${format === "es" ? "esm" : format}.js`,
    },
    rollupOptions: {
      external: ["react", "react-dom", "@kreatiware/icons"],
      output: {
        globals: {
          react: "React",
          "react-dom": "ReactDOM",
          "@kreatiware/icons": "KreatiIcons",
        },
        banner: '"use client";',
      },
    },
  },
});
