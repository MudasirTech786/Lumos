"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";

// ── Rainbow palette — matches the ring on the LUMOS logo artwork ───────────
const PALETTE = [
  "#60a5fa", // blue
  "#a78bfa", // violet
  "#f472b6", // pink
  "#f87171", // red
  "#fbbf24", // amber
  "#4ade80", // green
];
const PROGRESS_GRADIENT = `linear-gradient(90deg, ${PALETTE.join(", ")}, ${PALETTE[0]})`;

export default function LoadingLogo({
  size = 280,
  label = "Initializing LUMOS Workspace",
  progress,          // 0–100, optional. Pass this to drive it from real loading state.
  showProgress = true,
  barWidth,          // defaults to size * 1.35 if not given, matching the reference proportions
} = {}) {
  const isControlled = typeof progress === "number";
  const [autoProgress, setAutoProgress] = useState(0);
  const displayProgress = isControlled
    ? Math.min(100, Math.max(0, progress))
    : autoProgress;

  // Self-driven simulation only when `progress` isn't passed in.
  // Eases up to ~92% and holds so the bar never falsely reads "done".
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
    <div className="flex flex-col items-center">
      <motion.img
        src="/images/loading.png"
        alt="LUMOS Rentals"
        draggable={false}
        width={size}
        height={size}
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.35, ease: "easeOut" }}
        style={{ display: "block", userSelect: "none" }}
      />

      {showProgress && (
        <motion.div
          className="mt-2 flex flex-col items-center select-none"
          style={{ width: barWidth ?? size * 1.35, maxWidth: "80vw" }}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.15, ease: "easeOut" }}
        >

          <div className="w-full flex items-center gap-3">
            <div className="relative flex-1 h-[6px] rounded-full bg-slate-200/70 overflow-hidden">
              <div
                className="h-full rounded-full transition-[width] duration-300 ease-out"
                style={{
                  width: `${displayProgress}%`,
                  backgroundImage: PROGRESS_GRADIENT,
                  backgroundSize: "100% 100%",
                }}
              />
            </div>
            <span className="text-[12px] font-semibold text-slate-500 tabular-nums w-[34px] text-right">
              {Math.round(displayProgress)}%
            </span>
          </div>
        </motion.div>
      )}
    </div>
  );
}