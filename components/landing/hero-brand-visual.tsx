import Image from "next/image";
/** Photographic lighting plus the exact vector paths from app/icon.svg. */
export function HeroBrandVisual() {
  return (
    <div className="hero-brand-visual" aria-hidden="true">
      <div className="hero-brand-bloom" />
      <div className="hero-brand-artwork">
        <Image
          src="/images/landing/finora-touch.webp"
          alt=""
          width={900}
          height={900}
          sizes="(max-width: 760px) 400px, (max-width: 1100px) 540px, 620px"
          preload
          className="hero-brand-hand"
        />
        <svg
          className="hero-brand-exact-mark"
          viewBox="14 9 36 46"
          fill="currentColor"
        >
          <path d="M16 28l8-4v25l-8 4z" />
          <path d="M28 15l8-4v32l-8 4z" />
          <path d="M40 31l8-4v19l-8 4z" />
        </svg>
      </div>
      <div className="hero-brand-vignette" />
    </div>
  );
}
