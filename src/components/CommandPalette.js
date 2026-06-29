"use client";

/**
 * CommandPalette.jsx
 *
 * A premium Global Command Palette inspired by Linear, Raycast, Arc, Notion, and Vercel.
 * - Desktop: centered floating modal with backdrop blur, opened via Ctrl/Cmd+K or search bar click
 * - Mobile: fullscreen overlay (replaces existing mobile search overlay)
 * - Keyboard navigation: ↑ ↓ Enter Esc Tab
 * - Recent searches persisted to localStorage
 *
 * Props:
 *   open        boolean  — controlled visibility
 *   onClose     fn       — called when palette should close
 *   isMobile    boolean  — drives layout variant
 */

import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Search, X, Clock, Zap, Film, Users, Package, FileText, BarChart2, ArrowRight, User, Hash, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import api from "@/lib/api";
import { usePageTransition } from "@/components/ui/PageTransitionProvider";

// ─────────────────────────────────────────────
// CONSTANTS
// ─────────────────────────────────────────────

const MAX_RECENT = 8;
const RECENT_KEY = "cmd-palette-recent";

const QUICK_ACTIONS = [
  { id: "qa-1", label: "New Production",   icon: "🎬", shortcut: "P",  category: "action", route: "/dashboard/shoots/create" },
  { id: "qa-2", label: "Add Crew Member",  icon: "👤", shortcut: "C",  category: "action", route: "/dashboard/crew" },
  { id: "qa-3", label: "Upload Asset",     icon: "📁", shortcut: "A",  category: "action", route: "/dashboard/inventory/assets" },
  { id: "qa-4", label: "Create Invoice",   icon: "📄", shortcut: "I",  category: "action", route: "/dashboard/invoices/production-invoices/create" },
  { id: "qa-5", label: "Add Inventory",    icon: "📦", shortcut: "N",  category: "action", route: "/dashboard/inventory/items" },
  { id: "qa-6", label: "Generate Report",  icon: "📊", shortcut: "R",  category: "action", route: "/dashboard/finance/reports" },
];

const CATEGORY_META = {
  productions: { label: "Productions", Icon: Film,      color: "text-violet-400", bg: "bg-violet-500/10" },
  crew:        { label: "Crew",        Icon: Users,     color: "text-blue-400",   bg: "bg-blue-500/10"   },
  employees:   { label: "Employees",   Icon: User,      color: "text-sky-400",    bg: "bg-sky-500/10"    },
  assets:      { label: "Assets",      Icon: Package,   color: "text-amber-400",  bg: "bg-amber-500/10"  },
  inventory:   { label: "Inventory",   Icon: Hash,      color: "text-emerald-400",bg: "bg-emerald-500/10"},
  invoices:    { label: "Invoices",    Icon: FileText,  color: "text-rose-400",   bg: "bg-rose-500/10"   },
  users:       { label: "Users",       Icon: User,      color: "text-indigo-400", bg: "bg-indigo-500/10" },
};

// ─────────────────────────────────────────────
// VARIANTS
// ─────────────────────────────────────────────

const containerVariants = {
  initial: {},
  animate: { transition: { staggerChildren: 0.04 } },
};

const itemVariants = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.18, ease: [0.25, 0.1, 0.25, 1] } },
  exit: { opacity: 0, y: -4, transition: { duration: 0.12 } },
};

const sectionVariants = {
  initial: { opacity: 0, y: 6 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.18, ease: [0.25, 0.1, 0.25, 1] } },
};

// ─────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────

function highlightText(text, query) {
  if (!query || !text) return text;
  const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const parts = text.split(new RegExp(`(${escaped})`, "gi"));
  return parts.map((part, i) =>
    part.toLowerCase() === query.toLowerCase()
      ? <mark key={i} className="bg-blue-500/20 text-blue-200 rounded-sm px-0.5">{part}</mark>
      : part
  );
}

// ─────────────────────────────────────────────
// REAL SEARCH — calls GET /api/search?q=
// ─────────────────────────────────────────────
async function fetchResults(query, signal) {
  if (!query.trim()) return [];

  const { data } = await api.get("/search", {
    params: { q: query },
    signal,
  });

  // Flatten grouped API response into flat array with category field
  const flat = [];
  for (const [category, items] of Object.entries(data)) {
    for (const item of items) {
      flat.push({ ...item, category });
    }
  }
  return flat;
}

