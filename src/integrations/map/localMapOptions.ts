import { localMapService } from "../../runtime/mapEnvironment";

export async function localMapOptions(
  signal: AbortSignal,
): Promise<Record<string, unknown>> {
  if (!localMapService) return {};
  const response = await fetch(`${localMapService}/data/china-ethiopia.json`, {
    signal,
  });
  if (!response.ok)
    throw new Error(`Local map service returned HTTP ${response.status}`);
  const data = await response.json();
  if (!data.tiles?.length)
    throw new Error("Local map service has no vector tile sources");
  const imagery = `${localMapService}/MapServer/mbtiles/xianggang_map/{x}/{y}/{z}?v=20260720-global-fallback-v2`;
  return {
    preserveViewOnSwitch2d: true,
    preserveViewOnSwitch3d: true,
    baseMapProvider2d: "mvt",
    baseMapUrl2d: data.tiles[0],
    minimumLevel2d: data.minzoom,
    maximumLevel2d: data.maxzoom,
    localVectorServiceUrl: localMapService,
    localVectorStyle: "military",
    localVectorDataMaxZoom: data.maxzoom,
    localVectorZoomCoverage: data.zoom_coverage,
    baseMapProvider3d: "xyz",
    baseMapUrl3d: imagery,
    minimumLevel3d: 0,
    maximumLevel3d: 10,
    overlayLayers3d: [
      {
        id: "local-imagery-detail",
        provider: "xyz",
        url: imagery,
        minimumLevel: 0,
        maximumLevel: 18,
        bounds: [113.839859, 22.151076, 114.447264, 22.559092],
        zIndex: 1,
      },
    ],
    terrainProvider3d: "cesium",
    terrainUrl3d: `${localMapService}/DemServer/pak/xianggang_terrain`,
  };
}
