'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useCallback, useRef } from 'react';
import {
  Trash2, AlertTriangle, Info, CheckCircle,
  LogOut, Archive, RotateCcw, Send, RefreshCw,
} from 'lucide-react';

// ── Variant configuration ────────────────────────────────────────────────────
// Matches the LUMOS design system: soft pastel icon chips (blue-100/purple-100/
// green-100/amber-100 style), solid-color top accent bar (same idea as the
// stat-card top borders on Platform Users), blue-600 as the default primary.
const VARIANTS = {
  danger: {
    Icon: Trash2,
    color: '#DC2626',
    hoverColor: '#B91C1C',
    ring: 'rgba(220,38,38,0.16)',
    iconBg: '#FEF2F2',
    iconColor: '#DC2626',
    loadingText: 'Deleting...',
  },
  warning: {
    Icon: AlertTriangle,
    color: '#D97706',
    hoverColor: '#B45309',
    ring: 'rgba(217,119,6,0.16)',
    iconBg: '#FFFBEB',
    iconColor: '#D97706',
    loadingText: 'Processing...',
  },
  success: {
    Icon: CheckCircle,
    color: '#059669',
    hoverColor: '#047857',
    ring: 'rgba(5,150,105,0.16)',
    iconBg: '#F0FDF4',
    iconColor: '#059669',
    loadingText: 'Publishing...',
  },
  info: {
    Icon: Info,
    color: '#2563EB',
    hoverColor: '#1D4ED8',
    ring: 'rgba(37,99,235,0.16)',
    iconBg: '#EFF6FF',
    iconColor: '#2563EB',
    loadingText: 'Please wait...',
  },
  logout: {
    Icon: LogOut,
    color: '#2563EB',
    hoverColor: '#1D4ED8',
    ring: 'rgba(37,99,235,0.16)',
    iconBg: '#EFF6FF',
    iconColor: '#2563EB',
    loadingText: 'Signing out...',
  },
  archive: {
    Icon: Archive,
    color: '#D97706',
    hoverColor: '#B45309',
    ring: 'rgba(217,119,6,0.16)',
    iconBg: '#FFFBEB',
    iconColor: '#D97706',
    loadingText: 'Archiving...',
  },
  reset: {
    Icon: RotateCcw,
    color: '#7C3AED',
    hoverColor: '#6D28D9',
    ring: 'rgba(124,58,237,0.16)',
    iconBg: '#F5F3FF',
    iconColor: '#7C3AED',
    loadingText: 'Resetting...',
  },
  publish: {
    Icon: Send,
    color: '#059669',
    hoverColor: '#047857',
    ring: 'rgba(5,150,105,0.16)',
    iconBg: '#F0FDF4',
    iconColor: '#059669',
    loadingText: 'Publishing...',
  },
};

// ── Motion variants ──────────────────────────────────────────────────────────
const backdropVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.18 } },
  exit: { opacity: 0, transition: { duration: 0.16 } },
};

const dialogVariants = {
  hidden: { opacity: 0, scale: 0.96, y: 10 },
  visible: {
    opacity: 1, scale: 1, y: 0,
    transition: { type: 'spring', damping: 26, stiffness: 340, mass: 0.65 },
  },
  exit: {
    opacity: 0, scale: 0.96, y: 8,
    transition: { duration: 0.14, ease: 'easeIn' },
  },
};

const contentVariants = {
  hidden: { opacity: 0, y: -4 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.18 } },
};

