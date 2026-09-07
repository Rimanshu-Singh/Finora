export function AmbientGlow({
  variant = "mixed",
  className = "",
}: {
  variant?: "cyan" | "violet" | "ice" | "mixed";
  className?: string;
}) {
  return (
    <div
      className={`ambient-glow ambient-${variant} ${className}`}
      aria-hidden="true"
    >
      <i />
      <i />
      <i />
    </div>
  );
}
