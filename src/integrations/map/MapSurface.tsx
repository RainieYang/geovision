import { useEffect, useRef, useState } from "react";
import MapEngine from "map-engine-3d";
import { localMapService } from "../../runtime/mapEnvironment";
import { localMapOptions } from "./localMapOptions";
import { track } from "../../runtime/analytics";
import "ol/ol.css";
import { renderToStaticMarkup } from "react-dom/server";
import { Navigation, Truck, Radio } from "lucide-react";
import {
  simulateDevices,
  mapCenter,
  HistoryBuffer,
  type Device,
  type DeviceType,
  type Sample,
} from "../../runtime/devices";
const mapIcons = { UAV: Navigation, Vehicle: Truck, Sensor: Radio };
const iconCache = new Map<string, string>();
function icon(type: DeviceType, selected: boolean) {
  const key = type + selected;
  let v = iconCache.get(key);
  if (!v) {
    const Icon = mapIcons[type];
    v =
      "data:image/svg+xml;charset=utf-8," +
      encodeURIComponent(
        renderToStaticMarkup(
          <Icon
            color={
              selected
                ? "#ffffff"
                : type === "UAV"
                  ? "#38bdf8"
                  : type === "Vehicle"
                    ? "#65deb3"
                    : "#f2c36a"
            }
            fill="#071016"
            strokeWidth={2}
            size={24}
          />,
        ),
      );
    iconCache.set(key, v);
  }
  return v;
}
export type MapSnapshot = {
  devices: Device[];
  history: Sample[];
  fps: number;
  updateRate: number;
};
export type MapSurfaceProps = {
  mode?: "2d" | "3d";
  running?: boolean;
  selected?: string;
  filter?: string;
  homeKey?: number;
  focusKey?: number;
  compact?: boolean;
  onSelect?: (id: string) => void;
  onSnapshot?: (snapshot: MapSnapshot) => void;
};
export default function MapSurface(props: MapSurfaceProps) {
  const host = useRef<HTMLDivElement>(null);
  const map = useRef<MapEngine | null>(null);
  const current = useRef(props);
  current.current = props;
  const latest = useRef<Device[]>([]);
  const [error, setError] = useState("");
  const [ready, setReady] = useState(false);
  const [tileError, setTileError] = useState(false);
  const [retry, setRetry] = useState(0);
  useEffect(() => {
    let alive = true;
    const request = new AbortController();
    let frame = 0;
    let timer: ReturnType<typeof setInterval> | undefined;
    let instance: MapEngine | undefined;
    let observer: ResizeObserver | undefined;
    let removeFrame: (() => void) | undefined;
    let removeTile: (() => void) | undefined;
    let time = 0;
    let ticks = 0;
    let frames = 0;
    let lastMetric = performance.now();
    let lastSnapshot = 0;
    let fps = 0;
    let rate = 0;
    const epoch = Date.now();
    const history = new HistoryBuffer();
    const visible = new Set<string>();
    const count = props.compact ? 6 : 170;
    function objects(devices: Device[]) {
      return devices.map((d) => ({
        id: d.id,
        type: "marker",
        position: [d.longitude, d.latitude, d.altitude],
        properties: { ...d, name: d.id },
        style: {
          icon: icon(d.type, d.id === current.current.selected),
          iconWidth: d.id === current.current.selected ? 30 : 20,
          iconHeight: d.id === current.current.selected ? 30 : 20,
          iconAnchor: [0.5, 0.5],
          label: {
            show: d.id === current.current.selected,
            text: d.id,
            font: "13px sans-serif",
            fillColor: "#ffffff",
            outlineColor: "#071016",
            outlineWidth: 2,
          },
        },
      }));
    }
    function patch() {
      if (!instance) return;
      const p = current.current;
      const devices = latest.current.filter(
        (d) => !p.filter || p.filter === "All" || d.type === p.filter,
      );
      const next = new Set(devices.map((d) => d.id));
      const all = objects(devices);
      const add = all.filter((x) => !visible.has(x.id)),
        update = all.filter((x) => visible.has(x.id)),
        remove = [...visible].filter((id) => !next.has(id));
      const selectedHistory = history.get(p.selected || "");
      const hasTrack = visible.has("selected-track");
      if (selectedHistory.length >= 2 && next.has(p.selected || "")) {
        const line = {
          id: "selected-track",
          type: "line",
          geometry: { coordinates: selectedHistory.map((s) => s.position) },
          style: {
            color: "#38bdf8",
            strokeWidth: 2,
            dynamicPositions: true,
            clampToGround: false,
          },
          properties: {},
        };
        if (hasTrack) (update as any[]).push(line);
        else (add as any[]).push(line);
        next.add("selected-track");
      } else if (hasTrack && !remove.includes("selected-track"))
        remove.push("selected-track");
      instance.applyPatch({
        add,
        update,
        remove: remove.filter((id) => id !== "selected-track" || !next.has(id)),
      });
      visible.clear();
      next.forEach((id) => visible.add(id));
    }
    function observeRenderer() {
      removeFrame?.();
      removeTile?.();
      frames = 0;
      const engine = instance?.engine;
      if (engine?.viewer) {
        const basemap = engine.viewer.imageryLayers.get(0);
        if (basemap && !localMapService) {
          basemap.brightness = 0.27;
          basemap.saturation = 0;
          basemap.contrast = 1.15;
        }
        removeFrame = engine.viewer.scene.postRender.addEventListener(
          () => frames++,
        );
        const provider = engine.viewer.imageryLayers.get(0)?.imageryProvider;
        removeTile = provider?.errorEvent?.addEventListener(() => {
          if (alive) setTileError(true);
        });
      } else if (engine?.map) {
        const nativeMap = engine.map;
        const cb = () => frames++;
        nativeMap.on("postrender", cb);
        const layer = engine.layerManager
          ?.getBaseLayerIds()
          .map((id: string) => engine.layerManager.getLayer(id))
          .find(Boolean);
        const pre = (e: any) => {
          e.context.save();
          e.context.filter = "grayscale(1) invert(1) brightness(0.6)";
        };
        const post = (e: any) => e.context.restore();
        const sources: any[] = [];
        const collectSources = (candidate: any) => {
          const source = candidate?.getSource?.();
          if (source) sources.push(source);
          candidate?.getLayers?.().getArray().forEach(collectSources);
        };
        collectSources(layer);
        const tileFailed = () => {
          if (alive) setTileError(true);
        };
        sources.forEach((source) => source.on("tileloaderror", tileFailed));
        removeTile = () =>
          sources.forEach((source) => source.un("tileloaderror", tileFailed));
        if (!localMapService) {
          layer?.on("prerender", pre);
          layer?.on("postrender", post);
        }
        removeFrame = () => {
          nativeMap.un("postrender", cb);
          layer?.un("prerender", pre);
          layer?.un("postrender", post);
        };
      }
    }
    function animate() {
      if (!alive) return;
      const now = performance.now();
      if (now - lastMetric >= 1000) {
        fps = (frames * 1000) / (now - lastMetric);
        rate = (ticks * 1000) / (now - lastMetric);
        frames = 0;
        ticks = 0;
        lastMetric = now;
      }
      if (now - lastSnapshot >= 1000 && instance) {
        current.current.onSnapshot?.({
          devices: latest.current,
          history: history.get(current.current.selected || "").slice(),
          fps,
          updateRate: current.current.running === false ? 0 : rate,
        });
        lastSnapshot = now;
      }
      frame = requestAnimationFrame(animate);
    }
    const start = async () => {
      if (!alive || !host.current) return;
      try {
        setReady(false);
        const localOptions = await localMapOptions(request.signal);
        if (!alive || !host.current) return;
        setError("");
        const tileUrl =
          import.meta.env.VITE_MAP_TILE_URL ||
          "https://tile.openstreetmap.org/{z}/{x}/{y}.png";
        const terrain = import.meta.env.VITE_MAP_TERRAIN_URL;
        instance = new MapEngine({
          container: host.current,
          type: current.current.mode || "3d",
          center: mapCenter,
          zoom: 12,
          cameraHeight: props.compact ? 160000 : 21000,
          pitch: -Math.PI / 2,
          preserveViewOnSwitch: true,
          initialFlyDuration: 0,
          controls: false,
          watermark: "",
          baseMapProvider2d: "xyz",
          baseMapProvider3d: "xyz",
          baseMapUrl2d: tileUrl,
          baseMapUrl3d: tileUrl,
          maximumLevel2d: 18,
          maximumLevel3d: 18,
          terrainProvider3d: terrain ? "cesium" : "ellipsoid",
          terrainUrl3d: terrain,
          showAnnotation: false,
          baseMapLanguage: "en",
          ...localOptions,
        });
        map.current = instance;
        instance.init();
        instance.on("object:click", (e) => {
          if (e.id && e.id !== "selected-track")
            current.current.onSelect?.(String(e.id));
        });
        latest.current = simulateDevices(0, epoch, count);
        history.append(latest.current);
        patch();
        observeRenderer();
        observer = new ResizeObserver(() => instance?.resize());
        observer.observe(host.current);
        setReady(true);
        track(
          "demo_start",
          current.current.compact ? "/hero" : "/demos/geospatial",
        );
        current.current.onSnapshot?.({
          devices: latest.current,
          history: [],
          fps: 0,
          updateRate: 0,
        });
        timer = setInterval(() => {
          if (document.hidden) return;
          if (current.current.running !== false) {
            time += 0.2;
            latest.current = simulateDevices(time, epoch, count);
            history.append(latest.current);
            ticks++;
          }
          try {
            patch();
          } catch (e) {
            if (alive)
              setError(e instanceof Error ? e.message : "Map update failed");
          }
        }, 200);
        frame = requestAnimationFrame(animate);
        (instance as any).__observe = observeRenderer;
      } catch (e) {
        instance?.destroy();
        map.current = null;
        if (alive)
          setError(
            e instanceof Error ? e.message : "Map initialization failed",
          );
      }
    };
    const boot = setTimeout(start, 0);
    return () => {
      alive = false;
      request.abort();
      clearTimeout(boot);
      clearInterval(timer);
      cancelAnimationFrame(frame);
      observer?.disconnect();
      removeFrame?.();
      removeTile?.();
      instance?.destroy();
      map.current = null;
      history.clear();
    };
  }, [retry, props.compact]);
  useEffect(() => {
    const instance = map.current;
    if (!instance || !ready || instance.type === props.mode) return;
    try {
      instance.switchView(props.mode || "3d");
      (instance as any).__observe?.();
      setTileError(false);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unable to change map mode");
    }
  }, [props.mode, ready]);
  useEffect(() => {
    if (ready)
      map.current?.flyTo({
        center: mapCenter,
        zoom: 12,
        cameraHeight: props.compact ? 160000 : 21000,
        pitch: -Math.PI / 2,
        duration: 0.5,
      });
  }, [props.homeKey, ready, props.compact]);
  useEffect(() => {
    if (!props.focusKey) return;
    const d = latest.current.find((d) => d.id === props.selected);
    if (d)
      map.current?.flyTo({
        center: [d.longitude, d.latitude],
        zoom: 14,
        cameraHeight: 6500,
        pitch: -Math.PI / 2,
        duration: 0.5,
      });
  }, [props.focusKey, props.selected]);
  return (
    <div className="map-surface">
      <div ref={host} className="map-canvas" data-testid="map-canvas" />
      {!ready && !error && (
        <div className="map-loading" role="status">
          Starting map engine…
        </div>
      )}
      {error && (
        <div className="map-error" role="alert">
          <strong>Map unavailable</strong>
          <p>{error}</p>
          <button
            onClick={() => {
              setError("");
              setRetry(retry + 1);
            }}
            className="button"
          >
            Retry
          </button>
        </div>
      )}
      {tileError && !error && (
        <div className="map-warning" role="status">
          Some map tiles could not load.{" "}
          <button
            onClick={() => {
              setTileError(false);
              setRetry(retry + 1);
            }}
          >
            Retry
          </button>
        </div>
      )}
      <div className="map-attribution">
        {localMapService && props.mode !== "2d" ? (
          <span>Local imagery</span>
        ) : import.meta.env.VITE_MAP_TILE_URL ? (
          <span>
            {import.meta.env.VITE_MAP_ATTRIBUTION || "Custom basemap"}
          </span>
        ) : (
          <a
            href="https://www.openstreetmap.org/copyright"
            target="_blank"
            rel="noreferrer"
          >
            © OpenStreetMap contributors
          </a>
        )}
        <span>Cesium / OpenLayers</span>
      </div>
    </div>
  );
}
