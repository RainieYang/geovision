import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  Play,
  Pause,
  RotateCcw,
  Trash2,
  Activity,
} from "lucide-react";
import {
  SignalChart,
  SignalChartLinkGroup,
  type SignalChartHandle,
  type SpectrumChartOption,
  type WaterfallChartOption,
} from "@signal-visualization/react";
import type {
  SignalChart as CoreChart,
  SignalPerformanceStats,
} from "@signal-visualization/core";
import { signalDefaults, signalFrame, type Scenario } from "../runtime/signals";
import { Metric } from "../components/Shared";
import { track } from "../runtime/analytics";
export default function SpectrumDemo() {
  const spectrum = useRef<SignalChartHandle>(null),
    waterfall = useRef<SignalChartHandle>(null);
  const [running, setRunning] = useState(true);
  const [settings, setSettings] = useState(signalDefaults);
  const [draft, setDraft] = useState(signalDefaults);
  const [hold, setHold] = useState(true);
  const [color, setColor] = useState<"turbo" | "viridis" | "grayscale">(
    "turbo",
  );
  const [error, setError] = useState("");
  const [inputError, setInputError] = useState("");
  const [ready, setReady] = useState(0);
  const [revision, setRevision] = useState(0);
  const [stats, setStats] = useState<SignalPerformanceStats | null>(null);
  const [peak, setPeak] = useState({ frequency: 0, power: -120 });
  const t = useRef(0);
  const frames = useRef(0);
  const [actualRate, setActualRate] = useState(0);
  const linkGroup = useMemo(
    () =>
      new SignalChartLinkGroup({
        view: true,
        crosshair: true,
        selection: false,
      }),
    [],
  );
  const onReady = useCallback(
    (c: CoreChart) => {
      c.link(linkGroup);
      if (c.getOption().type === "spectrum")
        track("demo_start", "/demos/spectrum");
      setReady((x) => x + 1);
    },
    [linkGroup],
  );
  const onError = useCallback((e: Error) => {
    setError(e.message);
    setRunning(false);
    track("demo_error", "/demos/spectrum");
  }, []);
  const spectrumOption = useMemo<SpectrumChartOption>(
    () => ({
      type: "spectrum",
      background: "#09131b",
      xAxis: { name: "Frequency", unit: "MHz" },
      yAxis: {
        name: "Power",
        unit: "dBm",
        min: settings.min,
        max: settings.max,
      },
      spectrum: {
        traces: [
          {
            id: "hold",
            label: "Max Hold",
            mode: "max-hold",
            color: "#e6b65e",
            visible: hold,
            lineWidth: 1,
          },
          {
            id: "current",
            label: "Current",
            mode: "current",
            color: "#38bdf8",
            lineWidth: 1.3,
          },
        ],
        markers: [
          { id: "peak", mode: "peak", label: "Peak", color: "#ecf5f9" },
        ],
        showLegend: false,
        traceControls: false,
      },
      interaction: { zoom: true, pan: true, crosshair: true, tooltip: true },
    }),
    [settings.min, settings.max, hold],
  );
  const waterfallOption = useMemo<WaterfallChartOption>(
    () => ({
      type: "waterfall",
      background: "#09131b",
      xAxis: { name: "Frequency", unit: "MHz" },
      yAxis: { name: "History", unit: "s" },
      waterfall: {
        historyLength: 600,
        minPower: settings.min,
        maxPower: settings.max,
        colorMap: color,
        showColorScale: true,
        colorScaleLabel: "dBm",
        timeMode: "elapsed",
        historyCursor: false,
      },
      interaction: { zoom: true, pan: true, crosshair: true, tooltip: true },
    }),
    [settings.min, settings.max, color],
  );
  useEffect(() => {
    if (!running || error) return;
    let last = performance.now();
    let frameId = 0;
    const tick = (now: number) => {
      if (!document.hidden && now - last >= 1000 / 30) {
        last = now - ((now - last) % (1000 / 30));
        const s = spectrum.current?.getInstance(),
          w = waterfall.current?.getInstance();
        if (s && w) {
          try {
            t.current += 1 / 30;
            const data = signalFrame(settings, t.current);
            s.setData(data);
            w.appendData(data);
            frames.current++;
          } catch (e) {
            onError(e instanceof Error ? e : new Error("Signal stream failed"));
          }
        }
      }
      frameId = requestAnimationFrame(tick);
    };
    frameId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frameId);
  }, [running, settings, ready, revision, error, onError]);
  useEffect(() => {
    let previous = performance.now(),
      before = frames.current;
    const timer = setInterval(() => {
      const now = performance.now();
      setActualRate(((frames.current - before) * 1000) / (now - previous));
      previous = now;
      before = frames.current;
      const s = spectrum.current?.getInstance();
      if (s) {
        setStats(s.getPerformanceStats());
        const m = s.findSpectrumPeaks({ maxResults: 1 })[0];
        if (m) setPeak(m);
      }
    }, 1000);
    return () => clearInterval(timer);
  }, [revision]);
  function clear() {
    spectrum.current?.clear();
    waterfall.current?.clear();
    spectrum.current?.getInstance()?.resetPerformanceStats();
    waterfall.current?.getInstance()?.resetPerformanceStats();
    t.current = 0;
    setStats(null);
    setPeak({ frequency: 0, power: -120 });
  }
  function apply() {
    if (
      ![draft.center, draft.span, draft.min, draft.max].every(
        Number.isFinite,
      ) ||
      draft.span <= 0 ||
      draft.center <= draft.span / 2 ||
      draft.max <= draft.min ||
      draft.span > 10000
    ) {
      setInputError(
        "Use a positive frequency range and a maximum power above the minimum.",
      );
      return;
    }
    clear();
    setSettings({ ...draft });
    spectrum.current?.resetView();
    setInputError("");
  }
  function scenario(value: Scenario) {
    clear();
    setSettings((s) => ({ ...s, scenario: value }));
    setDraft((s) => ({ ...s, scenario: value }));
  }
  function retry() {
    setError("");
    setRevision((x) => x + 1);
    setRunning(true);
  }
  return (
    <div className="demo-workspace spectrum-workspace">
      <div className="workspace-title">
        <div>
          <Link to="/demos" aria-label="Back to demos">
            <ArrowLeft size={18} />
          </Link>
          <span className="workspace-path">DEMOS /</span>
          <h1>WebGL spectrum analyzer</h1>
        </div>
        <span className="simulation-badge">SIMULATED DATA</span>
      </div>
      <div className="mobile-notice">
        Best experienced on desktop. Full frequency and trace controls are
        designed for a larger screen. <Link to="/projects">View project →</Link>
      </div>
      <form
        className="rf-toolbar"
        onSubmit={(e) => {
          e.preventDefault();
          apply();
        }}
      >
        <label>
          Center
          <div>
            <input
              aria-label="Center frequency MHz"
              type="number"
              min="1"
              step="1"
              value={draft.center}
              onChange={(e) =>
                setDraft({ ...draft, center: Number(e.target.value) })
              }
            />
            <span>MHz</span>
          </div>
        </label>
        <label>
          Span
          <div>
            <input
              aria-label="Span MHz"
              type="number"
              min="0.01"
              step="0.01"
              value={draft.span}
              onChange={(e) =>
                setDraft({ ...draft, span: Number(e.target.value) })
              }
            />
            <span>MHz</span>
          </div>
        </label>
        <button className="small-button" type="submit">
          Apply
        </button>
        <div className="rf-toolbar-spacer" />
        <button
          className={`small-button ${running ? "" : "primary"}`}
          type="button"
          onClick={() => setRunning(!running)}
        >
          {running ? <Pause size={15} /> : <Play size={15} />}{" "}
          {running ? "Pause" : "Resume"}
        </button>
        <button
          className="icon-button"
          type="button"
          aria-label="Reset chart view"
          onClick={() => spectrum.current?.resetView()}
        >
          <RotateCcw size={17} />
        </button>
        <button
          className="icon-button"
          type="button"
          aria-label="Clear traces and waterfall"
          onClick={clear}
        >
          <Trash2 size={17} />
        </button>
      </form>
      {inputError && (
        <p className="inline-error" role="alert">
          {inputError}
        </p>
      )}
      <div className="spectrum-layout">
        <div className="charts-column">
          {error ? (
            <div className="loading-panel" role="alert">
              <h2>Signal rendering unavailable</h2>
              <p>{error}</p>
              <button className="button" onClick={retry}>
                Retry WebGL
              </button>
            </div>
          ) : (
            <>
              <section className="chart-panel">
                <div className="chart-heading">
                  <h2>Spectrum</h2>
                  <div>
                    <span className="legend-current">Current</span>
                    {hold && <span className="legend-hold">Max Hold</span>}
                  </div>
                </div>
                <SignalChart
                  key={"s" + revision}
                  ref={spectrum}
                  option={spectrumOption}
                  onReady={onReady}
                  onError={onError}
                  className="signal-chart spectrum-chart"
                />
              </section>
              <section className="chart-panel">
                <div className="chart-heading">
                  <h2>Waterfall</h2>
                  <span>20 seconds · 600 rows</span>
                </div>
                <SignalChart
                  key={"w" + revision}
                  ref={waterfall}
                  option={waterfallOption}
                  onReady={onReady}
                  onError={onError}
                  className="signal-chart waterfall-chart"
                />
              </section>
            </>
          )}
        </div>
        <aside className="signal-sidebar">
          <div className="panel-heading">
            <h2>Signal lab</h2>
            <Activity size={17} />
          </div>
          <section>
            <label className="field-label" htmlFor="scenario">
              SCENARIO
            </label>
            <select
              id="scenario"
              value={settings.scenario}
              onChange={(e) => scenario(e.target.value as Scenario)}
            >
              <option value="single">Single signal</option>
              <option value="multi">Multiple signals</option>
              <option value="interference">Intermittent interference</option>
            </select>
            <p className="sidebar-hint">
              Synthetic frequency-domain data. No hardware connection required.
            </p>
          </section>
          <section>
            <h3>Measurements</h3>
            <dl className="telemetry-values">
              <div>
                <dt>Peak frequency</dt>
                <dd>
                  {peak.frequency ? (peak.frequency / 1e6).toFixed(3) : "—"}{" "}
                  <small>MHz</small>
                </dd>
              </div>
              <div>
                <dt>Peak power</dt>
                <dd>
                  {stats ? peak.power.toFixed(1) : "—"} <small>dBm</small>
                </dd>
              </div>
              <div>
                <dt>Frequency bins</dt>
                <dd>2,048</dd>
              </div>
            </dl>
          </section>
          <section>
            <h3>Display</h3>
            <label className="toggle-label">
              Max Hold
              <input
                type="checkbox"
                checked={hold}
                onChange={(e) => setHold(e.target.checked)}
              />
            </label>
            <label className="field-label" htmlFor="color-map">
              COLOR MAP
            </label>
            <select
              id="color-map"
              value={color}
              onChange={(e) => setColor(e.target.value as typeof color)}
            >
              <option value="turbo">Turbo</option>
              <option value="viridis">Viridis</option>
              <option value="grayscale">Grayscale</option>
            </select>
            <div className="power-inputs">
              <label>
                Min / dBm
                <input
                  type="number"
                  value={draft.min}
                  onChange={(e) =>
                    setDraft({ ...draft, min: Number(e.target.value) })
                  }
                />
              </label>
              <label>
                Max / dBm
                <input
                  type="number"
                  value={draft.max}
                  onChange={(e) =>
                    setDraft({ ...draft, max: Number(e.target.value) })
                  }
                />
              </label>
            </div>
            <button className="small-button full-width" onClick={apply}>
              Apply display range
            </button>
          </section>
          <section className="signal-help">
            <p>
              Scroll to zoom. Drag to pan.
              <br />
              Hover to inspect a sample.
            </p>
            <span>Linked frequency views</span>
          </section>
        </aside>
      </div>
      <div className="workspace-metrics">
        <Metric
          label="DATA INPUT"
          value={running ? actualRate.toFixed(1) : "0.0"}
          unit="Hz"
        />
        <Metric
          label="RENDER FPS"
          value={running ? (stats?.renderFps || 0).toFixed(0) : "0"}
        />
        <Metric
          label="CPU DRAW / P95"
          value={(stats?.p95RenderTimeMs || 0).toFixed(2)}
          unit="ms"
        />
        <div className="workspace-help">
          <span className={running ? "live-status" : "paused-status"}>
            <i />
            {running ? "LIVE · SIMULATED" : "PAUSED"}
          </span>
          <Link to="/contact">Discuss signal visualization →</Link>
        </div>
      </div>
    </div>
  );
}
