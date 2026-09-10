export type MediaAsset = {
  type: "image" | "video";
  src: string;
  poster?: string;
  alt: string;
  aspectRatio?: string;
  objectPosition?: string;
  objectFit?: "cover" | "contain";
};
export const geospatialScreenshots = [
  {
    src: "/media/geovision-map-terrain.png",
    label: "3D Terrain",
    alt: "3D mountain terrain with satellite imagery and reservoirs",
    objectPosition: "center 58%",
  },
  {
    src: "/media/geovision-map-2d-light.png",
    label: "2D · Light",
    alt: "Light 2D street map of Shenzhen and the surrounding area",
    objectPosition: "center",
  },
  {
    src: "/media/geovision-map-2d-dark.png",
    label: "2D · Dark",
    alt: "Dark 2D street map of Shenzhen and the surrounding area",
    objectPosition: "center",
  },
];
export const media: Record<string, MediaAsset> = {
  hero: {
    type: "image",
    src: "/media/geovision-hero-terrain.png",
    alt: "Illustration of connected drones, vehicles and sensors across coastal mountain terrain",
    aspectRatio: "16 / 9",
    objectPosition: "center",
  },
  "geospatial-cover": {
    type: "image",
    src: "/media/geovision-map-terrain.png",
    alt: "3D terrain rendered by Map Engine, showing mountains, reservoirs and coastal settlements",
    aspectRatio: "16 / 9",
    objectPosition: "center 58%",
  },
  "spectrum-cover": {
    type: "image",
    src: "/media/geovision-spectrum-waterfall.png",
    alt: "Spectrum analyzer with three marked signal peaks and a frequency-aligned waterfall view",
    aspectRatio: "16 / 9",
    objectFit: "contain",
  },
  "map-project": {
    type: "image",
    src: "/media/geovision-map-terrain.png",
    alt: "Map Engine 3D terrain with satellite imagery over mountains and reservoirs",
    aspectRatio: "16 / 9",
    objectPosition: "center 58%",
  },
  "signal-project": {
    type: "image",
    src: "/media/geovision-spectrum-waterfall.png",
    alt: "Spectrum and waterfall visualization with frequency markers and a power color scale",
    aspectRatio: "16 / 9",
    objectFit: "contain",
  },
  about: {
    type: "image",
    src: "/media/geovision-about-workstation.png",
    alt: "Illustration of a developer workstation with a 3D terrain map, spectrum analyzer and keyboard",
    aspectRatio: "4 / 5",
    objectPosition: "center",
  },
  "social-default": {
    type: "image",
    src: "",
    alt: "GeoVision",
    aspectRatio: "1200 / 630",
  },
};
