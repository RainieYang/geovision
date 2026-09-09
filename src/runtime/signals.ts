export type Scenario = "single" | "multi" | "interference";
export type SignalSettings = {
  center: number;
  span: number;
  min: number;
  max: number;
  scenario: Scenario;
};
export const signalDefaults: SignalSettings = {
  center: 100,
  span: 20,
  min: -120,
  max: -10,
  scenario: "multi",
};
export function signalFrame(
  settings: SignalSettings,
  t: number,
  points = 2048,
) {
  const values = new Float32Array(points);
  for (let i = 0; i < points; i++) {
    const x = i / (points - 1);
    const noise =
      -108 + Math.sin(i * 1.711 + t) * 2.1 + Math.cos(i * 0.413 - t * 3) * 1.7;
    const peak = (center: number, width: number, height: number) =>
      height * Math.exp(-0.5 * ((x - center) / width) ** 2);
    let power = noise + peak(0.45 + 0.017 * Math.sin(t * 0.35), 0.006, 78);
    if (settings.scenario !== "single")
      power +=
        peak(0.23, 0.004, 42) + peak(0.72, 0.012, 57) + peak(0.84, 0.003, 32);
    if (settings.scenario === "interference" && Math.floor(t / 2) % 2 === 0)
      power += peak(0.56 + 0.025 * Math.sin(t * 2), 0.033, 54);
    values[i] = Math.min(-5, power);
  }
  return {
    values,
    startFrequency: (settings.center - settings.span / 2) * 1e6,
    frequencyStep: (settings.span * 1e6) / (points - 1),
    timestampMs: Date.now(),
    minValue: settings.min,
    maxValue: settings.max,
  };
}
