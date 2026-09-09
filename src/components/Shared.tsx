import { Link } from "react-router-dom";
import {
  ArrowUpRight,
  ArrowRight,
  Globe2,
  Activity,
  Radio,
  Cpu,
  Layers3,
} from "lucide-react";
import type { ReactNode } from "react";
export const icons = {
  globe: Globe2,
  activity: Activity,
  radio: Radio,
  cpu: Cpu,
};
export function Brand() {
  return (
    <Link to="/" className="brand" aria-label="GeoVision home">
      <Layers3 size={27} strokeWidth={1.6} />
      <span>
        GeoVision<span className="brand-period">.</span>
      </span>
    </Link>
  );
}
export function ButtonLink({
  to,
  children,
  secondary = false,
}: {
  to: string;
  children: ReactNode;
  secondary?: boolean;
}) {
  return (
    <Link className={`button ${secondary ? "button-secondary" : ""}`} to={to}>
      {children}
      <ArrowUpRight size={17} />
    </Link>
  );
}
export function Eyebrow({ children }: { children: ReactNode }) {
  return (
    <p className="eyebrow">
      <span className="tiny-line" />
      {children}
    </p>
  );
}
export function SectionHeading({
  number,
  title,
  description,
  link,
}: {
  number: string;
  title: string;
  description?: string;
  link?: { to: string; label: string };
}) {
  return (
    <div className="section-heading">
      <div>
        <Eyebrow>
          {number} / {title}
        </Eyebrow>
        {description && <h2>{description}</h2>}
      </div>
      {link && (
        <Link className="text-link" to={link.to}>
          {link.label}
          <ArrowRight size={17} />
        </Link>
      )}
    </div>
  );
}
export function Loading({
  label = "Loading interactive workspace…",
}: {
  label?: string;
}) {
  return (
    <div className="loading-panel" role="status">
      <span className="loader" />
      {label}
    </div>
  );
}
export function Metric({
  label,
  value,
  unit,
}: {
  label: string;
  value: ReactNode;
  unit?: string;
}) {
  return (
    <div className="metric">
      <span>{label}</span>
      <strong>
        {value}
        <small>{unit}</small>
      </strong>
    </div>
  );
}
