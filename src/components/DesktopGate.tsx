import { useSyncExternalStore, type ReactNode } from "react";
import { Link } from "react-router-dom";
import { Monitor } from "lucide-react";
const query = "(min-width: 761px)";
const subscribe = (callback: () => void) => {
  const m = window.matchMedia(query);
  m.addEventListener("change", callback);
  return () => m.removeEventListener("change", callback);
};
export const useDesktop = () =>
  useSyncExternalStore(
    subscribe,
    () => window.matchMedia(query).matches,
    () => false,
  );
export default function DesktopGate({
  children,
  title,
  description,
  features,
}: {
  children: ReactNode;
  title: string;
  description: string;
  features: string[];
}) {
  const desktop = useDesktop();
  return <>{desktop ? (
    children
  ) : (
    <div className="page-container">
      <div className="page-intro">
        <p className="eyebrow">Interactive demo</p>
        <h1>{title}</h1>
      </div>
      <div className="desktop-gate">
        <Monitor size={35} />
        <h2>More room to explore.</h2>
        <p>
          This interactive workspace is best experienced on a desktop. Read
          about the project here, then return on a larger screen to try the full
          demo.
        </p>
        <Link className="button" to="/projects">
          Explore the project
        </Link>
        <Link className="text-link" to="/demos">
          Back to demos →
        </Link>
      </div>
    </div>
  )}<section className="page-container demo-introduction">
    <h2>About this demo</h2>
    <p>{description}</p>
    <ul>{features.map((feature) => <li key={feature}>{feature}</li>)}</ul>
  </section></>;
}