// ── Loading spinner SVG ──────────────────────────────────────────────────────
function Spinner() {
  return (
    <svg
      className="w-4 h-4 animate-spin flex-shrink-0"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2.5" opacity="0.25" />
      <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
export default function ConfirmDialog({
  open,
  onConfirm,
  onCancel,
  variant = 'danger',
  title = 'Are you sure?',
  description = '',
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  customLoadingText,
  loading = false,
  errorMessage = '',
  /**
   * meta: optional array of { icon: LucideIcon, label: string }
   * Small chips displayed below the description for context.
   * Example: [{ icon: Files, label: '24 files' }, { icon: Users, label: '6 members' }]
   */
  meta = [],
}) {
  const cfg = VARIANTS[variant] ?? VARIANTS.danger;
  const { Icon } = cfg;
  const loadingText = customLoadingText ?? cfg.loadingText;

  const confirmRef = useRef(null);
  const dialogRef = useRef(null);

  // Trap focus inside dialog
  const handleKeyDown = useCallback((e) => {
    if (!open) return;
    if (e.key === 'Escape' && !loading) { onCancel(); return; }
    if (e.key === 'Tab' && dialogRef.current) {
      const focusable = dialogRef.current.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      if (focusable.length < 2) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (e.shiftKey) {
        if (document.activeElement === first) { e.preventDefault(); last.focus(); }
      } else {
        if (document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    }
  }, [open, loading, onCancel]);

  useEffect(() => {
    if (open) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [open, handleKeyDown]);

  // Auto-focus confirm button when dialog opens
  useEffect(() => {
    if (open && confirmRef.current) {
      const t = setTimeout(() => confirmRef.current?.focus(), 60);
      return () => clearTimeout(t);
    }
  }, [open]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
          variants={backdropVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          onClick={loading ? undefined : onCancel}
          aria-modal="true"
          role="alertdialog"
          aria-labelledby="confirm-title"
          aria-describedby="confirm-desc"
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-[3px]" />

          {/* Dialog card */}
          <motion.div
            ref={dialogRef}
            variants={dialogVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-[440px] bg-white rounded-2xl border border-slate-200 overflow-hidden"
            style={{
              boxShadow:
                '0 20px 48px -12px rgba(15,23,42,0.18), 0 0 0 1px rgba(15,23,42,0.02)',
            }}
          >
            {/* ── Top accent bar (matches the stat-card top borders) ── */}
            <div
              className="h-[3px] w-full"
              style={{ backgroundColor: cfg.color }}
              aria-hidden="true"
            />

            <div className="px-7 pt-7 pb-6">

              {/* ── Icon ── */}
              <div className="flex justify-center mb-5">
                <div
                  className="w-[52px] h-[52px] rounded-xl flex items-center justify-center"
                  style={{
                    backgroundColor: cfg.iconBg,
                    boxShadow: `0 0 0 6px ${cfg.ring}`,
                  }}
                >
                  <Icon size={22} style={{ color: cfg.iconColor }} strokeWidth={2.2} />
                </div>
              </div>

              {/* ── Title ── */}
              <h2
                id="confirm-title"
                className="text-center text-[18px] font-bold text-slate-900 leading-snug tracking-[-0.01em] mb-2"
              >
                {title}
              </h2>

              {/* ── Body / loading status ── */}
              <AnimatePresence mode="wait">
                {loading ? (
                  <motion.p
                    key="loading"
                    variants={contentVariants}
                    initial="hidden"
                    animate="visible"
                    exit="hidden"
                    className="text-center text-[13.5px] font-medium"
                    style={{ color: cfg.color }}
                  >
                    {loadingText}
                  </motion.p>
                ) : description ? (
                  <motion.p
                    key="desc"
                    id="confirm-desc"
                    variants={contentVariants}
                    initial="hidden"
                    animate="visible"
                    exit="hidden"
                    className="text-center text-[13.5px] text-slate-500 leading-relaxed max-w-xs mx-auto"
                  >
                    {description}
                  </motion.p>
                ) : null}
              </AnimatePresence>

              {/* ── Meta chips ── */}
              {!loading && meta.length > 0 && (
                <div className="flex items-center justify-center gap-2 mt-[14px] flex-wrap">
                  {meta.map(({ icon: MetaIcon, label }, i) => (
                    <div
                      key={i}
                      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[12px] font-medium text-slate-500 bg-slate-50/70 border border-slate-200"
                    >
                      <MetaIcon size={12} strokeWidth={2} />
                      {label}
                    </div>
                  ))}
                </div>
              )}

              {/* ── Error message ── */}
              <AnimatePresence>
                {errorMessage && !loading && (
                  <motion.div
                    initial={{ opacity: 0, y: -4, height: 0 }}
                    animate={{ opacity: 1, y: 0, height: 'auto' }}
                    exit={{ opacity: 0, y: -4, height: 0 }}
                    transition={{ duration: 0.18 }}
                    className="mt-3 flex items-center gap-2 px-3 py-2.5 rounded-xl bg-red-50 border border-red-200"
                  >
                    <svg className="w-3.5 h-3.5 text-red-500 flex-shrink-0" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
                      <path d="M8 1a7 7 0 1 0 0 14A7 7 0 0 0 8 1zm0 4a.75.75 0 0 1 .75.75v3a.75.75 0 0 1-1.5 0v-3A.75.75 0 0 1 8 5zm0 6.5a.75.75 0 1 1 0-1.5.75.75 0 0 1 0 1.5z" />
                    </svg>
                    <p className="text-[12.5px] font-medium text-red-600">{errorMessage}</p>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* ── Divider ── */}
              <div className="h-px bg-slate-100 my-6 -mx-7" />

              {/* ── Action buttons ── */}
              <div className="flex items-center gap-2.5">
                {/* Cancel */}
                <button
                  onClick={onCancel}
                  disabled={loading}
                  className="flex-1 h-11 rounded-xl text-[14px] font-semibold text-slate-600 bg-slate-50/70 border border-slate-200 transition-all duration-150 hover:bg-slate-100 hover:text-slate-800 active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-300"
                >
                  {cancelText}
                </button>

                {/* Confirm */}
                <button
                  ref={confirmRef}
                  onClick={onConfirm}
                  disabled={loading}
                  className="flex-[1.4] h-11 rounded-xl text-[14px] font-semibold text-white inline-flex items-center justify-center gap-2 transition-all duration-150 active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed focus-visible:outline-none"
                  style={{
                    backgroundColor: cfg.color,
                    boxShadow: `0 1px 2px rgba(15,23,42,0.12), 0 0 0 1px ${cfg.color}22`,
                  }}
                  onMouseEnter={(e) => {
                    if (!loading) {
                      e.currentTarget.style.backgroundColor = cfg.hoverColor;
                      e.currentTarget.style.transform = 'translateY(-1px)';
                      e.currentTarget.style.boxShadow = `0 6px 16px ${cfg.color}38, 0 0 0 1px ${cfg.color}22`;
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!loading) {
                      e.currentTarget.style.backgroundColor = cfg.color;
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = `0 1px 2px rgba(15,23,42,0.12), 0 0 0 1px ${cfg.color}22`;
                    }
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.boxShadow = `0 0 0 2px white, 0 0 0 4px ${cfg.color}`;
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.boxShadow = `0 1px 2px rgba(15,23,42,0.12), 0 0 0 1px ${cfg.color}22`;
                  }}
                >
                  {loading ? (
                    <>
                      <Spinner />
                      <span>{loadingText}</span>
                    </>
                  ) : (
                    <>
                      <Icon size={14} strokeWidth={2.2} aria-hidden="true" />
                      <span>{confirmText}</span>
                    </>
                  )}
                </button>
              </div>

            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}