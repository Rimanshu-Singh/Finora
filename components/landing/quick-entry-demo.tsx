"use client";
import { useEffect, useRef, useState } from "react";
import { ArrowDown, Check, RotateCcw, Sparkles } from "lucide-react";
import { GlassPanel } from "./effects/glass-panel";
export function QuickEntryDemo() {
  const [playing, setPlaying] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setPlaying(true);
          timer.current = setTimeout(() => setPlaying(false), 2400);
          observer.disconnect();
        }
      },
      { threshold: 0.6 },
    );
    if (root.current) observer.observe(root.current);
    return () => {
      observer.disconnect();
      if (timer.current) clearTimeout(timer.current);
    };
  }, []);
  function replay() {
    if (timer.current) clearTimeout(timer.current);
    setPlaying(true);
    timer.current = setTimeout(
      () => setPlaying(false),
      window.matchMedia("(prefers-reduced-motion: reduce)").matches ? 0 : 2400,
    );
  }
  return (
    <div ref={root} className={`quick-demo ${playing ? "is-parsing" : ""}`}>
      <div className="demo-top">
        <Sparkles size={16} />
        <span>Quick Entry</span>
        <span className="quick-status">FINORA INTELLIGENCE</span>
      </div>
      <GlassPanel className="demo-sentence">
        <span>500 groceries 5 Sep with cash</span>
        <span className="demo-cursor" />
        <i className="parsing-sheen" aria-hidden="true" />
      </GlassPanel>
      <div className="parsing-connector">
        <ArrowDown size={18} />
      </div>
      <GlassPanel className="demo-result">
        <div>
          <small>AMOUNT</small>
          <strong>
            ₹500<span>.00</span>
          </strong>
        </div>
        <span className="demo-check">
          <Check size={13} />
          Ready to review
        </span>
        <dl>
          <div>
            <dt>Category</dt>
            <dd>Groceries</dd>
          </div>
          <div>
            <dt>When</dt>
            <dd>5 Sep</dd>
          </div>
          <div>
            <dt>Paid with</dt>
            <dd>Cash</dd>
          </div>
        </dl>
      </GlassPanel>
      <div className="quick-demo-footer">
        <p>You have the final say.</p>
        <button
          className="quick-replay"
          onClick={replay}
          disabled={playing}
          aria-label="Replay Quick Entry example"
        >
          <RotateCcw size={12} />
          Replay example
        </button>
      </div>
    </div>
  );
}
