import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";

const sitemap = await readFile("dist/sitemap.xml", "utf8");
const urls = [...sitemap.matchAll(/<loc>(.*?)<\/loc>/g)].map(
  (match) => match[1],
);
assert.equal(urls.length, 7, "All seven public pages must be listed");
assert.equal(
  new Set(urls).size,
  urls.length,
  "Sitemap must not contain duplicates",
);
const titles = new Set();
let origin;
let indexable;
function meta(html, name) {
  return [...html.matchAll(/<meta\b[^>]*>/g)].filter(
    ([tag]) =>
      tag.includes(`name="${name}"`) || tag.includes(`property="${name}"`),
  );
}
function content(html, name) {
  const tags = meta(html, name);
  assert.equal(tags.length, 1, `Exactly one ${name} tag required`);
  return tags[0][0].match(/content="([^"]*)"/)?.[1];
}
for (const url of urls) {
  const parsed = new URL(url);
  assert.ok(parsed.protocol === "https:" || parsed.protocol === "http:");
  assert.ok(
    parsed.pathname.endsWith("/"),
    "Canonical directory URLs must end in /",
  );
  origin ??= parsed.origin;
  assert.equal(parsed.origin, origin, "All canonical URLs must use one domain");
  const html = await readFile(
    resolve("dist", `.${parsed.pathname}`, "index.html"),
    "utf8",
  );
  assert.match(html, /<html lang="en">/);
  assert.equal(
    [...html.matchAll(/<h1\b/g)].length,
    1,
    `${url} needs one server-rendered H1`,
  );
  const pageTitles = [...html.matchAll(/<title>(.*?)<\/title>/g)];
  assert.equal(pageTitles.length, 1);
  assert.ok(!titles.has(pageTitles[0][1]), "Page titles must be distinct");
  titles.add(pageTitles[0][1]);
  assert.ok(content(html, "description")?.length > 40);
  assert.equal(content(html, "og:title"), pageTitles[0][1]);
  assert.equal(content(html, "twitter:title"), pageTitles[0][1]);
  assert.equal(content(html, "og:url"), url);
  assert.equal([...html.matchAll(/rel="canonical"/g)].length, 1);
  assert.ok(html.includes(`rel="canonical" href="${url}"`));
  assert.ok(new URL(content(html, "og:image")).pathname.length > 1);
  const robots = content(html, "robots");
  indexable ??= robots.startsWith("index,");
  assert.equal(robots.startsWith("index,"), indexable);
  const data = JSON.parse(
    html.match(
      /<script id="page-structured-data" type="application\/ld\+json">(.*?)<\/script>/s,
    )[1],
  );
  assert.equal(
    data["@graph"].find((item) => item["@type"] === "WebPage").url,
    url,
  );
  if (parsed.pathname.startsWith("/demos/") && parsed.pathname !== "/demos/") {
    assert.match(html, /About this demo/);
    assert.match(html, /<li>.*(?:Switch|Adjust)/);
  }
}
const notFound = await readFile("dist/404.html", "utf8");
assert.equal(content(notFound, "robots"), "noindex, follow");
assert.ok(!notFound.includes('rel="canonical"'));
assert.match(notFound, /<h1/);
const robots = await readFile("dist/robots.txt", "utf8");
assert.ok(robots.includes("Allow: /"));
assert.equal(robots.includes(`Sitemap: ${origin}/sitemap.xml`), indexable);
console.log(
  "SEO checks passed: 7 prerendered pages, metadata, canonical URLs, share tags, structured data, sitemap and 404.",
);
