import { seo } from "./seo";
import { site } from "./site";
import { media } from "./media";

export function canonicalUrl(path: string) {
  const route = path.replace(/\/+$/, "") || "/";
  return `${site.origin}${route === "/" ? "/" : `${route}/`}`;
}

export function pageMetadata(path: string) {
  const route = path.replace(/\/+$/, "") || "/";
  const info = seo[route];
  const title = `GeoVision — ${info?.title || "Page not found"}`;
  const description =
    info?.description ||
    "This page does not exist. Explore GeoVision projects and interactive demos.";
  const canonical = info ? canonicalUrl(route) : null;
  const image = media["social-default"].src
    ? media["social-default"]
    : media.hero;
  const imageUrl =
    info && image.src ? new URL(image.src, `${site.origin}/`).href : null;
  const tags: Record<string, string> = {
    description,
    robots:
      info && site.indexable
        ? "index, follow, max-image-preview:large"
        : "noindex, follow",
    "og:site_name": site.name,
    "og:type": "website",
    "og:locale": "en_US",
    "og:title": title,
    "og:description": description,
    "twitter:card": imageUrl ? "summary_large_image" : "summary",
    "twitter:title": title,
    "twitter:description": description,
    ...(canonical ? { "og:url": canonical } : {}),
    ...(imageUrl
      ? {
          "og:image": imageUrl,
          "og:image:alt": image.alt,
          "twitter:image": imageUrl,
          "twitter:image:alt": image.alt,
        }
      : {}),
  };
  const graph: Record<string, unknown>[] = info
    ? [
        {
          "@type": "WebSite",
          "@id": `${site.origin}/#website`,
          url: canonicalUrl("/"),
          name: site.name,
          inLanguage: "en",
        },
        {
          "@type": "WebPage",
          "@id": `${canonical}#webpage`,
          url: canonical,
          name: title,
          description,
          inLanguage: "en",
          isPartOf: { "@id": `${site.origin}/#website` },
        },
      ]
    : [];
  if (info && route !== "/") {
    const paths = route.startsWith("/demos/")
      ? ["/", "/demos", route]
      : ["/", route];
    graph.push({
      "@type": "BreadcrumbList",
      itemListElement: paths.map((p, index) => ({
        "@type": "ListItem",
        position: index + 1,
        name: p === "/" ? "Home" : seo[p].title,
        item: canonicalUrl(p),
      })),
    });
  }
  return {
    title,
    tags,
    canonical,
    structuredData: graph.length
      ? { "@context": "https://schema.org", "@graph": graph }
      : null,
  };
}

export const demoIntroductions = {
  geospatial: {
    description:
      "Explore browser-based geospatial monitoring built with Cesium, OpenLayers and the Map Engine SDK. This demonstration uses simulated telemetry for 50 UAVs, 100 vehicles and 20 sensors.",
    features: [
      "Switch between 2D and 3D views while inspecting moving assets.",
      "Select and locate devices, filter asset types, and inspect recent tracks and telemetry.",
      "Pause or restart the simulation. No live equipment is connected.",
    ],
  },
  spectrum: {
    description:
      "Explore real-time RF data visualization with the WebGL2 Signal Visualization SDK. Linked spectrum and waterfall views display synthetic frequency-domain data in 2,048 bins.",
    features: [
      "Adjust center frequency and span, then compare simulated signal scenarios.",
      "Inspect peaks and compare current traces with Max Hold.",
      "Pause and clear the displays. The demo generates spectrum data; it does not capture radio signals or perform an IQ-to-FFT conversion.",
    ],
  },
};