// ─────────────────────────────────────────────
// HOOK — search state machine with debounce + cancellation
// ─────────────────────────────────────────────
function useSearch(query) {
  const [results, setResults]   = useState([]);
  const [loading, setLoading]   = useState(false);
  const debounceRef             = useRef(null);
  const abortRef                = useRef(null);

  useEffect(() => {
    if (abortRef.current) abortRef.current.abort();
    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (!query.trim()) {
      setResults([]);
      setLoading(false);
      return;
    }

    setLoading(true);

    debounceRef.current = setTimeout(async () => {
      const controller = new AbortController();
      abortRef.current = controller;

      try {
        const data = await fetchResults(query, controller.signal);
        if (!controller.signal.aborted) {
          setResults(data);
        }
      } catch (err) {
        if (err?.name !== "CanceledError" && err?.code !== "ERR_CANCELED") {
          setResults([]);
        }
      } finally {
        if (!controller.signal.aborted && abortRef.current === controller) {
          setLoading(false);
        }
      }
    }, 300); // debounce

    return () => {
      clearTimeout(debounceRef.current);
      if (abortRef.current) abortRef.current.abort();
    };
  }, [query]);

  const grouped = useMemo(() => {
    const map = {};
    for (const r of results) {
      if (!map[r.category]) map[r.category] = [];
      map[r.category].push(r);
    }
    return map;
  }, [results]);

  return { results, grouped, loading };
}

// ─────────────────────────────────────────────
// LOCAL STORAGE — recent searches (stores objects)
// ─────────────────────────────────────────────
function useRecent() {
  const [recent, setRecent] = useState([]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(RECENT_KEY);
      const parsed = raw ? JSON.parse(raw) : [];
      setRecent(Array.isArray(parsed) ? parsed.filter((r) => r && typeof r === "object" && r.id) : []);
    } catch {
      setRecent([]);
    }
  }, []);

  const addRecent = useCallback((item) => {
    if (!item || !item.id) return;
    setRecent((prev) => {
      const next = [item, ...prev.filter((r) => r.id !== item.id)].slice(0, MAX_RECENT);
      try { localStorage.setItem(RECENT_KEY, JSON.stringify(next)); } catch {}
      return next;
    });
  }, []);

  const removeRecent = useCallback((id) => {
    setRecent((prev) => {
      const next = prev.filter((r) => r.id !== id);
      try { localStorage.setItem(RECENT_KEY, JSON.stringify(next)); } catch {}
      return next;
    });
  }, []);

  return { recent, addRecent, removeRecent };
}

// ─────────────────────────────────────────────
// SUB-COMPONENTS
// ─────────────────────────────────────────────

function ShimmerSkeleton({ className = "" }) {
  return (
    <div className={`relative overflow-hidden rounded-lg bg-white/8 ${className}`}>
      <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.5s_ease-in-out_infinite] bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" />
    </div>
  );
}

function LoadingState() {
  return (
    <motion.div
      key="loading"
      initial="initial"
      animate="animate"
      variants={containerVariants}
      className="px-3 py-4 space-y-5"
    >
      {[0, 1].map((g) => (
        <motion.div key={g} variants={itemVariants} className="space-y-2">
          <ShimmerSkeleton className="h-3 w-24 ml-1" />
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              variants={itemVariants}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl"
            >
              <ShimmerSkeleton className="w-8 h-8 flex-shrink-0" />
              <div className="flex-1 space-y-1.5">
                <ShimmerSkeleton className="h-3 w-2/3" />
                <ShimmerSkeleton className="h-2.5 w-1/3" />
              </div>
            </motion.div>
          ))}
        </motion.div>
      ))}
    </motion.div>
  );
}

function EmptyState({ query }) {
  return (
    <motion.div
      key="empty"
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.96 }}
      transition={{ duration: 0.2, ease: [0.25, 0.1, 0.25, 1] }}
      className="flex flex-col items-center justify-center py-14 px-6 text-center select-none"
    >
      <motion.div
        initial={{ opacity: 0, y: 4 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05, duration: 0.2 }}
        className="w-14 h-14 rounded-2xl bg-white/6 border border-white/10 flex items-center justify-center mb-4"
      >
        <Search size={22} className="text-slate-500" strokeWidth={1.5} />
      </motion.div>
      <motion.p
        initial={{ opacity: 0, y: 4 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.2 }}
        className="text-sm font-medium text-slate-300"
      >
        No results for <span className="text-white">{`"${query}"`}</span>
      </motion.p>
      <motion.p
        initial={{ opacity: 0, y: 4 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15, duration: 0.2 }}
        className="text-xs text-slate-500 mt-1.5"
      >
        Try searching productions, crew, assets, or invoices
      </motion.p>
    </motion.div>
  );
}

