import { useId } from "react";
const path =
  "M-100 300C80 340 160 200 330 235S540 415 755 260 950 320 1100 165 1300 120 1540 10";
export function SpectralFlow({
  className = "",
  node = true,
}: {
  className?: string;
  node?: boolean;
}) {
  const id = useId().replaceAll(":", "");
  return (
    <svg
      className={`spectral-flow ${className}`}
      viewBox="0 0 1440 440"
      fill="none"
      aria-hidden="true"
    >
      <defs>
        <linearGradient
          id={`${id}-line`}
          x1="0"
          y1="360"
          x2="1440"
          y2="60"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="var(--landing-light-cyan)" stopOpacity=".08" />
          <stop offset=".35" stopColor="var(--landing-light-cyan)" />
          <stop offset=".6" stopColor="var(--landing-light-primary)" />
          <stop offset=".85" stopColor="var(--landing-light-violet)" />
          <stop
            offset="1"
            stopColor="var(--landing-light-violet)"
            stopOpacity="0"
          />
        </linearGradient>
        <radialGradient id={`${id}-node`} cx=".35" cy=".2" r=".8">
          <stop stopColor="white" />
          <stop offset=".3" stopColor="var(--landing-light-primary)" />
          <stop offset=".65" stopColor="var(--landing-light-cyan)" />
          <stop offset="1" stopColor="var(--landing-node-shadow)" />
        </radialGradient>
      </defs>
      <path className="flow-bloom-outer" d={path} stroke={`url(#${id}-line)`} />
      <path className="flow-bloom-inner" d={path} stroke={`url(#${id}-line)`} />
      <path className="flow-core" d={path} stroke={`url(#${id}-line)`} />
      {node && (
        <g className="flow-node">
          <circle
            className="node-halo"
            cx="755"
            cy="260"
            r="28"
            fill="var(--landing-light-cyan)"
          />
          <circle
            cx="755"
            cy="260"
            r="10"
            fill={`url(#${id}-node)`}
            stroke="var(--landing-light-primary)"
            strokeWidth=".7"
          />
          <ellipse cx="752" cy="256" rx="4" ry="2" fill="white" opacity=".7" />
        </g>
      )}
    </svg>
  );
}
