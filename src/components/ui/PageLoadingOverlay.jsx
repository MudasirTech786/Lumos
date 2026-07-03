"use client";

import { motion, AnimatePresence } from "framer-motion";
import LoadingLogo from "@/components/ui/LoadingLogo";

export default function PageLoadingOverlay({ visible, overlayRect, text = "Loading..." }) {
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className="fixed z-[99999] flex items-center justify-center"
          style={{
            left: overlayRect?.left ?? 0,
            top: overlayRect?.top ?? 0,
            width: overlayRect?.width ?? "100%",
            height: overlayRect?.height ?? "100%",
            background: "rgba(255,255,255,0.72)",
            backdropFilter: "blur(18px)",
            WebkitBackdropFilter: "blur(18px)",
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25, ease: "easeOut" }}
        >
          <div
            className="absolute pointer-events-none"
            style={{
              width: 600,
              height: 600,
              background: "radial-gradient(circle, rgba(37,99,235,0.10), transparent 60%)",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
            }}
          />
          <div className="relative flex flex-col items-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
            >
              <LoadingLogo />
            </motion.div>
            <motion.p
              className="mt-5 text-sm font-medium text-slate-500"
              style={{ letterSpacing: "0.08em" }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25, ease: "easeOut", delay: 0.05 }}
            >
              {text}
            </motion.p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
