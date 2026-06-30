"use client";

import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { useEffect, useState, useRef, useCallback } from "react";

/**
 * Sparkles.jsx
 *
 * Renders 0–2 tiny bright points that appear at random angles on the
 * ring band and fade out — pure SVG + Framer Motion, no canvas, no RAF.
 *
 * Driven by setTimeout-chained spawns (not requestAnimationFrame), so it
 * costs nothing when idle and never fights the browser's paint loop.
 * Each sparkle is its own <motion.circle> with an independent
 * mount → animate → unmount lifecycle handled by AnimatePresence.
 *
 * Props:
 *   cx, cy        ring centre (in the SVG's local coordinate space)
 *   rInner, rOuter ring band radii — sparkles spawn within this band
 */
let idCounter = 0;

export default function Sparkles({ cx, cy, rInner, rOuter }) {
  const [sparks, setSparks] = useState([]);
  const reduced = useReducedMotion();
  const timeoutRef = useRef(null);

  const spawn = useCallback(() => {
    const angle  = Math.random() * Math.PI * 2;
    const radius = rInner + (rOuter - rInner) * (0.55 + Math.random() * 0.55);
    const x = cx + Math.cos(angle) * radius;
    const y = cy + Math.sin(angle) * radius;
    const size = 1.1 + Math.random() * 1.3;

    const spark = { id: idCounter++, x, y, size };
    setSparks((prev) => [...prev, spark]);

    // Auto-remove after its animation completes
    setTimeout(() => {
      setSparks((prev) => prev.filter((s) => s.id !== spark.id));
    }, 900);
  }, [cx, cy, rInner, rOuter]);

  useEffect(() => {
    if (reduced) return; // no sparkles in reduced-motion mode

    function scheduleNext() {
      const delay = 1300 + Math.random() * 1100; // 1.3s – 2.4s between spawns
      timeoutRef.current = setTimeout(() => {
        spawn();
        // Occasional companion sparkle shortly after
        if (Math.random() > 0.6) {
          setTimeout(spawn, 150 + Math.random() * 180);
        }
        scheduleNext();
      }, delay);
    }

    scheduleNext();
    return () => clearTimeout(timeoutRef.current);
  }, [spawn, reduced]);

  if (reduced) return null;

  return (
    <g style={{ mixBlendMode: "screen" }}>
      <AnimatePresence>
        {sparks.map((s) => (
          <motion.circle
            key={s.id}
            cx={s.x}
            cy={s.y}
            r={s.size}
            fill="#ffffff"
            filter="url(#sparkleGlow)"
            initial={{ opacity: 0, scale: 0.3 }}
            animate={{ opacity: [0, 1, 0], scale: [0.3, 1.4, 0.8] }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.85, ease: "easeOut", times: [0, 0.25, 1] }}
          />
        ))}
      </AnimatePresence>
    </g>
  );
}
