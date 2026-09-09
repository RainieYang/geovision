import { mapCenter } from "./mapEnvironment";
export { mapCenter } from "./mapEnvironment";
export type DeviceType = "UAV" | "Vehicle" | "Sensor";
export type Device = {
  id: string;
  type: DeviceType;
  longitude: number;
  latitude: number;
  altitude: number;
  heading: number;
  speed: number;
  battery: number;
  status: "Online" | "Low battery";
  timestamp: number;
};
export type Sample = {
  position: [number, number, number];
  altitude: number;
  speed: number;
  battery: number;
  timestamp: number;
};
export const deviceCounts = { UAV: 50, Vehicle: 100, Sensor: 20 };
export function simulateDevices(
  t: number,
  epoch: number,
  count = 170,
): Device[] {
  return Array.from({ length: count }, (_, i) => {
    const type: DeviceType = i < 50 ? "UAV" : i < 150 ? "Vehicle" : "Sensor";
    const index = i < 50 ? i : i < 150 ? i - 50 : i - 150;
    const phase =
      i * 2.399963 +
      (type === "Sensor" ? 0 : t * (type === "UAV" ? 0.017 : 0.009));
    const r = 0.012 + (i % 23) * 0.0024;
    const battery = Math.max(18, 98 - (i % 70) - t * 0.001);
    return {
      id: `${type === "Vehicle" ? "VEH" : type.toUpperCase()}-${String(index + 1).padStart(3, "0")}`,
      type,
      longitude: mapCenter[0] + Math.cos(phase) * r,
      latitude: mapCenter[1] + Math.sin(phase) * r * 0.58,
      altitude:
        type === "UAV" ? 250 + (i % 8) * 35 + Math.sin(t * 0.11 + i) * 30 : 5,
      heading: ((phase * 180) / Math.PI + 90) % 360,
      speed:
        type === "Sensor"
          ? 0
          : type === "UAV"
            ? 18 + Math.sin(t * 0.2 + i) * 4
            : 8 + Math.sin(t * 0.12 + i) * 3,
      battery,
      status: battery < 25 ? "Low battery" : "Online",
      timestamp: epoch + t * 1000,
    };
  });
}
export class HistoryBuffer {
  private data = new Map<string, Sample[]>();
  constructor(
    readonly maxPoints = 1500,
    readonly duration = 300000,
  ) {}
  append(devices: Device[]) {
    for (const d of devices) {
      const a = this.data.get(d.id) || [];
      a.push({
        position: [d.longitude, d.latitude, d.altitude],
        altitude: d.altitude,
        speed: d.speed,
        battery: d.battery,
        timestamp: d.timestamp,
      });
      const min = d.timestamp - this.duration;
      let remove = 0;
      while (
        remove < a.length &&
        (a[remove].timestamp < min || a.length - remove > this.maxPoints)
      )
        remove++;
      if (remove) a.splice(0, remove);
      this.data.set(d.id, a);
    }
  }
  get(id: string) {
    return this.data.get(id) || [];
  }
  clear() {
    this.data.clear();
  }
}
