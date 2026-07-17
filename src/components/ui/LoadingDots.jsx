"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useReducedMotion } from "framer-motion";
import { useEffect, useState } from "react";

/**
 * LoadingDots
 * Renders "Loading" with three dots that appear one by one, looping.
 * Respects prefers-reduced-motion.
 */
export function LoadingDots() {
  const reduced = useReducedMotion();

  if (reduced) {
    return (
      <p className="text-[13px] font-medium tracking-[0.3em] uppercase text-slate-400 select-none">
        Loadings...
      </p>
    );
  }

  return (
    <div className="flex items-center gap-[3px] select-none">
      <span className="text-[13px] font-medium tracking-[0.3em] uppercase text-slate-400">
        Loading
      </span>
      {[0, 1, 2].map((i) => (
        <motion.span
          key={i}
          className="text-[13px] font-medium tracking-[0.3em] uppercase text-slate-400"
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 1, 0] }}
          transition={{
            duration: 0.9,
            repeat: Infinity,
            repeatDelay: 0,
            delay: i * 0.3,
            ease: "easeInOut",
          }}
        >
          .
        </motion.span>
      ))}
    </div>
  );
}

// ── Rainbow palette — matches the ring on the LUMOS logo / LoadingLogo.jsx ──
const PALETTE = [
  "#60a5fa", // blue
  "#a78bfa", // violet
  "#f472b6", // pink
  "#f87171", // red
  "#fbbf24", // amber
  "#4ade80", // green
];
const PROGRESS_GRADIENT = `linear-gradient(90deg, ${PALETTE.join(", ")}, ${PALETTE[0]})`;

/**
 * LoadingProgress
 * "Initializing LUMOS Workspace" label + rainbow progress bar + percentage,
 * matching the LUMOS boot-screen reference.
 *
 * Controlled: pass `progress` (0–100) to drive it from real loading state.
 * Uncontrolled: omit `progress` and it self-animates up to ~92% and holds
 * there, so it never falsely reads "done" while something is still loading.
 */
export function LoadingProgress({
  label = "Initializing LUMOS Workspace",
  progress,
  width = 380,
}) {
  const reduced = useReducedMotion();
  const isControlled = typeof progress === "number";
  const [autoProgress, setAutoProgress] = useState(0);
  const displayProgress = isControlled
    ? Math.min(100, Math.max(0, progress))
    : autoProgress;

  useEffect(() => {
    if (isControlled) return;
    let raf;
    const start = performance.now();
    const CAP = 92;
    const DURATION = 2600;

    function tick(ts) {
      const t = Math.min((ts - start) / DURATION, 1);
      const eased = 1 - Math.pow(1 - t, 3); // easeOutCubic
      setAutoProgress(Math.min(CAP, eased * CAP));
      if (t < 1) raf = requestAnimationFrame(tick);
    }
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [isControlled]);

  return (
    <motion.div
      className="flex flex-col items-center select-none"
      style={{ width, maxWidth: "80vw" }}
      initial={reduced ? undefined : { opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
    >

      <div className="w-full flex items-center gap-3">
        <div className="relative flex-1 h-[6px] rounded-full bg-slate-200/70 overflow-hidden">
          <div
            className="h-full rounded-full transition-[width] duration-300 ease-out"
            style={{
              width: `${displayProgress}%`,
              backgroundImage: PROGRESS_GRADIENT,
              backgroundSize: "200% 100%",
            }}
          />
        </div>
        <span className="text-[12px] font-semibold text-slate-500 tabular-nums w-[34px] text-right">
          {Math.round(displayProgress)}%
        </span>
      </div>
    </motion.div>
  );
}

// Default export kept as LoadingDots so existing `import LoadingDots from "..."` usages don't break.
export default LoadingDots;