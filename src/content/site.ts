export const site = {
  name: "GeoVision",
  origin: (import.meta.env.VITE_SITE_URL ||
    "https://geovision-visualization.the43bbbell.chatgpt.site").replace(/\/+$/, ""),
  indexable: import.meta.env.VITE_SEO_INDEXABLE !== "false",
  profile: import.meta.env.VITE_PROFILE_NAME || "",
  email: import.meta.env.VITE_CONTACT_EMAIL || "",
  github: import.meta.env.VITE_GITHUB_URL || "",
  linkedin: import.meta.env.VITE_LINKEDIN_URL || "",
};
export const capabilities = [
  {
    id: "01",
    title: "Geospatial visualization",
    text: "From a global view to a single moving asset.",
    tags: "Cesium · OpenLayers · 2D / 3D",
    icon: "globe",
  },
  {
    id: "02",
    title: "Real-time data",
    text: "Live telemetry, meaningful context.",
    tags: "Streaming · TypedArray · Runtime",
    icon: "radio",
  },
  {
    id: "03",
    title: "Signal visualization",
    text: "Make complex frequency data readable.",
    tags: "Spectrum · Waterfall · WebGL2",
    icon: "activity",
  },
  {
    id: "04",
    title: "Performance by design",
    text: "Built for continuous data and interaction.",
    tags: "GPU rendering · Bounded buffers",
    icon: "cpu",
  },
];
export const demos = [
  {
    id: "geospatial",
    number: "01",
    title: "Geospatial monitoring",
    description:
      "Follow 170 simulated devices across a live 2D / 3D map. Select an asset to inspect its movement and telemetry.",
    tags: ["Cesium", "OpenLayers", "5 Hz updates"],
    path: "/demos/geospatial",
    media: "geospatial-cover",
    label: "MAP ENGINE",
  },
  {
    id: "spectrum",
    number: "02",
    title: "WebGL spectrum analyzer",
    description:
      "Explore changing signals with linked spectrum and waterfall views, peak measurements and trace controls.",
    tags: ["WebGL2", "2,048 points", "30 Hz input"],
    path: "/demos/spectrum",
    media: "spectrum-cover",
    label: "SIGNAL ENGINE",
  },
];
export const projects = [
  {
    title: "A shared foundation for 2D & 3D",
    category: "GEOSPATIAL / SDK",
    media: "map-project",
    problem:
      "Spatial applications need consistent device state across different rendering engines.",
    approach:
      "A map SDK with shared objects, incremental patches, view controls, tracks and replay APIs over Cesium and OpenLayers.",
    contribution:
      "The website integrates the existing Map Engine SDK with a simulated device runtime, selection and telemetry.",
    result:
      "An interactive 170-device monitoring example. All locations and telemetry are simulated.",
    path: "/demos/geospatial",
    tags: ["JavaScript", "Cesium", "OpenLayers"],
  },
  {
    title: "Signals, rendered with clarity",
    category: "SIGNAL VISUALIZATION / SDK",
    media: "signal-project",
    problem:
      "Continuously changing signal data needs responsive rendering and a clear relationship between frequency and time.",
    approach:
      "A WebGL2 core with typed data input, bounded waterfall history, linked charts and a React lifecycle adapter.",
    contribution:
      "The demo integrates spectrum and waterfall, synthetic signal scenarios, Max Hold and measured rendering statistics.",
    result:
      "A live frequency-domain visualization. This demo generates spectrum data; it does not perform IQ-to-FFT processing.",
    path: "/demos/spectrum",
    tags: ["TypeScript", "WebGL2", "React"],
  },
];

