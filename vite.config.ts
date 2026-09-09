import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import { viteStaticCopy } from "vite-plugin-static-copy";
import { resolve } from "node:path";
export default defineConfig(({ command, mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const localMap = command === "serve" && mode === "local-map";
  const sdkRoot = env.MAP_ENGINE_SOURCE_DIR;
  if (localMap && !sdkRoot)
    throw new Error("MAP_ENGINE_SOURCE_DIR is required for local-map mode");
  return {
    cacheDir: resolve("node_modules/.vite", `${command}-${mode}`),
    resolve: localMap
      ? {
          alias: [
            {
              find: /^map-engine-3d$/,
              replacement: resolve(sdkRoot, "src/compat/LegacyMapEngine.js"),
            },
          ],
          dedupe: ["ol", "cesium"],
        }
      : undefined,
    plugins: [
      react(),
      viteStaticCopy({
        targets: ["Workers", "Assets", "Widgets", "ThirdParty"].map((name) => ({
          src: resolve("node_modules/cesium/Build/Cesium", name).replaceAll(
            "\\",
            "/",
          ),
          dest: "cesium",
        })),
      }),
    ],
    server: {
      host: "127.0.0.1",
      port: 4173,
      strictPort: true,
      ...(localMap ? { fs: { allow: [process.cwd(), sdkRoot] } } : {}),
    },
    build: { chunkSizeWarningLimit: 1600 },
    define: { CESIUM_BASE_URL: JSON.stringify("/cesium/") },
    optimizeDeps: { exclude: ["map-engine-3d"] },
  };
});
