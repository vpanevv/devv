"use client";

import { MotionConfig } from "framer-motion";
import { ReactLenis, useLenis, type LenisRef } from "lenis/react";
import { useEffect, useRef, useSyncExternalStore } from "react";

declare global {
  interface Window {
    __lenis?: import("lenis").default;
  }
}

const reducedMotionQuery = "(prefers-reduced-motion: reduce)";

function subscribeReducedMotion(onChange: () => void) {
  const mq = window.matchMedia(reducedMotionQuery);
  mq.addEventListener("change", onChange);
  return () => mq.removeEventListener("change", onChange);
}

function useReducedMotionPreference() {
  return useSyncExternalStore(
    subscribeReducedMotion,
    () => window.matchMedia(reducedMotionQuery).matches,
    () => false
  );
}

export function Providers({ children }: { children: React.ReactNode }) {
  const reduced = useReducedMotionPreference();
  const lenisRef = useRef<LenisRef>(null);

  // Route in-page anchor clicks through Lenis so smooth scroll owns the jump
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      const lenis = lenisRef.current?.lenis;
      if (!lenis) return;
      const anchor = (e.target as HTMLElement).closest?.('a[href^="#"]');
      if (!anchor) return;
      const id = anchor.getAttribute("href")!.slice(1);
      const target = id ? document.getElementById(id) : document.body;
      if (!target) return;
      e.preventDefault();
      lenis.scrollTo(target, { offset: id ? -24 : 0 });
    };
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, []);

  const content = (
    // reducedMotion="user" makes framer-motion skip transform/layout animations
    <MotionConfig reducedMotion="user">{children}</MotionConfig>
  );

  if (reduced) return content;

  return (
    <ReactLenis root options={{ lerp: 0.11, smoothWheel: true }} ref={lenisRef}>
      <ExposeLenis />
      {content}
    </ReactLenis>
  );
}

/** Makes the root Lenis instance reachable (debugging / external integrations). */
function ExposeLenis() {
  const lenis = useLenis();
  useEffect(() => {
    window.__lenis = lenis;
    return () => {
      window.__lenis = undefined;
    };
  }, [lenis]);
  return null;
}
