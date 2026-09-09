import { readFile, writeFile, mkdir, readdir } from "node:fs/promises";
import { execFileSync } from "node:child_process";
import { resolve, join } from "node:path";
const root = resolve(import.meta.dirname, "..");
const mapStage = join(root, "work/map-package");
await mkdir(mapStage, { recursive: true });
execFileSync("tar", [
  "-xf",
  join(root, "vendor/map-engine/map-engine-3d-0.0.24.tgz"),
  "-C",
  mapStage,
]);
const preset = join(mapStage, "package/src/application/presets.js");
await writeFile(
  preset,
  (await readFile(preset, "utf8")).replace(
    /const DEFAULT_TIANDITU_TK = "[^"]*";/,
    'const DEFAULT_TIANDITU_TK = "";',
  ),
);
async function englishWatermark(dir) {
  for (const e of await readdir(dir, { withFileTypes: true })) {
    const p = join(dir, e.name);
    if (e.isDirectory()) await englishWatermark(p);
    else if (e.name.endsWith(".js")) {
      const t = await readFile(p, "utf8");
      const n = t.replace(/watermark = "[^"]*"/g, 'watermark = "GeoVision"');
      if (n !== t) await writeFile(p, n);
    }
  }
}
await englishWatermark(join(mapStage, "package/src"));
execFileSync("tar", [
  "-czf",
  join(root, "vendor/map-engine/map-engine-3d-0.0.24.tgz"),
  "-C",
  mapStage,
  "package",
]);
const signal = join(
  root,
  "work/signal-package/package/dist/signal-visualization.js",
);
let text = await readFile(signal, "utf8");
text = text.replaceAll("频率", "Frequency").replaceAll("功率", "Power");
await writeFile(signal, text);
execFileSync("tar", [
  "-czf",
  join(root, "vendor/signal-visualization/signal-visualization-core-1.2.0.tgz"),
  "-C",
  join(root, "work/signal-package"),
  "package",
]);
console.log(
  "Local vendor archives prepared; upstream source repositories unchanged.",
);
