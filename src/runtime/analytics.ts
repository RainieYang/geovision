export type AnalyticsEvent =
  | "page_view"
  | "demo_start"
  | "demo_error"
  | "contact_click";
export function track(event: AnalyticsEvent, path: string) {
  if (typeof window === "undefined") return;
  const detail = { event, path, timestamp: new Date().toISOString() };
  window.dispatchEvent(new CustomEvent("geovision:analytics", { detail }));
  try {
    const key = "geovision:session-events";
    const previous = JSON.parse(sessionStorage.getItem(key) || "[]");
    const entries = Array.isArray(previous) ? previous : [];
    sessionStorage.setItem(
      key,
      JSON.stringify([...entries, detail].slice(-100)),
    );
  } catch {
    /* Storage may be disabled. Analytics must never block the app. */
  }
}
