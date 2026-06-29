"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
} from "react";
import { usePathname, useRouter } from "next/navigation";
import PageLoader from "./PageLoader";
import NavigationProgress from "./NavigationProgress";

/**
 * PageTransitionContext
 *
 * Provides `startLoading()` for manual triggers (e.g. imperative router.push
 * wrappers). Navigation auto-detection is handled by pathname polling.
 */
const PageTransitionContext = createContext({
  startLoading: () => {},
});

export const usePageTransition = () => useContext(PageTransitionContext);

/**
 * PageTransitionProvider
 *
 * Mount once in root layout. Wraps children and renders PageLoader.
 *
 * Detection strategy (App Router safe):
 * 1. Patches `window.history.pushState` and `window.history.replaceState`
 *    to catch navigation intent immediately.
 * 2. Polls pathname changes to detect when navigation completes.
 * 3. A 150ms grace delay ensures we don't flash the loader for instant loads.
 * 4. A 600ms minimum display time prevents jarring flicker on fast navigations.
 */

const GRACE_DELAY    = 150;   // ms before showing overlay
const MIN_SHOW_TIME  = 600;   // ms minimum loader visible time

export default function PageTransitionProvider({ children }) {
  const pathname          = usePathname();
  const [isLoading, setIsLoading] = useState(false);

  // Refs to manage timing without stale closures
  const graceTimer        = useRef(null);
  const minShowTimer      = useRef(null);
  const pendingHide       = useRef(false);
  const navigatingRef     = useRef(false);
  const prevPathname      = useRef(pathname);
  const showStartTime     = useRef(null);

  // ── Show the overlay (after grace delay) ─────────────────────────────────
  const showLoader = useCallback(() => {
    if (graceTimer.current) return; // already pending

    graceTimer.current = setTimeout(() => {
      graceTimer.current = null;
      setIsLoading(true);
      showStartTime.current = Date.now();
      pendingHide.current = false;

      // Guarantee minimum display
      minShowTimer.current = setTimeout(() => {
        minShowTimer.current = null;
        if (pendingHide.current) {
          setIsLoading(false);
          navigatingRef.current = false;
          pendingHide.current   = false;
        }
      }, MIN_SHOW_TIME);
    }, GRACE_DELAY);
  }, []);

  // ── Hide the overlay ──────────────────────────────────────────────────────
  const hideLoader = useCallback(() => {
    // Cancel grace timer if navigation resolved before it fired
    if (graceTimer.current) {
      clearTimeout(graceTimer.current);
      graceTimer.current = null;
      navigatingRef.current = false;
      return;
    }

    // If minimum show timer still running, defer the hide
    if (minShowTimer.current) {
      pendingHide.current = true;
      return;
    }

    setIsLoading(false);
    navigatingRef.current = false;
    pendingHide.current   = false;
  }, []);

  // ── Exposed manual trigger ────────────────────────────────────────────────
  const startLoading = useCallback(() => {
    if (navigatingRef.current) return;
    navigatingRef.current = true;
    showLoader();
  }, [showLoader]);

  // ── Patch history API to detect navigation intent ─────────────────────────
  useEffect(() => {
    if (typeof window === "undefined") return;

    const originalPush    = window.history.pushState.bind(window.history);
    const originalReplace = window.history.replaceState.bind(window.history);

    function onNavigate(args, method) {
      // Extract target URL from state args
      const url = args[2];
      const currentPath = window.location.pathname;

      // Only trigger for actual page changes (not hash changes or same path)
      if (url && typeof url === "string") {
        try {
          const target = new URL(url, window.location.origin);
          if (target.pathname !== currentPath) {
            startLoading();
          }
        } catch {
          // relative URL
          if (url !== currentPath && !url.startsWith("#")) {
            startLoading();
          }
        }
      }
      return method(...args);
    }

    window.history.pushState    = (...args) => onNavigate(args, originalPush);
    window.history.replaceState = (...args) => onNavigate(args, originalReplace);

    return () => {
      window.history.pushState    = originalPush;
      window.history.replaceState = originalReplace;
    };
  }, [startLoading]);

  // ── Detect navigation completion via pathname change ─────────────────────
  useEffect(() => {
    if (pathname !== prevPathname.current) {
      prevPathname.current = pathname;
      if (navigatingRef.current || graceTimer.current) {
        hideLoader();
      }
    }
  }, [pathname, hideLoader]);

  // ── Cleanup on unmount ────────────────────────────────────────────────────
  useEffect(() => {
    return () => {
      if (graceTimer.current)   clearTimeout(graceTimer.current);
      if (minShowTimer.current) clearTimeout(minShowTimer.current);
    };
  }, []);

  return (
    <PageTransitionContext.Provider value={{ startLoading }}>
      {children}
      <NavigationProgress isLoading={isLoading} />
      <PageLoader isLoading={isLoading} />
    </PageTransitionContext.Provider>
  );
}
