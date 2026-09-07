import Link from "next/link";
export function Brand() {
  return (
    <Link href="/" className="brand landing-brand" aria-label="Finora home">
      <span className="brand-mark" aria-hidden="true">
        <i />
        <i />
        <i />
      </span>
      finora<span className="brand-dot">.</span>
    </Link>
  );
}
export { SpectralFlow as Flow } from "./effects/spectral-flow";
