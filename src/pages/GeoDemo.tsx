import { useState, useRef } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  Pause,
  Play,
  Home,
  Maximize2,
  Navigation,
  Truck,
  Radio,
  Crosshair,
  RotateCcw,
} from "lucide-react";
import MapSurface, { type MapSnapshot } from "../integrations/map/MapSurface";
import { deviceCounts } from "../runtime/devices";
import { localMapService } from "../runtime/mapEnvironment";
import Sparkline from "../components/Sparkline";
import { Metric } from "../components/Shared";
const symbols = { UAV: Navigation, Vehicle: Truck, Sensor: Radio };
export default function GeoDemo() {
  const [mode, setMode] = useState<"2d" | "3d">("3d");
  const [running, setRunning] = useState(true);
  const [filter, setFilter] = useState("All");
  const [selected, setSelected] = useState("UAV-001");
  const [home, setHome] = useState(0);
  const [focus, setFocus] = useState(0);
  const [reset, setReset] = useState(0);
  const [fullError, setFullError] = useState(false);
  const panel = useRef<HTMLDivElement>(null);
  const [data, setData] = useState<MapSnapshot>({
    devices: [],
    history: [],
    fps: 0,
    updateRate: 0,
  });
  const device = data.devices.find((d) => d.id === selected);
  const visible = data.devices.filter(
    (d) => filter === "All" || d.type === filter,
  );
  function choose(id: string) {
    setSelected(id);
    setFocus((x) => x + 1);
  }
  function changeFilter(f: string) {
    setFilter(f);
    if (f !== "All" && device?.type !== f) {
      const first = data.devices.find((d) => d.type === f);
      if (first) setSelected(first.id);
    }
  }
  async function fullscreen() {
    try {
      if (document.fullscreenElement) await document.exitFullscreen();
      else await panel.current?.requestFullscreen();
      setFullError(false);
    } catch {
      setFullError(true);
    }
  }
  return (
    <div className="demo-workspace">
      <div className="workspace-title">
        <div>
          <Link to="/demos" aria-label="Back to demos">
            <ArrowLeft size={18} />
          </Link>
          <span className="workspace-path">DEMOS /</span>
          <h1>Geospatial monitoring</h1>
        </div>
        <span className="simulation-badge">SIMULATED DATA</span>
      </div>
      <div className="mobile-notice">
        Best experienced on desktop. Explore the project overview and return on
        a larger screen for full map controls.{" "}
        <Link to="/projects">View project →</Link>
      </div>
      <div className="geo-workspace" ref={panel}>
        <aside className="device-sidebar">
          <div className="panel-heading">
            <h2>Devices</h2>
            <span>170</span>
          </div>
          <div className="device-filters">
            {["All", "UAV", "Vehicle", "Sensor"].map((f) => (
              <button
                key={f}
                aria-pressed={filter === f}
                className={filter === f ? "selected" : ""}
                onClick={() => changeFilter(f)}
              >
                {f === "All" ? "All devices" : f}
                <span>
                  {f === "All"
                    ? 170
                    : deviceCounts[f as keyof typeof deviceCounts]}
                </span>
              </button>
            ))}
          </div>
          <div className="list-caption">
            <span>DEVICE ID</span>
            <span>STATUS</span>
          </div>
          <div className="device-list">
            {visible.map((d) => {
              const Icon = symbols[d.type];
              return (
                <button
                  key={d.id}
                  className={selected === d.id ? "selected" : ""}
                  onClick={() => choose(d.id)}
                  aria-pressed={selected === d.id}
                >
                  <Icon size={16} />
                  <span>{d.id}</span>
                  <i
                    className={d.status === "Online" ? "online" : "warning"}
                    title={d.status}
                  />
                </button>
              );
            })}
          </div>
          <div className="sidebar-footer">
            <span className="status-dot" />
            {visible.length} visible assets
          </div>
        </aside>
        <div className="geo-center">
          <div className="map-toolbar">
            <div className="segmented">
              {(["2d", "3d"] as const).map((m) => (
                <button
                  key={m}
                  aria-pressed={mode === m}
                  className={mode === m ? "active" : ""}
                  onClick={() => setMode(m)}
                >
                  {m.toUpperCase()}
                </button>
              ))}
            </div>
            <span>
              {localMapService ? "Hong Kong" : "Singapore"} · simulated assets
            </span>
            <div className="toolbar-icons">
              <button
                className="icon-button"
                aria-label="Reset map view"
                onClick={() => setHome(home + 1)}
              >
                <Home size={17} />
              </button>
              <button
                className="icon-button"
                aria-label="Full screen map"
                onClick={fullscreen}
              >
                <Maximize2 size={17} />
              </button>
            </div>
          </div>
          <MapSurface
            key={reset}
            mode={mode}
            running={running}
            filter={filter}
            selected={selected}
            homeKey={home}
            focusKey={focus}
            onSelect={setSelected}
            onSnapshot={setData}
          />
          <div className="map-status-bar">
            <button
              className="icon-button"
              aria-label={running ? "Pause simulation" : "Resume simulation"}
              onClick={() => setRunning(!running)}
            >
              {running ? <Pause size={17} /> : <Play size={17} />}
            </button>
            <button
              className="icon-button"
              aria-label="Restart simulation"
              onClick={() => {
                setReset(reset + 1);
                setRunning(true);
              }}
            >
              <RotateCcw size={16} />
            </button>
            <span className={running ? "live-status" : "paused-status"}>
              <i />
              {running ? "LIVE · SIMULATED" : "PAUSED"}
            </span>
            <span className="terrain-status">
              {localMapService
                ? mode === "2d"
                  ? "Local vector map"
                  : "Local imagery & terrain"
                : import.meta.env.VITE_MAP_TERRAIN_URL
                  ? "Custom terrain"
                  : "Ellipsoid terrain"}
            </span>
          </div>
          {fullError && (
            <p className="inline-error">
              Full screen is unavailable in this browser.
            </p>
          )}
        </div>
        <aside className="telemetry-sidebar">
          <div className="panel-heading">
            <h2>Asset detail</h2>
            <Crosshair size={17} />
          </div>
          {device ? (
            <>
              <div className="asset-name">
                <span>{device.type}</span>
                <h3>{device.id}</h3>
                <small
                  className={
                    device.status === "Online" ? "text-green" : "text-warning"
                  }
                >
                  ● {device.status}
                </small>
              </div>
              <dl className="telemetry-values">
                {[
                  ["Longitude", `${device.longitude.toFixed(5)}°`],
                  ["Latitude", `${device.latitude.toFixed(5)}°`],
                  ["Altitude", `${device.altitude.toFixed(0)} m`],
                  ["Speed", `${device.speed.toFixed(1)} m/s`],
                  ["Heading", `${((device.heading + 360) % 360).toFixed(0)}°`],
                  ["Battery", `${device.battery.toFixed(0)}%`],
                  [
                    "Updated",
                    new Date(device.timestamp).toLocaleTimeString("en-GB", {
                      hour12: false,
                      timeZone: "UTC",
                    }) + " UTC",
                  ],
                ].map(([k, v]) => (
                  <div key={k}>
                    <dt>{k}</dt>
                    <dd>{v}</dd>
                  </div>
                ))}
              </dl>
              <div className="telemetry-trends">
                <h3>Recent telemetry</h3>
                <p>Current session · last 5 min</p>
                {(
                  [
                    ["altitude", "Altitude", "#38bdf8"],
                    ["speed", "Speed", "#65deb3"],
                    ["battery", "Battery", "#f2c36a"],
                  ] as const
                ).map(([key, label, color]) => (
                  <div key={key}>
                    <span style={{ color }}>{label}</span>
                    <Sparkline
                      values={data.history
                        .filter(
                          (_, i) =>
                            i %
                              Math.max(
                                1,
                                Math.ceil(data.history.length / 300),
                              ) ===
                            0,
                        )
                        .map((s) => s[key])}
                      color={color}
                    />
                  </div>
                ))}
              </div>
              <button
                className="button button-secondary locate-button"
                onClick={() => setFocus(focus + 1)}
              >
                Locate asset
                <Crosshair size={15} />
              </button>
            </>
          ) : (
            <p className="empty-detail">
              Select a device to view its telemetry.
            </p>
          )}
        </aside>
      </div>
      <div className="workspace-metrics">
        <Metric label="RENDER FPS" value={Math.round(data.fps)} />
        <Metric label="OBJECTS" value={data.devices.length} />
        <Metric
          label="DATA UPDATES"
          value={running ? data.updateRate.toFixed(1) : "0.0"}
          unit="Hz"
        />
        <div className="workspace-help">
          Select an asset. Pan, zoom and switch perspective.
          <Link to="/contact">
            Build a tracking application
            <ArrowLeft className="arrow-up" size={15} />
          </Link>
        </div>
      </div>
    </div>
  );
}
