import {
  lazy,
  Suspense,
  useEffect,
  useState,
  Component,
  type ReactNode,
} from "react";
import { Routes, Route, NavLink, useLocation, Link } from "react-router-dom";
import { Menu, X, ArrowUpRight } from "lucide-react";
import { Brand, Loading } from "./components/Shared";
import {
  Home,
  Demos,
  Projects,
  About,
  Contact,
  NotFound,
} from "./pages/Marketing";
import { site } from "./content/site";
import { pageMetadata, demoIntroductions } from "./content/pageMetadata";
import { track } from "./runtime/analytics";
import DesktopGate from "./components/DesktopGate";
const GeoDemo = lazy(() => import("./pages/GeoDemo"));
const SpectrumDemo = lazy(() => import("./pages/SpectrumDemo"));
export class ErrorBoundary extends Component<
  { children: ReactNode },
  { error: Error | null }
> {
  state: { error: Error | null } = { error: null };
  static getDerivedStateFromError(error: unknown) {
    return { error: error instanceof Error ? error : new Error(String(error)) };
  }
  render() {
    return this.state.error ? (
      <div className="loading-panel">
        <h2>This workspace could not start.</h2>
        <p>The workspace encountered an error. Reload it to try again.</p>
        {import.meta.env.DEV && (
          <details style={{ maxWidth: "90%", textAlign: "left" }}>
            <summary>Error details</summary>
            <pre style={{ whiteSpace: "pre-wrap", overflowWrap: "anywhere" }}>
              {this.state.error.stack || this.state.error.message}
            </pre>
          </details>
        )}
        <button className="button" onClick={() => window.location.reload()}>
          Try again
        </button>
        <Link to="/demos">Back to demos</Link>
      </div>
    ) : (
      this.props.children
    );
  }
}
export default function App() {
  const pathname = useLocation().pathname.replace(/\/$/, "") || "/";
  const [menu, setMenu] = useState(false);
  const workspace = pathname.startsWith("/demos/");
  useEffect(() => {
    setMenu(false);
    window.scrollTo(0, 0);
    const metadata = pageMetadata(pathname);
    document.title = metadata.title;
    document.querySelectorAll('meta[data-page-seo]').forEach((node) => node.remove());
    for (const [key, value] of Object.entries(metadata.tags)) {
      const attr = key.startsWith("og:") ? "property" : "name";
      const node =
        document.querySelector(`meta[${attr}="${key}"]`) ||
        document.head.appendChild(document.createElement("meta"));
      node.setAttribute(attr, key);
      node.setAttribute("content", value);
      node.setAttribute("data-page-seo", "");
    }
    track("page_view", pathname);
    const canonical =
      document.querySelector('link[rel="canonical"]') ||
      document.head.appendChild(document.createElement("link"));
    if (metadata.canonical) {
      canonical.setAttribute("rel", "canonical");
      canonical.setAttribute("href", metadata.canonical);
    } else canonical.remove();
    document.getElementById("page-structured-data")?.remove();
    if (metadata.structuredData) {
      const script = document.createElement("script");
      script.id = "page-structured-data";
      script.type = "application/ld+json";
      script.textContent = JSON.stringify(metadata.structuredData);
      document.head.appendChild(script);
    }
  }, [pathname]);
  return (
    <>
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <header className={`site-header ${workspace ? "workspace-header" : ""}`}>
        <div className="header-inner">
          <Brand />
          <nav
            className={menu ? "nav open" : "nav"}
            aria-label="Main navigation"
          >
            {[
              ["/", "Home"],
              ["/demos", "Demos"],
              ["/projects", "Projects"],
              ["/about", "About"],
            ].map(([to, label]) => (
              <NavLink end={to === "/"} key={to} to={to}>
                {label}
              </NavLink>
            ))}
          </nav>
          <Link className="contact-nav" to="/contact">
            Let’s talk <ArrowUpRight size={16} />
          </Link>
          <button
            className="menu-button"
            aria-label={menu ? "Close menu" : "Open menu"}
            aria-expanded={menu}
            onClick={() => setMenu(!menu)}
          >
            {menu ? <X /> : <Menu />}
          </button>
        </div>
      </header>
      <main id="main" className={workspace ? "workspace-main" : ""}>
        <ErrorBoundary key={pathname}>
          <Suspense fallback={<Loading />}>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/demos" element={<Demos />} />
              <Route path="/projects" element={<Projects />} />
              <Route path="/about" element={<About />} />
              <Route path="/contact" element={<Contact />} />
              <Route
                path="/demos/geospatial"
                element={
                  <DesktopGate title="Geospatial monitoring" {...demoIntroductions.geospatial}>
                    <GeoDemo />
                  </DesktopGate>
                }
              />
              <Route
                path="/demos/spectrum"
                element={
                  <DesktopGate title="Spectrum analyzer" {...demoIntroductions.spectrum}>
                    <SpectrumDemo />
                  </DesktopGate>
                }
              />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </ErrorBoundary>
      </main>
      {!workspace && (
        <footer className="site-footer">
          <Brand />
          <span>Geospatial. Signal. Real time.</span>
          <span>© {new Date().getFullYear()} GeoVision</span>
          <Link to="/contact">
            Get in touch <ArrowUpRight size={14} />
          </Link>
        </footer>
      )}
    </>
  );
}
