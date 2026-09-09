import { useEffect, useRef } from "react";
export default function Sparkline({
  values,
  color,
}: {
  values: number[];
  color: string;
}) {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const draw = () => {
      const w = canvas.clientWidth,
        h = canvas.clientHeight,
        dpr = window.devicePixelRatio || 1;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      const c = canvas.getContext("2d");
      if (!c) return;
      c.scale(dpr, dpr);
      c.strokeStyle = "#24343e";
      c.lineWidth = 1;
      for (let y = 10; y < h; y += 20) {
        c.beginPath();
        c.moveTo(0, y);
        c.lineTo(w, y);
        c.stroke();
      }
      if (values.length < 2) return;
      const low = Math.min(...values),
        high = Math.max(...values);
      c.strokeStyle = color;
      c.lineWidth = 1.6;
      c.beginPath();
      values.forEach((v, i) => {
        const x = (i / (values.length - 1)) * w,
          y = h - 8 - ((v - low) / (high - low || 1)) * (h - 16);
        if (i) c.lineTo(x, y);
        else c.moveTo(x, y);
      });
      c.stroke();
    };
    const observer = new ResizeObserver(draw);
    observer.observe(canvas);
    draw();
    return () => observer.disconnect();
  }, [values, color]);
  return (
    <canvas
      ref={ref}
      className="sparkline"
      aria-label="Recent telemetry trend"
    />
  );
}
