"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";

export default function usePageLoadingOverlay(text = "Loading...") {
  const [visible, setVisible] = useState(true);
  const [overlayRect, setOverlayRect] = useState(null);
  const startRef = useRef(Date.now());
  const timeoutRef = useRef(null);

  const finish = () => {
    const elapsed = Date.now() - (startRef.current || Date.now());
    if (elapsed >= 500) {
      setVisible(false);
    } else {
      timeoutRef.current = setTimeout(() => setVisible(false), 500 - elapsed);
    }
  };

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  useLayoutEffect(() => {
    if (!visible) return;
    const mainEl = document.querySelector("main");
    if (!mainEl) return;
    const update = () => setOverlayRect(mainEl.getBoundingClientRect());
    update();
    const ro = new ResizeObserver(update);
    ro.observe(mainEl);
    return () => ro.disconnect();
  }, [visible]);

  useEffect(() => {
    if (visible) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [visible]);

  return { visible, overlayRect, text, finish };
}
