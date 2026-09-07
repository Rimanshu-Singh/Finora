import type { ReactNode } from "react";
export function GlassPanel({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return <div className={`optical-glass ${className}`}>{children}</div>;
}
