import { lazy, Suspense, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowUpRight,
  ArrowRight,
  Play,
  X,
  Check,
  Copy,
  Mail,
  Github,
  Linkedin,
  Code2,
  Layers3,
} from "lucide-react";
import {
  ButtonLink,
  Eyebrow,
  SectionHeading,
  icons,
  Loading,
} from "../components/Shared";
import MediaSlot from "../components/MediaSlot";
import MapScreenshotCarousel from "../components/MapScreenshotCarousel";
import { useDesktop } from "../components/DesktopGate";
import { capabilities, demos, projects, site } from "../content/site";
import { track } from "../runtime/analytics";
const HeroMap = lazy(() => import("../integrations/map/HeroMap"));
function DemoCards() {
  return (
    <div className="demo-grid">
      {demos.map((d) => (
        <article className="demo-card" key={d.id}>
          {d.media === "geospatial-cover" ? (
            <MapScreenshotCarousel
              to={d.path}
              label={`${d.number} / ${d.label}`}
            />
          ) : (
            <Link
              to={d.path}
              className="demo-media-link"
              aria-label={`Launch ${d.title}`}
            >
              <MediaSlot id={d.media} />
            </Link>
          )}
          <div className="demo-copy">
            <div className="demo-card-title">
              <h3>
                <Link to={d.path}>{d.title}</Link>
              </h3>
              <span className="live-label">
                <i />
                INTERACTIVE
              </span>
            </div>
            <p>{d.description}</p>
            <div className="card-bottom">
              <div className="tags">
                {d.tags.map((t) => (
                  <span key={t}>{t}</span>
                ))}
              </div>
              <Link className="text-link" to={d.path}>
                Launch
                <ArrowUpRight size={17} />
              </Link>
            </div>
          </div>
        </article>
      ))}
    </div>
  );
}
function ContactBand() {
  return (
    <section className="contact-band">
      <div>
        <Eyebrow>Have a project in mind?</Eyebrow>
        <h2>
          Let’s make your data
          <br />
          <em>work in the real world.</em>
        </h2>
      </div>
      <ButtonLink to="/contact">Discuss a project</ButtonLink>
    </section>
  );
}
export function Home() {
  const [hero, setHero] = useState(false);
  const desktop = useDesktop();
  return (
    <div className="page-container">
      <section className="hero hero--landscape">
        <div className="hero-copy">
          <Eyebrow>GIS · Signal · Web</Eyebrow>
          <h1>
            Real-time
            <br />
            Visualization for
            <br />
            <span>Complex Data.</span>
          </h1>
          <p className="hero-description">
            I build interactive web applications for geospatial tracking, live
            data monitoring, and RF signal visualization.
          </p>
          <div className="hero-actions">
            <ButtonLink to="/demos">Explore demos</ButtonLink>
            <ButtonLink to="/contact" secondary>
              Discuss a project
            </ButtonLink>
          </div>
          <div className="hero-note">
            <span className="status-dot" />
            Two real SDKs. Two hands-on demos.
          </div>
        </div>
        <div className="hero-visual">
          {hero && desktop ? (
            <div className="hero-map-frame">
              <Suspense fallback={<Loading label="Starting 3D scene…" />}>
                <HeroMap />
              </Suspense>
              <button
                className="icon-button hero-close"
                aria-label="Close 3D scene"
                onClick={() => setHero(false)}
              >
                <X size={18} />
              </button>
            </div>
          ) : (
            <MediaSlot id="hero">
              <div className="hero-visual-top">
                <span>GEOSPATIAL / 3D</span>
                <Layers3 size={20} />
              </div>
              {desktop && (
                <button className="scene-start" onClick={() => setHero(true)}>
                  <span className="play-circle">
                    <Play size={20} />
                  </span>
                  <span>
                    Explore a live scene<small>Launch the map SDK</small>
                  </span>
                  <ArrowUpRight size={18} />
                </button>
              )}
              <div className="hero-visual-bottom">
                <span>GEOVISION / CONNECTED WORLD</span>
                <span>ILLUSTRATIVE SCENE</span>
              </div>
            </MediaSlot>
          )}
        </div>
      </section>
      <section className="capabilities">
        {capabilities.map((c) => {
          const Icon = icons[c.icon as keyof typeof icons];
          return (
            <article key={c.id}>
              <div className="capability-top">
                <Icon size={24} strokeWidth={1.5} />
                <span>{c.id}</span>
              </div>
              <h3>{c.title}</h3>
              <p>{c.text}</p>
              <small>{c.tags}</small>
            </article>
          );
        })}
      </section>
      <section className="page-section">
        <SectionHeading
          number="01"
          title="Interactive demos"
          description="Go beyond the screenshot."
          link={{ to: "/demos", label: "Explore all demos" }}
        />
        <DemoCards />
      </section>
      <section className="page-section">
        <SectionHeading
          number="02"
          title="Selected work"
          description="The engineering behind the experience."
          link={{ to: "/projects", label: "View projects" }}
        />
        <div className="project-teasers">
          {projects.map((p, i) => (
            <Link key={p.title} to="/projects" className="project-teaser">
              <span className="project-number">0{i + 1}</span>
              <div>
                <small>{p.category}</small>
                <h3>{p.title}</h3>
                <p>{p.tags.join(" / ")}</p>
              </div>
              <ArrowUpRight size={25} />
            </Link>
          ))}
        </div>
      </section>
      <section className="about-strip">
        <Eyebrow>03 / About</Eyebrow>
        <div>
          <h2>
            At the intersection of
            <br />
            data, maps and graphics.
          </h2>
          <p>
            I develop visualization systems for complex, continuously changing
            data — from moving assets to radio-frequency signals.
          </p>
          <Link className="text-link" to="/about">
            More about my work
            <ArrowRight size={17} />
          </Link>
        </div>
        <div className="stack-list">
          {[
            "TypeScript / React",
            "Cesium / OpenLayers",
            "WebGL / Real-time data",
          ].map((x) => (
            <span key={x}>{x}</span>
          ))}
        </div>
      </section>
      <ContactBand />
    </div>
  );
}
export function Demos() {
  return (
    <div className="page-container">
      <div className="page-intro">
        <Eyebrow>Explore / Interact / Understand</Eyebrow>
        <h1>
          Real data challenges.
          <br />
          <span>Hands-on demonstrations.</span>
        </h1>
        <p>
          Two focused workspaces, powered by my visualization SDKs. Run the
          simulations, change the view and inspect the details.
        </p>
      </div>
      <DemoCards />
      <div className="demo-disclosure">
        <Code2 size={20} />
        <p>
          Both demos use simulated data. The map and charts are rendered live in
          your browser. Full controls are designed for desktop.
        </p>
      </div>
      <ContactBand />
    </div>
  );
}
export function Projects() {
  return (
    <div className="page-container">
      <div className="page-intro">
        <Eyebrow>Selected engineering</Eyebrow>
        <h1>
          Built beneath
          <br />
          <span>the interface.</span>
        </h1>
        <p>Reusable tools for the places and signals that connect our world.</p>
      </div>
      <div className="case-studies">
        {projects.map((p, i) => (
          <article className="case-study" key={p.title}>
            <div>
              {p.media === "map-project" ? (
                <MapScreenshotCarousel
                  to={p.path}
                  label="MAP ENGINE / 2D & 3D"
                  variant="project"
                />
              ) : (
                <MediaSlot id={p.media} />
              )}
              <div className="tags">
                {p.tags.map((t) => (
                  <span key={t}>{t}</span>
                ))}
              </div>
            </div>
            <div>
              <Eyebrow>
                0{i + 1} / {p.category}
              </Eyebrow>
              <h2>{p.title}</h2>
              <dl>
                {[
                  ["The challenge", p.problem],
                  ["The approach", p.approach],
                  ["This demonstration", p.contribution],
                  ["What you can see", p.result],
                ].map(([a, b]) => (
                  <div key={a}>
                    <dt>{a}</dt>
                    <dd>{b}</dd>
                  </div>
                ))}
              </dl>
              <ButtonLink to={p.path}>Open live demo</ButtonLink>
            </div>
          </article>
        ))}
      </div>
      <ContactBand />
    </div>
  );
}
export function About() {
  return (
    <div className="page-container">
      <div className="about-page">
        <div>
          <Eyebrow>About {site.profile || "my work"}</Eyebrow>
          <h1>
            Complex data.
            <br />
            <span>Clear experiences.</span>
          </h1>
          <p className="large-copy">
            I build real-time visualization systems for geospatial, industrial
            and signal data.
          </p>
          <p>
            My focus is the connection between reliable engineering and useful
            interfaces: how data arrives, how it is rendered, and how a person
            makes sense of it.
          </p>
          <p>
            The projects here bring together two existing SDKs — a shared 2D /
            3D map engine and a WebGL signal visualization toolkit.
          </p>
          <ButtonLink to="/projects">Explore the work</ButtonLink>
        </div>
        <MediaSlot id="about" />
      </div>
      <section className="page-section">
        <SectionHeading
          number="01"
          title="Ways to work together"
          description="From an idea to an interactive system."
        />
        <div className="service-grid">
          {[
            [
              "GIS applications",
              "Interactive maps, tracking interfaces and 2D / 3D experiences.",
            ],
            [
              "Live data visualization",
              "Monitoring interfaces that connect data streams to clear visual context.",
            ],
            [
              "Signal visualization",
              "Spectrum and waterfall components integrated into your web application.",
            ],
          ].map(([a, b]) => (
            <article key={a}>
              <ArrowUpRight size={22} />
              <h3>{a}</h3>
              <p>{b}</p>
            </article>
          ))}
        </div>
      </section>
      <ContactBand />
    </div>
  );
}
export function Contact() {
  const [copied, setCopied] = useState(false);
  const [copyError, setCopyError] = useState(false);
  async function copy() {
    try {
      await navigator.clipboard.writeText(site.email);
      setCopied(true);
      setCopyError(false);
    } catch {
      setCopyError(true);
    }
  }
  return (
    <div className="page-container contact-page">
      <div>
        <Eyebrow>Start a conversation</Eyebrow>
        <h1>
          Let’s build
          <br />
          something
          <br />
          <span>that makes sense.</span>
        </h1>
        <p>
          Have a GIS, industrial or signal visualization project? Share the
          problem you’re solving and what a useful outcome looks like.
        </p>
      </div>
      <div className="contact-panel">
        <Mail size={32} strokeWidth={1.3} />
        <h2>Tell me about your project.</h2>
        <p>
          A little context goes a long way: your use case, data sources,
          timeline and the kind of help you need.
        </p>
        {site.email ? (
          <>
            <a
              className="contact-email"
              onClick={() => track("contact_click", "/contact")}
              href={`mailto:${site.email}?subject=GeoVision%20project%20inquiry`}
            >
              {site.email}
              <ArrowUpRight size={20} />
            </a>
            <button className="button button-secondary" onClick={copy}>
              {copied ? <Check size={16} /> : <Copy size={16} />}{" "}
              {copied ? "Email copied" : "Copy email"}
            </button>
            {copyError && (
              <p role="status">
                Copy is unavailable. Select the email address above to copy it
                manually.
              </p>
            )}
          </>
        ) : (
          <p className="contact-pending">
            Direct contact details will be available here soon.
          </p>
        )}
        <div className="social-links">
          {site.github && (
            <a href={site.github} target="_blank" rel="noreferrer">
              <Github size={18} />
              GitHub
              <ArrowUpRight size={15} />
            </a>
          )}
          {site.linkedin && (
            <a href={site.linkedin} target="_blank" rel="noreferrer">
              <Linkedin size={18} />
              LinkedIn
              <ArrowUpRight size={15} />
            </a>
          )}
        </div>
        <div className="contact-meta">
          <span>GIS DEVELOPMENT</span>
          <span>REAL-TIME VISUALIZATION</span>
          <span>SDK INTEGRATION</span>
        </div>
      </div>
    </div>
  );
}
export function NotFound() {
  return (
    <div className="page-container page-intro">
      <Eyebrow>404 / Page not found</Eyebrow>
      <h1>Off the map.</h1>
      <p>This page doesn’t exist.</p>
      <ButtonLink to="/">Back to home</ButtonLink>
    </div>
  );
}
