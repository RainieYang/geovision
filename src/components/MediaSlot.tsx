import { media } from "../content/media";
import type { ReactNode } from "react";
export default function MediaSlot({
  id,
  children,
  className = "",
}: {
  id: string;
  children?: ReactNode;
  className?: string;
}) {
  const asset = media[id];
  return (
    <div
      className={`media-slot ${!asset?.src ? "media-empty" : ""} ${className}`}
      style={{ aspectRatio: asset?.aspectRatio }}
      data-media-id={id}
    >
      {asset?.src &&
        (asset.type === "video" ? (
          <video
            controls
            preload="none"
            poster={asset.poster || undefined}
            aria-label={asset.alt}
            style={{
              objectPosition: asset.objectPosition,
              objectFit: asset.objectFit,
            }}
          >
            <source src={asset.src} />
          </video>
        ) : (
          <img
            src={asset.src}
            alt={asset.alt}
            loading={id === "hero" ? "eager" : "lazy"}
            style={{
              objectPosition: asset.objectPosition,
              objectFit: asset.objectFit,
            }}
          />
        ))}
      {children}
    </div>
  );
}
