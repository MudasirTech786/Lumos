"use client";

import { motion, AnimatePresence } from "framer-motion";
import LoadingLogo from "@/components/ui/LoadingLogo";

export default function PageLoadingOverlay({ visible, text = "Loading..." }) {
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className="fixed inset-0 z-[99999] flex flex-col items-center justify-center"
          style={{
            background: "rgba(255,255,255,0.72)",
            backdropFilter: "blur(18px)",
            WebkitBackdropFilter: "blur(18px)",
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25, ease: "easeOut" }}
        >
          <LoadingLogo />
          <motion.p
            className="mt-4 text-sm font-medium text-slate-500"
            style={{ letterSpacing: "0.08em" }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeOut", delay: 0.05 }}
          >
            {text}
          </motion.p>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
