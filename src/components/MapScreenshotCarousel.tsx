import { useRef, useState } from "react";
import { ArrowUpRight, ChevronLeft, ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";
import { geospatialScreenshots as slides } from "../content/media";

export default function MapScreenshotCarousel({
  to,
  label,
  variant = "card",
}: {
  to: string;
  label: string;
  variant?: "card" | "project";
}) {
  const track = useRef<HTMLDivElement>(null);
  const drag = useRef<{ x: number; left: number } | null>(null);
  const [active, setActive] = useState(0);
  function goTo(index: number) {
    const el = track.current;
    if (!el) return;
    const next = (index + slides.length) % slides.length;
    el.scrollTo({
      left: next * el.clientWidth,
      behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
        ? "instant"
        : "smooth",
    });
  }
  return (
    <div
      className={`demo-media-link ${variant === "project" ? "map-gallery-project" : ""}`}
    >
      <div
        className="media-slot map-gallery"
        role="region"
        aria-roledescription="carousel"
        aria-label="Geospatial screenshots"
      >
        <div
          ref={track}
          className="map-gallery-track"
          tabIndex={0}
          aria-label="Map screenshots. Use left and right arrow keys to browse."
          onScroll={(event) => {
            const el = event.currentTarget;
            setActive(
              Math.max(
                0,
                Math.min(
                  slides.length - 1,
                  Math.round(el.scrollLeft / el.clientWidth),
                ),
              ),
            );
          }}
          onKeyDown={(event) => {
            if (event.key === "ArrowRight" || event.key === "ArrowLeft") {
              event.preventDefault();
              goTo(active + (event.key === "ArrowRight" ? 1 : -1));
            }
          }}
          onPointerDown={(event) => {
            if (event.pointerType !== "mouse" || event.button !== 0) return;
            drag.current = {
              x: event.clientX,
              left: event.currentTarget.scrollLeft,
            };
            event.currentTarget.setPointerCapture(event.pointerId);
            event.currentTarget.style.scrollSnapType = "none";
          }}
          onPointerMove={(event) => {
            if (drag.current)
              event.currentTarget.scrollLeft =
                drag.current.left + drag.current.x - event.clientX;
          }}
          onPointerUp={(event) => {
            if (!drag.current) return;
            const start = Math.round(
              drag.current.left / event.currentTarget.clientWidth,
            );
            const delta = drag.current.x - event.clientX;
            drag.current = null;
            event.currentTarget.style.scrollSnapType = "";
            const next =
              Math.abs(delta) > 40 ? start + Math.sign(delta) : start;
            goTo(Math.max(0, Math.min(slides.length - 1, next)));
          }}
          onPointerCancel={(event) => {
            drag.current = null;
            event.currentTarget.style.scrollSnapType = "";
          }}
        >
          {slides.map((slide, index) => (
            <div
              className="map-gallery-slide"
              key={slide.src}
              role="group"
              aria-roledescription="slide"
              aria-label={`${index + 1} of ${slides.length}: ${slide.label}`}
            >
              <img
                src={slide.src}
                alt={slide.alt}
                loading="lazy"
                draggable={false}
                style={{ objectPosition: slide.objectPosition }}
              />
            </div>
          ))}
        </div>
        <span className="media-index">{label}</span>
        <button
          type="button"
          className="map-gallery-prev"
          aria-label="Previous map screenshot"
          onClick={() => goTo(active - 1)}
        >
          <ChevronLeft size={20} />
        </button>
        <button
          type="button"
          className="map-gallery-next"
          aria-label="Next map screenshot"
          onClick={() => goTo(active + 1)}
        >
          <ChevronRight size={20} />
        </button>
        <div
          className="map-gallery-caption"
          aria-live="polite"
          aria-atomic="true"
        >
          {slides[active].label}{" "}
          <span>
            {active + 1} / {slides.length}
          </span>
        </div>
        <div className="map-gallery-dots" aria-label="Choose map screenshot">
          {slides.map((slide, index) => (
            <button
              key={slide.src}
              type="button"
              aria-label={`Show ${slide.label}`}
              aria-pressed={active === index}
              onClick={() => goTo(index)}
            >
              <span />
            </button>
          ))}
        </div>
        <Link
          to={to}
          className="media-action"
          aria-label="Launch Geospatial monitoring"
        >
          <ArrowUpRight size={25} />
        </Link>
      </div>
    </div>
  );
}
