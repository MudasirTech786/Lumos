"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
} from "react";
import { usePathname } from "next/navigation";
import PageLoader from "./PageLoader";
import NavigationProgress from "./NavigationProgress";

const PageTransitionContext = createContext({
  startLoading: () => {},
});

export const usePageTransition = () => useContext(PageTransitionContext);

const GRACE_DELAY   = 150;
const MIN_SHOW_TIME = 600;
const FAILSAFE_MS   = 5_000;

export default function PageTransitionProvider({ children }) {
  const pathname = usePathname();
  const [isLoading, setIsLoading] = useState(false);

  // ── Refs for timing / state management ────────────────────────────────────
  const graceTimer    = useRef(null);
  const minShowTimer  = useRef(null);
  const failsafeTimer = useRef(null);
  const pendingHide   = useRef(false);
  const navigatingRef = useRef(false);
  const prevPathname  = useRef(pathname);
  const showStartTime = useRef(null);
  const navIdRef      = useRef(0);
  const isLoadingRef  = useRef(false);
  const readyRef      = useRef(false);

  // Keep ref in sync
  useEffect(() => {
    isLoadingRef.current = isLoading;
  }, [isLoading]);

  // Mark component ready after first paint
  useEffect(() => {
    readyRef.current = true;
  }, []);

  // ── TEMPORARY: console logs ───────────────────────────────────────────────
  const log = useCallback((msg, extra) => {
    if (extra) {
      console.log(`[PageTransition] ${msg}`, extra);
    } else {
      console.log(`[PageTransition] ${msg}`);
    }
  }, []);

  // ── Timer / state helpers ─────────────────────────────────────────────────
  const clearAllTimers = useCallback(() => {
    if (graceTimer.current)    { clearTimeout(graceTimer.current);    graceTimer.current = null; }
    if (minShowTimer.current)  { clearTimeout(minShowTimer.current);  minShowTimer.current = null; }
    if (failsafeTimer.current) { clearTimeout(failsafeTimer.current); failsafeTimer.current = null; }
  }, []);

  const resetState = useCallback(() => {
    log("loading finished");
    clearAllTimers();
    setIsLoading(false);
    navigatingRef.current = false;
    pendingHide.current   = false;
    showStartTime.current = null;
  }, [clearAllTimers, log]);

  // ── Start loading (grace delay + min-show + failsafe) ─────────────────────
  const startLoading = useCallback(() => {
    if (!readyRef.current) { log("blocked (not ready)"); return; }
    if (navigatingRef.current) { log("blocked (navigating)"); return; }
    log("loading started", new Error().stack?.split("\n").slice(2, 5).join(" | "));

    navIdRef.current++;
    navigatingRef.current = true;
    const currentNavId = navIdRef.current;

    // Failsafe: force-hide after FAILSAFE_MS no matter what
    clearTimeout(failsafeTimer.current);
    failsafeTimer.current = setTimeout(() => {
      if (navIdRef.current !== currentNavId) return;
      log("failsafe triggered");
      resetState();
    }, FAILSAFE_MS);

    // Grace delay — don't flash the overlay for instant navigations
    if (graceTimer.current) return;
    graceTimer.current = setTimeout(() => {
      if (navIdRef.current !== currentNavId) return;
      graceTimer.current = null;
      log("grace timer fired");
      setIsLoading(true);
      showStartTime.current = Date.now();
      pendingHide.current = false;

      // Minimum display time
      const minShowNavId = navIdRef.current;
      minShowTimer.current = setTimeout(() => {
        if (navIdRef.current !== minShowNavId) return;
        minShowTimer.current = null;
        if (pendingHide.current) {
          log("loading finished");
          setIsLoading(false);
          navigatingRef.current = false;
          pendingHide.current   = false;
        }
      }, MIN_SHOW_TIME);
    }, GRACE_DELAY);
  }, [log, resetState]);

  // ── Hide loader (called when pathname changes or navigation completes) ────
  const hideLoader = useCallback(() => {
    // Navigation resolved before grace timer fired
    if (graceTimer.current) {
      clearTimeout(graceTimer.current);
      graceTimer.current = null;
      navigatingRef.current = false;
      log("loading finished");
      return;
    }

    // Min-show timer still running — defer hide
    if (minShowTimer.current) {
      pendingHide.current = true;
      navigatingRef.current = false; // allow new navigations to start
      return;
    }

    setIsLoading(false);
    navigatingRef.current = false;
    pendingHide.current   = false;
    showStartTime.current = null;
    log("loading finished");
  }, [log]);

  // ── Patch history API + popstate (browser Back/Forward) ───────────────────
  useEffect(() => {
    if (typeof window === "undefined") return;

    const originalPush    = window.history.pushState.bind(window.history);
    const originalReplace = window.history.replaceState.bind(window.history);

    const onNavigate = (args, method) => {
      const url = args[2];
      const currentPath = window.location.pathname;

      if (url && typeof url === "string") {
        try {
          const target = new URL(url, window.location.origin);
          if (target.pathname !== currentPath) {
            log("navigation detected");
            startLoading();
          }
        } catch {
          if (url !== currentPath && !url.startsWith("#")) {
            log("navigation detected");
            startLoading();
          }
        }
      }
      return method(...args);
    };

    window.history.pushState    = (...args) => onNavigate(args, originalPush);
    window.history.replaceState = (...args) => onNavigate(args, originalReplace);

    const handlePopState = () => {
      log("navigation detected");
      startLoading();
    };
    window.addEventListener("popstate", handlePopState);

    return () => {
      window.history.pushState    = originalPush;
      window.history.replaceState = originalReplace;
      window.removeEventListener("popstate", handlePopState);
    };
  }, [startLoading, log]);

  // ── Detect navigation completion via pathname change ─────────────────────
  useEffect(() => {
    if (pathname !== prevPathname.current) {
      log("pathname changed");
      prevPathname.current = pathname;

      if (navigatingRef.current || graceTimer.current || isLoading) {
        hideLoader();
        log("page rendered");
      }

      // Navigation succeeded — clear failsafe
      clearTimeout(failsafeTimer.current);
      failsafeTimer.current = null;
    }
  }, [pathname, hideLoader, isLoading, log]);

  // ── Global error recovery (API errors / React rendering errors) ──────────
  useEffect(() => {
    const handler = () => {
      if (isLoadingRef.current || navigatingRef.current) {
        resetState();
      }
    };
    window.addEventListener("error", handler);
    window.addEventListener("unhandledrejection", handler);
    return () => {
      window.removeEventListener("error", handler);
      window.removeEventListener("unhandledrejection", handler);
    };
  }, [resetState]);

  // ── Cleanup on unmount ────────────────────────────────────────────────────
  useEffect(() => {
    return () => {
      clearAllTimers();
    };
  }, [clearAllTimers]);

  return (
    <PageTransitionContext.Provider value={{ startLoading }}>
      {children}
      <NavigationProgress isLoading={isLoading} />
      <PageLoader isLoading={isLoading} />
    </PageTransitionContext.Provider>
  );
}
