import { afterEach, describe, expect, it, vi } from "vitest";

afterEach(() => {
  vi.unstubAllEnvs();
  vi.resetModules();
});
async function metadata(indexable = "true") {
  vi.resetModules();
  vi.stubEnv("VITE_SITE_URL", "https://geovision.example/");
  vi.stubEnv("VITE_SEO_INDEXABLE", indexable);
  return import("./pageMetadata");
}
describe("SEO metadata", () => {
  it("uses the configured domain and one canonical URL for slash variants", async () => {
    const { pageMetadata, canonicalUrl } = await metadata();
    expect(canonicalUrl("/")).toBe("https://geovision.example/");
    expect(pageMetadata("/demos")).toEqual(pageMetadata("/demos/"));
    expect(pageMetadata("/demos").canonical).toBe(
      "https://geovision.example/demos/",
    );
    expect(pageMetadata("/").tags["og:image"]).toMatch(
      /^https:\/\/geovision\.example\/media\//,
    );
  });
  it("marks unknown routes noindex without a canonical or stale page schema", async () => {
    const { pageMetadata } = await metadata();
    const missing = pageMetadata("/not-a-page");
    expect(missing.tags.robots).toBe("noindex, follow");
    expect(missing.canonical).toBeNull();
    expect(missing.structuredData).toBeNull();
    expect(missing.tags["og:url"]).toBeUndefined();
    expect(missing.tags["og:image"]).toBeUndefined();
  });
  it("keeps preview pages out of the index when configured", async () => {
    const { pageMetadata } = await metadata("false");
    expect(pageMetadata("/").tags.robots).toBe("noindex, follow");
    expect(pageMetadata("/demos/spectrum").tags.robots).toBe("noindex, follow");
  });
  it("describes demo hierarchy without inventing personal or review data", async () => {
    const { pageMetadata } = await metadata();
    const graph = pageMetadata("/demos/geospatial").structuredData!["@graph"];
    expect(graph.map((node) => node["@type"])).toEqual([
      "WebSite",
      "WebPage",
      "BreadcrumbList",
    ]);
    const crumbs = graph.find((node) => node["@type"] === "BreadcrumbList")!
      .itemListElement as { position: number; item: string }[];
    expect(crumbs.map((item) => item.position)).toEqual([1, 2, 3]);
    expect(crumbs[1].item).toBe("https://geovision.example/demos/");
  });
});
