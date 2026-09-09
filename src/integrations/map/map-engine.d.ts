declare module "map-engine-3d" {
  export default class MapEngine {
    constructor(options: Record<string, unknown>);
    type: "2d" | "3d";
    engine: any;
    init(): MapEngine;
    destroy(): void;
    resize(): void;
    setState(state: Record<string, unknown>): void;
    applyPatch(patch: Record<string, unknown>): void;
    switchView(type: "2d" | "3d"): void;
    flyTo(view: Record<string, unknown>): void;
    on(event: string, callback: (event: any) => void): void;
    off(event: string, callback: (event: any) => void): void;
    getState(): any;
  }
}