function ResultItem({ item, active, onSelect, onMouseEnter, query, navigating }) {
  const meta  = CATEGORY_META[item.category] || {};
  const { Icon = Hash, color = "text-slate-400", bg = "bg-white/8" } = meta;
  const ref = useRef(null);

  useEffect(() => {
    if (active && ref.current) {
      ref.current.scrollIntoView({ block: "nearest" });
    }
  }, [active]);

  return (
    <motion.button
      ref={ref}
      layout
      onClick={() => onSelect(item)}
      onMouseEnter={onMouseEnter}
      variants={itemVariants}
      style={navigating ? { scale: 1.01 } : undefined}
      className={`
        relative w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left
        transition-colors duration-100 group overflow-hidden
        ${active
          ? "bg-blue-500/15 ring-1 ring-blue-500/30"
          : "hover:bg-white/6"
        }
        ${navigating ? "bg-blue-500/20 ring-1 ring-blue-500/40" : ""}
      `}
    >
      {active && (
        <motion.div
          layoutId="activeHighlight"
          className="absolute inset-0 rounded-xl bg-blue-500/10"
          initial={false}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
        />
      )}
      <div className={`relative w-8 h-8 rounded-lg ${bg} ${color} flex items-center justify-center flex-shrink-0`}>
        {navigating ? (
          <Loader2 size={14} strokeWidth={2} className="animate-spin" />
        ) : (
          <Icon size={14} strokeWidth={1.8} />
        )}
      </div>
      <div className="relative flex-1 min-w-0">
        <p className={`text-[13.5px] font-medium truncate transition-colors ${active ? "text-white" : "text-slate-200 group-hover:text-white"}`}>
          {query ? highlightText(item.title, query) : item.title}
        </p>
        {item.subtitle && (
          <p className="text-[11px] text-slate-500 truncate mt-0.5">
            {query ? highlightText(item.subtitle, query) : item.subtitle}
          </p>
        )}
      </div>
      {item.status && (
        <span className="relative flex-shrink-0 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-white/8 text-slate-400">
          {item.status}
        </span>
      )}
      {navigating ? (
        <Loader2 size={13} strokeWidth={2.5} className="flex-shrink-0 text-blue-400 animate-spin" />
      ) : (
        <ArrowRight size={13} className={`flex-shrink-0 transition-all duration-100 ${active ? "text-slate-400 translate-x-0 opacity-100" : "text-transparent -translate-x-1 opacity-0 group-hover:opacity-100 group-hover:translate-x-0 group-hover:text-slate-500"}`} />
      )}
    </motion.button>
  );
}

function ActionItem({ action, active, onSelect, onMouseEnter, navigating }) {
  const ref = useRef(null);

  useEffect(() => {
    if (active && ref.current) {
      ref.current.scrollIntoView({ block: "nearest" });
    }
  }, [active]);

  return (
    <motion.button
      ref={ref}
      layout
      onClick={() => onSelect(action)}
      onMouseEnter={onMouseEnter}
      variants={itemVariants}
      className={`
        flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-left
        transition-colors duration-100 border relative overflow-hidden
        ${active
          ? "bg-blue-500/15 border-blue-500/30 ring-1 ring-blue-500/30"
          : "bg-white/4 border-white/8 hover:bg-white/8 hover:border-white/12"
        }
        ${navigating ? "bg-blue-500/20 border-blue-500/40" : ""}
      `}
    >
      {active && (
        <motion.div
          layoutId="activeActionHighlight"
          className="absolute inset-0 rounded-xl bg-blue-500/10"
          initial={false}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
        />
      )}
      <span className="relative text-lg leading-none flex-shrink-0">
        {navigating ? <Loader2 size={16} strokeWidth={2} className="animate-spin text-blue-400" /> : action.icon}
      </span>
      <span className="relative text-[13px] text-slate-200 font-medium">{action.label}</span>
    </motion.button>
  );
}

