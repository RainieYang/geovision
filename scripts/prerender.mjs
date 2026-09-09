import { createServer } from "vite";
import { readFile, writeFile, mkdir } from "node:fs/promises";
import { resolve } from "node:path";
const escape = (text) =>
  text
    .replaceAll("&", "&amp;")
    .replaceAll('"', "&quot;")
    .replaceAll("<", "&lt;");
const vite = await createServer({
  cacheDir: resolve("node_modules/.vite/prerender"),
  optimizeDeps: { noDiscovery: true, include: [] },
  server: { middlewareMode: true },
  appType: "custom",
});
try {
  const { render, seo, site, media } = await vite.ssrLoadModule(
    "/src/entry-server.tsx",
  );
  const html = await readFile("dist/index.html", "utf8");
  const origin = site.origin.replace(/\/$/, "");
  const social = media["social-default"];
  const socialMeta = social.src
    ? `<meta property="og:image" content="${escape(new URL(social.src, origin).href)}"/><meta property="og:image:alt" content="${escape(social.alt)}"/>`
    : "";
  for (const [path, meta] of Object.entries(seo)) {
    const title = `GeoVision — ${meta.title}`;
    const out = html
      .replace("</head>", socialMeta + "</head>")
      .replace(
        '<div id="root"></div>',
        `<div id="root" data-route="${path === "/" ? "" : path}">${render(path)}</div>`,
      )
      .replace(/<title>.*?<\/title>/, `<title>${escape(title)}</title>`)
      .replace(
        /<meta name="description" content="[^"]*"\s*\/?\s*>/,
        `<meta name="description" content="${escape(meta.description)}"/>`,
      )
      .replace(
        "</head>",
        `<link rel="canonical" href="${escape(origin + path)}"/><meta property="og:title" content="${escape(title)}"/><meta property="og:type" content="website"/><meta property="og:url" content="${escape(origin + path)}"/><meta property="og:description" content="${escape(meta.description)}"/></head>`,
      );
    const dir = resolve("dist", "." + path);
    await mkdir(dir, { recursive: true });
    await writeFile(resolve(dir, "index.html"), out);
  }
  await writeFile("dist/404.html", html);
  await writeFile(
    "dist/robots.txt",
    `User-agent: *\nAllow: /\nSitemap: ${origin}/sitemap.xml\n`,
  );
  await writeFile(
    "dist/sitemap.xml",
    `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${Object.keys(
      seo,
    )
      .map((p) => `<url><loc>${escape(origin + p)}</loc></url>`)
      .join("")}</urlset>`,
  );
  console.log(`Pre-rendered ${Object.keys(seo).length} routes.`);
} finally {
  await vite.close();
}
