import { defineConfig } from "vite";
import { fileURLToPath, URL } from "node:url";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import dts from "vite-plugin-dts";

// Library build — what hosts consume. Emits the kit (ESM + CJS), ONE bundled stylesheet
// (dist/dash-kit.css, from src/index.ts's `import "./dash-kit.css"`) and rolled-up types.
// Mirrors the recipe every `@nube/*` package in the family already uses.
//
// EXTERNALS are the contract, not an optimisation:
//   • react / react-dom — a remote resolves the SHELL's one React through the import map
//     (`defineExtConfig()` externalises the same set). Bundling a second copy is "Invalid hook call".
//   • @tanstack/query-core — the QueryClient class carries a private field, so two copies are two
//     structurally-incompatible types. It is a PEER dep and must never be bundled here.
export default defineConfig({
  plugins: [react(), tailwindcss(), dts({ rollupTypes: true })],
  build: {
    outDir: "dist",
    cssCodeSplit: false,
    lib: {
      entry: fileURLToPath(new URL("./src/index.ts", import.meta.url)),
      name: "NubeDashKit",
      formats: ["es", "cjs"],
      fileName: (fmt) => `dash-kit.${fmt === "es" ? "js" : "cjs"}`,
    },
    rollupOptions: {
      external: [
        "react",
        "react-dom",
        "react/jsx-runtime",
        "react-dom/client",
        "@tanstack/query-core",
        "@tanstack/react-query",
        "@tanstack/react-query-persist-client",
        // Externalised for the same reason React is: an extension resolves these through the shell's
        // import map, and two copies of a Radix primitive mean two portal/context identities.
        "@radix-ui/react-collapsible",
        "@radix-ui/react-dialog",
        "@radix-ui/react-dropdown-menu",
        "@radix-ui/react-tooltip",
        "@radix-ui/react-slot",
        "lucide-react",
      ],
      output: {
        assetFileNames: "dash-kit.[ext]",
        globals: { react: "React", "react-dom": "ReactDOM" },
      },
    },
  },
});
