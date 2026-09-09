import { describe, it, expect } from "vitest";
import { HistoryBuffer, simulateDevices } from "./devices";
import { signalDefaults, signalFrame } from "./signals";
describe("Device simulation", () => {
  it("preserves identity and stationary sensors while moving assets", () => {
    const a = simulateDevices(0, 0),
      b = simulateDevices(1, 0);
    expect(a).toHaveLength(170);
    expect(new Set(a.map((d) => d.id)).size).toBe(170);
    expect(a.filter((d) => d.type === "Vehicle")).toHaveLength(100);
    expect(b[0].id).toBe(a[0].id);
    expect(b[0].longitude).not.toBe(a[0].longitude);
    expect(b[169].longitude).toBe(a[169].longitude);
  });
  it("bounds history and expires old samples", () => {
    const h = new HistoryBuffer(3, 1000);
    for (let i = 0; i < 8; i++) h.append(simulateDevices(i * 0.2, 0, 1));
    expect(h.get("UAV-001")).toHaveLength(3);
    h.append(simulateDevices(50, 0, 1));
    expect(h.get("UAV-001")).toHaveLength(1);
    h.clear();
    expect(h.get("UAV-001")).toHaveLength(0);
  });
});
describe("Signal generator", () => {
  it("maps first and last bin to requested frequency bounds", () => {
    const f = signalFrame(signalDefaults, 0);
    expect(f.values).toBeInstanceOf(Float32Array);
    expect(f.values.length).toBe(2048);
    expect(f.startFrequency).toBe(90e6);
    expect(f.startFrequency + f.frequencyStep * 2047).toBeCloseTo(110e6);
    const moved = signalFrame(
      { ...signalDefaults, center: 2400, span: 100 },
      0,
    );
    expect(moved.startFrequency).toBe(2350e6);
  });
  it("owns every submitted frame and produces distinct scenarios", () => {
    const a = signalFrame({ ...signalDefaults, scenario: "single" }, 1),
      b = signalFrame(signalDefaults, 1);
    expect(a.values.buffer).not.toBe(b.values.buffer);
    expect(b.values[1474]).toBeGreaterThan(a.values[1474] + 20);
  });
});
