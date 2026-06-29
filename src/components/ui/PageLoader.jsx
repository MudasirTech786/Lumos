"use client";

import { motion, AnimatePresence } from "framer-motion";
import LoadingLogo from "./LoadingLogo";
import LoadingDots from "./LoadingDots";

/**
 * PageLoader
 *
 * Full-screen overlay. Mounted at root level via PageTransitionProvider.
 * Controlled by `isLoading` boolean.
 *
 * Design:
 * - White background with very subtle radial gradient
 * - Logo centred perfectly
 * - Animated rings on the O (via LoadingLogo)
 * - Animated loading dots below
 * - Smooth fade in/out via AnimatePresence
 */

const overlayVariants = {
  hidden: {
    opacity: 0,
    transition: {
      duration: 0.22,
      ease: [0.4, 0, 0.2, 1],
    },
  },
  visible: {
    opacity: 1,
    transition: {
      duration: 0.2,
      ease: [0.4, 0, 0.2, 1],
    },
  },
};

const contentVariants = {
  hidden: {
    opacity: 0,
    scale: 0.97,
    transition: { duration: 0.18, ease: "easeIn" },
  },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.24, ease: [0.16, 1, 0.3, 1], delay: 0.06 },
  },
};

export default function PageLoader({ isLoading }) {
  return (
    <AnimatePresence mode="wait">
      {isLoading && (
        <motion.div
          key="page-loader"
          className="fixed inset-0 z-[9999] flex items-center justify-center backdrop-blur-sm"
          variants={overlayVariants}
          initial="hidden"
          animate="visible"
          exit="hidden"
          // Prevent interaction with page beneath
          aria-hidden="true"
        >
          {/* BACKGROUND */}
          <div
            className="absolute inset-0 bg-white"
            style={{
              background:
                "radial-gradient(ellipse 70% 60% at 50% 44%, rgba(240,245,255,0.9) 0%, #ffffff 70%)",
            }}
          />

          {/* CONTENT */}
          <motion.div
            className="relative z-10 flex flex-col items-center gap-14"
            variants={contentVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
          >
            <LoadingLogo />
            <LoadingDots />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
