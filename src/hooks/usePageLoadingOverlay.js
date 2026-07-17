"use client";

import { useEffect, useRef, useState } from "react";

export default function usePageLoadingOverlay(text = "Loading...") {
  const [visible, setVisible] = useState(true);
  const startRef = useRef(null);
  const timeoutRef = useRef(null);

  const finish = () => {
    if (startRef.current === null) startRef.current = Date.now();
    const elapsed = Date.now() - startRef.current;
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

  return { visible, text, finish };
}
