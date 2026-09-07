import Image from "next/image";
import { AmbientGlow } from "./effects/ambient-glow";
import { GrainOverlay } from "./effects/grain-overlay";
import type { ReactNode, CSSProperties } from "react";
type Props = {
  title: string;
  description: string;
  aspectRatio?: string;
  variant?: "quiet" | "illuminated";
  image?: { src: string; darkSrc?: string; alt: string };
  video?: string;
  children?: ReactNode;
};
/** Replace children with image/video props when final product media is available. */
export function ProductVisualPlaceholder({
  title,
  description,
  aspectRatio = "6 / 5",
  variant = "quiet",
  image,
  video,
  children,
}: Props) {
  return (
    <figure
      className={`landing-visual landing-visual-${variant}`}
      style={{ "--visual-ratio": aspectRatio } as CSSProperties}
      aria-label={description}
    >
      <AmbientGlow variant={variant === "illuminated" ? "violet" : "cyan"} />
      <GrainOverlay />
      <div className="landing-visual-content">
        {image ? (
          <>
            <Image
              className={image.darkSrc ? "visual-light-image" : ""}
              src={image.src}
              alt={image.alt}
              fill
              sizes="(max-width: 760px) 90vw, 50vw"
            />
            {image.darkSrc && (
              <Image
                className="visual-dark-image"
                src={image.darkSrc}
                alt={image.alt}
                fill
                sizes="(max-width: 760px) 90vw, 50vw"
              />
            )}
          </>
        ) : video ? (
          <video src={video} controls preload="none" aria-label={description} />
        ) : (
          children || (
            <span className="landing-visual-label">Finora product visual</span>
          )
        )}
      </div>
      <figcaption>
        <span>FINORA / {title}</span>
        <span>{image || video ? "PRODUCT VIEW" : "ILLUSTRATIVE PREVIEW"}</span>
      </figcaption>
    </figure>
  );
}
