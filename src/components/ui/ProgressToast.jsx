'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, CheckCircle2, XCircle, X } from 'lucide-react';
import hotToast from 'react-hot-toast';

const accentMap = {
  loading:  { glow: 'rgba(124,58,237,0.5)', icon: 'text-purple-400' },
  progress: { glow: 'rgba(124,58,237,0.5)', icon: 'text-purple-400' },
  success:  { glow: 'rgba(34,197,94,0.5)',  icon: 'text-green-400' },
  error:    { glow: 'rgba(239,68,68,0.5)',  icon: 'text-red-400' },
};

export default function ProgressToast({ toast: t, data }) {
  if (!data) return null;

  const { type, title, message, progress = 0 } = data;
  const accent = accentMap[type] || accentMap.progress;
  const toastId = t?.id;

  const handleClose = () => {
    if (toastId) hotToast.dismiss(toastId);
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: 60, scale: 0.92 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 60, scale: 0.92 }}
      transition={{ type: 'spring', damping: 24, stiffness: 280, mass: 0.7 }}
      className="w-[400px] max-w-[calc(100vw-32px)] p-[22px] rounded-[24px] border backdrop-blur-2xl shadow-2xl mt-4 mx-4 sm:mt-6 sm:mr-6 sm:ml-auto"
      style={{
        minHeight: '96px',
        background: '#0F0A24',
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
        borderColor: 'rgba(255,255,255,0.08)',
        boxShadow: '0 25px 50px -12px rgba(0,0,0,0.6), 0 0 0 1px rgba(124,58,237,0.08)',
      }}
    >
      <div
        className="absolute inset-0 pointer-events-none rounded-[24px]"
        style={{
          background: 'radial-gradient(ellipse 80% 50% at 50% 0%, rgba(124,58,237,0.10) 0%, transparent 100%)',
        }}
      />

      <button
        onClick={handleClose}
        className="absolute top-3 right-3 z-20 text-white/40 hover:text-white/80 transition-colors"
      >
        <X size={14} strokeWidth={2} />
      </button>

      <div className="flex items-start gap-4 relative z-10">
        <div className="relative flex-shrink-0" style={{ width: '40px', height: '40px' }}>
          <div
            className="absolute inset-0 rounded-[18px]"
            style={{
              background: `radial-gradient(circle, ${accent.glow} 0%, transparent 70%)`,
              filter: 'blur(10px)',
            }}
          />
          <div
            className="w-full h-full rounded-[18px] flex items-center justify-center"
            style={{
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.06)',
            }}
          >
            <AnimatePresence mode="wait" initial={false}>
              {type === 'loading' && (
                <motion.div
                  key="loading"
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.5 }}
                  transition={{ duration: 0.15 }}
                >
                  <Loader2 size={20} className="animate-spin text-purple-400" />
                </motion.div>
              )}
              {type === 'progress' && (
                <motion.div
                  key="progress"
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.5 }}
                  transition={{ duration: 0.15 }}
                >
                  <motion.img
                    src="/images/Lumos.png"
                    alt=""
                    className="w-[70%] h-[70%] object-contain mx-auto"
                    style={{ filter: 'brightness(1.1)' }}
                    animate={{ scale: [1, 1.04, 1] }}
                    transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                  />
                </motion.div>
              )}
              {type === 'success' && (
                <motion.div
                  key="success"
                  initial={{ opacity: 0, scale: 0, rotate: -30 }}
                  animate={{ opacity: 1, scale: 1, rotate: 0 }}
                  exit={{ opacity: 0, scale: 0 }}
                  transition={{ type: 'spring', damping: 14, stiffness: 220 }}
                >
                  <CheckCircle2 size={20} className="text-green-400" />
                </motion.div>
              )}
              {type === 'error' && (
                <motion.div
                  key="error"
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0 }}
                  transition={{ type: 'spring', damping: 14, stiffness: 220 }}
                >
                  <XCircle size={20} className="text-red-400" />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        <div className="flex-1 min-w-0" style={{ paddingTop: '1px' }}>
          <p className="text-[18px] font-semibold text-white leading-tight truncate">
            {title}
          </p>
          <p
            className="text-[14px] font-medium mt-[2px] leading-snug truncate"
            style={{ color: 'rgba(255,255,255,0.65)' }}
          >
            {message}
          </p>
        </div>
      </div>

      <AnimatePresence>
        {type === 'progress' && (
          <motion.div
            initial={{ opacity: 0, y: 6, height: 0 }}
            animate={{ opacity: 1, y: 0, height: 'auto' }}
            exit={{ opacity: 0, y: -4, height: 0 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="relative z-10 overflow-hidden"
            style={{ marginTop: '14px' }}
          >
            <div className="relative" style={{ height: '4px' }}>
              <div
                className="absolute inset-0 rounded-full overflow-hidden"
                style={{ background: 'rgba(255,255,255,0.06)' }}
              />
              <motion.div
                className="absolute inset-y-0 left-0 rounded-full"
                style={{
                  background: 'linear-gradient(90deg, #7C3AED, #8B5CF6, #A855F7)',
                }}
                initial={{ width: '0%' }}
                animate={{ width: `${Math.min(progress, 100)}%` }}
                transition={{ duration: 0.7, ease: 'easeOut' }}
              >
                <div
                  className="absolute right-0 top-1/2 -translate-y-1/2"
                  style={{
                    width: '10px',
                    height: '10px',
                    borderRadius: '50%',
                    background: '#A855F7',
                    boxShadow: '0 0 12px rgba(168,85,247,0.9), 0 0 24px rgba(168,85,247,0.4)',
                    right: '-3px',
                  }}
                />
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