function RecentItem({ item, active, onSelect, onRemove, onMouseEnter }) {
  const ref = useRef(null);

  useEffect(() => {
    if (active && ref.current) {
      ref.current.scrollIntoView({ block: "nearest" });
    }
  }, [active]);

  return (
    <motion.div
      ref={ref}
      layout
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8, height: 0, marginBottom: 0, overflow: "hidden" }}
      transition={{ duration: 0.2, ease: [0.25, 0.1, 0.25, 1] }}
      className={`
        flex items-center gap-3 px-3 py-2.5 rounded-xl group
        transition-colors duration-100 cursor-pointer
        ${active ? "bg-white/10" : "hover:bg-white/6"}
      `}
      onClick={() => onSelect(item)}
      onMouseEnter={onMouseEnter}
    >
      <div className="w-8 h-8 rounded-lg bg-white/6 flex items-center justify-center flex-shrink-0">
        <Clock size={13} className="text-slate-500" strokeWidth={1.8} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[13.5px] text-slate-300 truncate">{item.title}</p>
        {item.subtitle && (
          <p className="text-[11px] text-slate-500 truncate mt-0.5">{item.subtitle}</p>
        )}
      </div>
      <button
        onClick={(e) => { e.stopPropagation(); onRemove(item.id); }}
        className="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded-lg hover:bg-white/10 text-slate-500 hover:text-slate-300"
        aria-label="Remove"
      >
        <X size={12} strokeWidth={2.5} />
      </button>
    </motion.div>
  );
}

// ─────────────────────────────────────────────
// SECTION LABEL
// ─────────────────────────────────────────────
function SectionLabel({ children }) {
  return (
    <motion.p
      variants={sectionVariants}
      className="text-[10.5px] font-semibold uppercase tracking-widest text-slate-500 px-4 mb-2 mt-5 first:mt-0"
    >
      {children}
    </motion.p>
  );
}

// ─────────────────────────────────────────────
// KEYBOARD NAV — builds flat list of focusable items
// ─────────────────────────────────────────────
function buildFlatList({ hasQuery, recent, quickActions, grouped }) {
  const list = [];

  if (!hasQuery) {
    recent.forEach((r) => list.push({ type: "recent", id: `r-${r.id}`, item: r }));
    quickActions.forEach((a)  => list.push({ type: "action", id: a.id, action: a }));
    return list;
  }

  Object.entries(grouped).forEach(([cat, items]) => {
    items.forEach((item) => list.push({ type: "result", id: item.id, item }));
  });

  return list;
}

