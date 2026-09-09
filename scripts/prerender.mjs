import { createServer } from "vite";
import { readFile, writeFile, mkdir } from "node:fs/promises";
import { resolve } from "node:path";
const escape = (text) =>
  String(text)
    .replaceAll("&", "&amp;")
    .replaceAll('"', "&quot;")
    .replaceAll("<", "&lt;");
const vite = await createServer({
  mode: "production",
  cacheDir: resolve("node_modules/.vite/prerender"),
  optimizeDeps: { noDiscovery: true, include: [] },
  server: { middlewareMode: true },
  appType: "custom",
});
try {
  const { render, seo, site, pageMetadata, canonicalUrl } =
    await vite.ssrLoadModule("/src/entry-server.tsx");
  const origin = new URL(site.origin);
  if (
    !["http:", "https:"].includes(origin.protocol) ||
    origin.pathname !== "/" ||
    origin.search ||
    origin.hash
  ) {
    throw new Error(
      "VITE_SITE_URL must be an HTTP(S) origin without a subdirectory, query or fragment",
    );
  }
  if (process.env.CI && !vite.config.env.VITE_SITE_URL)
    throw new Error(
      "Set VITE_SITE_URL to the public website origin in the hosting environment",
    );
  const template = await readFile("dist/index.html", "utf8");
  if (!template.includes('<div id="root"></div>')) {
    throw new Error(
      "Pre-rendering requires a fresh Vite build. Run pnpm build instead of reusing rendered HTML.",
    );
  }
  const html = template
    .replace(/<title>.*?<\/title>/, "")
    .replace(/<meta\s+name="description"\s+content="[^"]*"\s*\/?\s*>/, "");
  function page(path) {
    const meta = pageMetadata(path);
    const head =
      `<title>${escape(meta.title)}</title>` +
      Object.entries(meta.tags)
        .map(
          ([key, value]) =>
            `<meta data-page-seo ${key.startsWith("og:") ? "property" : "name"}="${key}" content="${escape(value)}"/>`,
        )
        .join("") +
      (meta.canonical
        ? `<link rel="canonical" href="${escape(meta.canonical)}"/>`
        : "") +
      (meta.structuredData
        ? `<script id="page-structured-data" type="application/ld+json">${JSON.stringify(meta.structuredData).replaceAll("<", "\\u003c")}</script>`
        : "");
    return html
      .replace("</head>", `${head}</head>`)
      .replace(
        '<div id="root"></div>',
        `<div id="root" data-route="${path === "/" ? "" : path}">${render(path)}</div>`,
      );
  }
  for (const path of Object.keys(seo)) {
    const dir = resolve("dist", "." + path);
    await mkdir(dir, { recursive: true });
    await writeFile(resolve(dir, "index.html"), page(path));
  }
  await writeFile("dist/404.html", page("/404"));
  await writeFile(
    "dist/robots.txt",
    `User-agent: *\nAllow: /\n${site.indexable ? `Sitemap: ${site.origin}/sitemap.xml\n` : ""}`,
  );
  await writeFile(
    "dist/sitemap.xml",
    `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${Object.keys(
      seo,
    )
      .map((path) => `<url><loc>${escape(canonicalUrl(path))}</loc></url>`)
      .join("")}</urlset>`,
  );
  console.log(
    `Pre-rendered ${Object.keys(seo).length} routes and a noindex 404 page.`,
  );
} finally {
  await vite.close();
}
