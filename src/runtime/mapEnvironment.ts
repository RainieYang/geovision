// Local service settings are only active in the explicit development mode.
export const localMapService =
  import.meta.env.DEV && import.meta.env.MODE === "local-map"
    ? (import.meta.env.VITE_LOCAL_MAP_SERVICE_URL || "").replace(/\/$/, "")
    : "";
export const mapCenter: [number, number] = localMapService
  ? [114.143562, 22.355084]
  : [103.82, 1.34];