// ─────────────────────────────────────────────
// MAIN PALETTE BODY — shared between desktop / mobile
// ─────────────────────────────────────────────
function PaletteBody({ onClose }) {
  const router                  = useRouter();
  const [query, setQuery]       = useState("");
  const inputRef                = useRef(null);
  const [activeIdx, setActive]  = useState(-1);
  const [navigatingId, setNavigatingId] = useState(null);
  const { startLoading }        = usePageTransition();

  const { results, grouped, loading } = useSearch(query);
  const { recent, addRecent, removeRecent } = useRecent();

  const hasQuery   = query.trim().length > 0;
  const hasResults = results.length > 0;

  const flatList = useMemo(
    () => buildFlatList({ hasQuery, recent, quickActions: QUICK_ACTIONS, grouped }),
    [hasQuery, recent, grouped]
  );

  useEffect(() => { setActive(-1); }, [flatList.length, query]);

  useEffect(() => {
    const t = setTimeout(() => inputRef.current?.focus(), 60);
    return () => clearTimeout(t);
  }, []);

  const navigatingRef = useRef(false);

  const handleSelect = useCallback((item) => {
    if (navigatingRef.current) return;

    if (!item.route) {
      if (typeof item === "string") {
        setQuery(item);
        inputRef.current?.focus();
        return;
      }
      onClose();
      return;
    }

    if (item.type !== "action" && item.category !== "action") {
      addRecent({ id: item.id, title: item.title, subtitle: item.subtitle || "", type: item.type || item.category, route: item.route });
    }

    // Start page transition loader (150ms grace, 600ms min show)
    startLoading();

    const itemId = item.id;
    setNavigatingId(itemId);
    navigatingRef.current = true;

    setTimeout(() => {
      router.push(item.route);
      onClose();
    }, 180);
  }, [addRecent, onClose, router, startLoading]);

  useEffect(() => {
    if (!loading && navigatingId && !results.find((r) => r.id === navigatingId)) {
      setNavigatingId(null);
    }
  }, [results, loading, navigatingId]);

  // Keyboard navigation
  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === "Escape") { onClose(); return; }

      if (e.key === "ArrowDown") {
        e.preventDefault();
        setActive((i) => Math.min(i + 1, flatList.length - 1));
        return;
      }
      if (e.key === "ArrowUp") {
        e.preventDefault();
        setActive((i) => Math.max(i - 1, -1));
        return;
      }
      if (e.key === "Enter" && activeIdx >= 0) {
        e.preventDefault();
        const node = flatList[activeIdx];
        if (!node) return;
        if (node.type === "recent")   handleSelect(node.item);
        if (node.type === "action")   handleSelect(node.action);
        if (node.type === "result")   handleSelect(node.item);
        return;
      }
      if (e.key === "Tab") {
        e.preventDefault();
        setActive((i) => {
          const next = e.shiftKey ? i - 1 : i + 1;
          return Math.max(-1, Math.min(next, flatList.length - 1));
        });
      }
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [flatList, activeIdx, handleSelect, onClose]);

  const contentKey = hasQuery
    ? loading
      ? "loading"
      : hasResults
        ? "results"
        : "empty"
    : "default";

  const renderContent = () => {
    if (hasQuery && loading) return <LoadingState />;

    if (hasQuery && hasResults) {
      return (
        <motion.div
          key="results"
          initial="initial"
          animate="animate"
          variants={containerVariants}
          className="px-3 py-3"
        >
          {Object.entries(grouped).map(([cat, items]) => {
            const meta = CATEGORY_META[cat] || { label: cat };
            return (
              <motion.div key={cat} variants={itemVariants}>
                <SectionLabel>{meta.label}</SectionLabel>
                <div className="space-y-0.5">
                  {items.map((item) => {
                    const idx = flatList.findIndex((n) => n.id === item.id);
                    return (
                      <ResultItem
                        key={item.id}
                        item={item}
                        active={activeIdx === idx}
                        onSelect={handleSelect}
                        onMouseEnter={() => setActive(idx)}
                        query={query}
                        navigating={navigatingId === item.id}
                      />
                    );
                  })}
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      );
    }

    if (hasQuery && !loading && !hasResults) return <EmptyState query={query} />;

    return (
      <motion.div
        key="default"
        initial="initial"
        animate="animate"
        variants={containerVariants}
        className="px-3 py-3"
      >
        {recent.length > 0 && (
          <motion.div variants={itemVariants}>
            <SectionLabel>Recent</SectionLabel>
            <AnimatePresence mode="popLayout">
              {recent.map((entry) => {
                const idx = flatList.findIndex((n) => n.type === "recent" && n.id === `r-${entry.id}`);
                return (
                  <RecentItem
                    key={entry.id}
                    item={entry}
                    active={activeIdx === idx}
                    onSelect={handleSelect}
                    onRemove={() => removeRecent(entry.id)}
                    onMouseEnter={() => setActive(idx)}
                  />
                );
              })}
            </AnimatePresence>
          </motion.div>
        )}

        <motion.div variants={itemVariants}>
          <SectionLabel>Quick Actions</SectionLabel>
          <motion.div
            variants={containerVariants}
            initial="initial"
            animate="animate"
            className="grid grid-cols-2 gap-1.5"
          >
            {QUICK_ACTIONS.map((action) => {
              const idx = flatList.findIndex((n) => n.id === action.id);
              return (
                <ActionItem
                  key={action.id}
                  action={action}
                  active={activeIdx === idx}
                  onSelect={handleSelect}
                  onMouseEnter={() => setActive(idx)}
                  navigating={navigatingId === action.id}
                />
              );
            })}
          </motion.div>
        </motion.div>
      </motion.div>
    );
  };

  return (
    <div className="flex flex-col h-full">
      {/* INPUT ROW */}
      <div className="flex items-center gap-3 px-4 py-3.5 border-b border-white/10 flex-shrink-0">
        <motion.div
          animate={
            loading
              ? { rotate: [0, 15, -10, 15, 0], scale: [1, 1.08, 1.08, 1.08, 1] }
              : { rotate: 0, scale: 1 }
          }
          transition={
            loading
              ? { duration: 0.6, ease: "easeInOut", repeat: Infinity, repeatDelay: 0.4 }
              : { duration: 0.25 }
          }
        >
          <Search
            size={17}
            strokeWidth={2.2}
            className={`flex-shrink-0 transition-colors duration-200 ${loading ? "text-blue-400" : hasQuery ? "text-blue-400" : "text-slate-500"}`}
          />
        </motion.div>
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search productions, crew, assets, invoices…"
          className="flex-1 bg-transparent outline-none text-[14.5px] text-white placeholder:text-slate-500 min-w-0"
        />
        {query ? (
          <button
            onClick={() => { setQuery(""); inputRef.current?.focus(); }}
            className="flex-shrink-0 p-1.5 rounded-lg hover:bg-white/10 text-slate-500 hover:text-slate-300 transition-colors"
            aria-label="Clear"
          >
            <X size={14} strokeWidth={2.5} />
          </button>
        ) : (
          <kbd className="hidden md:flex items-center gap-0.5 px-1.5 py-0.5 rounded-md bg-white/8 border border-white/12 text-[10px] font-medium text-slate-500 flex-shrink-0">
            Esc
          </kbd>
        )}
      </div>

      {/* SCROLLABLE CONTENT */}
      <div className="flex-1 overflow-y-auto overscroll-contain">
        <AnimatePresence mode="wait">
          <motion.div
            key={contentKey}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.12 }}
          >
            {renderContent()}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* FOOTER — keyboard hints */}
      <div className="flex-shrink-0 flex items-center justify-between px-4 py-2.5 border-t border-white/8 bg-white/2">
        <div className="flex items-center gap-3">
          {[
            { keys: ["↑", "↓"],    label: "Navigate" },
            { keys: ["↵"],          label: "Open"    },
            { keys: ["Esc"],        label: "Close"   },
          ].map(({ keys, label }) => (
            <div key={label} className="hidden sm:flex items-center gap-1">
              {keys.map((k) => (
                <kbd key={k} className="px-1.5 py-0.5 rounded bg-white/8 border border-white/12 text-[9px] font-mono text-slate-500">{k}</kbd>
              ))}
              <span className="text-[10px] text-slate-600 ml-0.5">{label}</span>
            </div>
          ))}
        </div>
        <div className="flex items-center gap-1.5">
          <Zap size={10} className="text-blue-500" />
          <span className="text-[10px] text-slate-600">Global search</span>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// EXPORTED COMPONENT
// ─────────────────────────────────────────────

export default function CommandPalette({ open, onClose, isMobile = false }) {
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  if (!open) return null;

  const sharedStyles = `
    @keyframes fadeIn  { from { opacity: 0 } to { opacity: 1 } }
    @keyframes slideUp { from { opacity: 0; transform: translateY(12px) } to { opacity: 1; transform: translateY(0) } }
    @keyframes slideDown { from { opacity: 0; transform: translateY(-8px) } to { opacity: 1; transform: translateY(0) } }
    @keyframes shimmer { 0% { transform: translateX(-100%); } 100% { transform: translateX(100%); } }
    @media (prefers-reduced-motion: reduce) {
      *, *::before, *::after { animation-duration: 0.01ms !important; animation-iteration-count: 1 !important; transition-duration: 0.01ms !important; }
    }
  `;

  // ── MOBILE: fullscreen overlay ──
  if (isMobile) {
    return (
      <div
        className="
          md:hidden
          fixed inset-0 z-[200]
          bg-[#0B0F19]/85 backdrop-blur-md
          flex flex-col
        "
        style={{ animation: "fadeIn 150ms ease" }}
      >
        <style>{sharedStyles}</style>

        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2, ease: [0.25, 0.1, 0.25, 1] }}
          className="flex flex-col h-full bg-[#0F1320]"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Mobile close bar */}
          <div className="flex items-center justify-end px-4 pt-3 pb-0">
            <button
              onClick={onClose}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 text-[13px] font-medium transition-all"
            >
              Cancel
            </button>
          </div>
          <div className="flex-1 flex flex-col overflow-hidden">
            <PaletteBody onClose={onClose} />
          </div>
        </motion.div>
      </div>
    );
  }

  // ── DESKTOP: centered floating modal ──
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.12 }}
      className="
        hidden md:flex
        fixed inset-0 z-[200]
        items-start justify-center
        pt-[15vh]
        bg-black/40 backdrop-blur-sm
      "
      onClick={onClose}
    >
      <style>{sharedStyles}</style>

      <motion.div
        initial={{ opacity: 0, y: 12, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 12, scale: 0.97 }}
        transition={{ duration: 0.2, ease: [0.25, 0.1, 0.25, 1] }}
        className="
          w-full max-w-[640px] mx-4
          flex flex-col
          bg-[#0F1320]/98 backdrop-blur-2xl
          border border-white/10
          rounded-2xl
          shadow-[0_40px_120px_rgba(0,0,0,0.6),0_0_0_1px_rgba(255,255,255,0.04)]
          overflow-hidden
        "
        style={{ maxHeight: "min(640px, 70vh)" }}
        onClick={(e) => e.stopPropagation()}
      >
        <PaletteBody onClose={onClose} />
      </motion.div>
    </motion.div>
  );
}
