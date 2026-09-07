import { GlassPanel } from "./glass-panel";
export function FinoraLightMark() {
  return (
    <div className="finora-light-event" aria-hidden="true">
      <div className="mark-aura" />
      <GlassPanel className="finora-light-mark">
        <span className="light-mark-bars">
          <i />
          <i />
          <i />
        </span>
        <span className="mark-specular" />
      </GlassPanel>
      <span className="mark-reflection" />
    </div>
  );
}
