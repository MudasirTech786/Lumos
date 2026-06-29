"use client";

import { motion, AnimatePresence, useReducedMotion } from "framer-motion";

/**
 * NavigationProgress
 *
 * Optional thin rainbow progress bar at the very top of the viewport.
 * Inspired by Linear's green bar and Arc's colourful progress.
 * Mounts inside PageTransitionProvider or alongside PageLoader.
 *
 * Usage:
 *   <NavigationProgress isLoading={isLoading} />
 *
 * The bar animates from 0% → ~80% while loading (indeterminate),
 * then shoots to 100% and fades out when done.
 */

const BAR_GRADIENT =
  "linear-gradient(90deg, #3B82F6 0%, #8B5CF6 20%, #EC4899 40%, #EF4444 55%, #F59E0B 70%, #22C55E 85%, #3B82F6 100%)";

export default function NavigationProgress({ isLoading }) {
  const reduced = useReducedMotion();

  return (
    <AnimatePresence>
      {isLoading && (
        <motion.div
          key="nav-progress"
          className="fixed top-0 left-0 right-0 z-[10000] h-[2.5px] overflow-hidden"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.3, delay: 0.1 } }}
        >
          {/* Track */}
          <div className="absolute inset-0 bg-black/5" />

          {/* Animated fill */}
          <motion.div
            className="absolute top-0 left-0 h-full"
            style={{
              background: BAR_GRADIENT,
              backgroundSize: "200% 100%",
              width: "100%",
            }}
            initial={{ x: "-100%" }}
            animate={
              reduced
                ? { x: "0%" }
                : {
                    x: ["-100%", "-25%", "-15%"],
                    backgroundPosition: ["0% 0%", "50% 0%", "100% 0%"],
                  }
            }
            transition={
              reduced
                ? { duration: 0.3 }
                : {
                    duration: 1.8,
                    ease: [0.4, 0, 0.2, 1],
                    times: [0, 0.6, 1],
                  }
            }
          />

          {/* Leading glow dot */}
          {!reduced && (
            <motion.div
              className="absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full"
              style={{
                background:
                  "radial-gradient(circle, rgba(139,92,246,0.9) 0%, rgba(59,130,246,0.5) 60%, transparent 100%)",
                boxShadow: "0 0 8px 2px rgba(139,92,246,0.6)",
              }}
              initial={{ left: "0%" }}
              animate={{ left: "85%" }}
              transition={{
                duration: 1.8,
                ease: [0.4, 0, 0.2, 1],
              }}
            />
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
