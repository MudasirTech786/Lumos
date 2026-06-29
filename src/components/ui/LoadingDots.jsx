"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useReducedMotion } from "framer-motion";

/**
 * LoadingDots
 * Renders "Loading" with three dots that appear one by one, looping.
 * Respects prefers-reduced-motion.
 */
export default function LoadingDots() {
  const reduced = useReducedMotion();

  if (reduced) {
    return (
      <p className="text-[13px] font-medium tracking-[0.3em] uppercase text-slate-400 select-none">
        Loading...
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
