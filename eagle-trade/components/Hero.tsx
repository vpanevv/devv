"use client";

import { useEffect, useRef, useState } from "react";
import {
  motion,
  useAnimationFrame,
  useReducedMotion,
  useScroll,
  useTransform,
} from "framer-motion";
import { useTranslations } from "next-intl";
import { HERO_VIDEO, PAGE_BACKGROUND } from "@/lib/site";
import { Typewriter } from "./Typewriter";

const EASE_OUT_EXPO = [0.16, 1, 0.3, 1] as const;

/* Cursor-proximity variable-weight morph (Playfair Display wght axis 400–900) */
const FROM_WEIGHT = 450;
const TO_WEIGHT = 900;
const REACH = 280; // px radius around the cursor with any effect
const TAU = 0.25; // seconds — exponential ramp in/out speed

/**
 * Headline whose letters individually morph their `wght` based on cursor
 * proximity. Per-frame `fontVariationSettings` mutation happens directly on
 * the DOM nodes (bypassing React) — at 60fps per letter anything else would
 * thrash. The sr-only span carries the semantic text; visible letters are
 * aria-hidden.
 */
function ProximityBrandTitle({ lead, highlight }: { lead: string; highlight: string }) {
  const reduced = useReducedMotion();
  const headingRef = useRef<HTMLHeadingElement>(null);
  const letterRefs = useRef<Array<HTMLSpanElement | null>>([]);
  const factorsRef = useRef<number[]>([]);
  const lastFrameRef = useRef(0);
  const mouseRef = useRef({ x: -99999, y: -99999 });
  // Skip all per-frame work once the headline scrolls out of view.
  const onScreenRef = useRef(true);

  useEffect(() => {
    const el = headingRef.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => {
      onScreenRef.current = e.isIntersecting;
    });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    if (reduced) return;
    const onMove = (e: MouseEvent) => {
      mouseRef.current = { x: e.clientX, y: e.clientY };
    };
    const onTouch = (e: TouchEvent) => {
      const t = e.touches[0];
      if (t) mouseRef.current = { x: t.clientX, y: t.clientY };
    };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("touchmove", onTouch, { passive: true });
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("touchmove", onTouch);
    };
  }, [reduced]);

  useAnimationFrame((now) => {
    if (reduced || !onScreenRef.current) return;
    // Frame delta in seconds, clamped so a stalled tab can't jump.
    const prev = lastFrameRef.current || now;
    const dt = Math.min(0.1, Math.max(0, (now - prev) / 1000));
    lastFrameRef.current = now;
    // Exponential smoothing toward the proximity target (ramp in AND out).
    const a = 1 - Math.exp(-dt / TAU);
    const { x: mx, y: my } = mouseRef.current;

    for (let i = 0; i < letterRefs.current.length; i++) {
      const el = letterRefs.current[i];
      if (!el) continue;
      const r = el.getBoundingClientRect();
      const dist = Math.hypot(mx - (r.left + r.width / 2), my - (r.top + r.height / 2));
      const target = Math.min(Math.max(1 - dist / REACH, 0), 1);
      const f = (factorsRef.current[i] ?? 0) + (target - (factorsRef.current[i] ?? 0)) * a;
      factorsRef.current[i] = f;
      const w = Math.round(FROM_WEIGHT + (TO_WEIGHT - FROM_WEIGHT) * f);
      const settings = `'wght' ${w}`;
      if (el.style.fontVariationSettings !== settings) {
        el.style.fontVariationSettings = settings;
      }
    }
  });

  const words: { text: string; highlight: boolean }[] = [
    ...lead.split(" ").map((text) => ({ text, highlight: false })),
    { text: highlight, highlight: true },
  ];

  // Flat letter index of each word's first letter (pure render math).
  let running = 0;
  const wordOffsets = words.map((w) => {
    const offset = running;
    running += w.text.length;
    return offset;
  });
  const totalLetters = running;

  // Drop stale entries if the label ever shortens (e.g. locale switch).
  useEffect(() => {
    letterRefs.current.length = totalLetters;
    factorsRef.current.length = totalLetters;
  }, [totalLetters]);

  return (
    <h1
      ref={headingRef}
      className="font-display text-[56px] leading-[1.02] font-bold text-white sm:text-8xl"
    >
      <span className="sr-only">
        {lead} {highlight}
      </span>
      {words.map((word, wi) => (
        <span key={wi} aria-hidden="true">
          <span className="inline-block overflow-hidden pb-2 align-bottom whitespace-nowrap">
            <motion.span
              className="inline-block"
              initial={{ y: "112%", opacity: 0.001, filter: "blur(10px)" }}
              animate={{ y: 0, opacity: 1, filter: "blur(0px)" }}
              transition={{ duration: 0.9, ease: EASE_OUT_EXPO, delay: 0.2 + wi * 0.12 }}
            >
              {word.text.split("").map((letter, li) => {
                const idx = wordOffsets[wi] + li;
                return (
                  <span
                    key={li}
                    ref={(el) => {
                      letterRefs.current[idx] = el;
                    }}
                    className={`inline-block ${word.highlight ? "text-teal" : ""}`}
                    style={{ fontVariationSettings: `'wght' ${FROM_WEIGHT}` }}
                  >
                    {letter}
                  </span>
                );
              })}
            </motion.span>
          </span>
          {wi < words.length - 1 ? " " : ""}
        </span>
      ))}
    </h1>
  );
}

export function Hero() {
  const t = useTranslations("hero");
  const a11y = useTranslations("a11y");
  const ref = useRef<HTMLElement>(null);
  const reduced = useReducedMotion();
  const [videoReady, setVideoReady] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Browsers pause background autoplay in hidden tabs and don't always
  // resume it — kick playback whenever the page becomes visible again.
  useEffect(() => {
    const tryPlay = () => {
      if (!document.hidden) videoRef.current?.play().catch(() => {});
    };
    tryPlay();
    document.addEventListener("visibilitychange", tryPlay);
    return () => document.removeEventListener("visibilitychange", tryPlay);
  }, [reduced]);

  // The SSR'd <video> starts loading before React hydrates, so its
  // loadeddata/canplay may fire before any React handler is attached and
  // never re-fire. Check readyState on mount and use native listeners.
  useEffect(() => {
    if (reduced) return;
    const v = videoRef.current;
    if (!v) return;
    const markReady = () => setVideoReady(true);
    if (v.readyState >= 2) {
      markReady();
      return;
    }
    v.addEventListener("loadeddata", markReady);
    v.addEventListener("canplay", markReady);
    return () => {
      v.removeEventListener("loadeddata", markReady);
      v.removeEventListener("canplay", markReady);
    };
  }, [reduced]);

  // Layered scroll-out: backdrop darkens while content drifts away
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });
  const darken = useTransform(scrollYProgress, [0, 1], [0, 0.55]);
  const contentY = useTransform(scrollYProgress, [0, 1], [0, 120]);
  const contentOpacity = useTransform(scrollYProgress, [0, 0.7], [1, 0]);

  return (
    <section
      ref={ref}
      className="relative h-svh overflow-hidden bg-ink"
      aria-label="Hero"
    >
      <div className="absolute inset-0">
        {/* Reduced-motion users get the same scene as a still frame rather
            than an empty dark box — less movement, not less content. */}
        {reduced && (
          <div
            aria-hidden="true"
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url(${PAGE_BACKGROUND})` }}
          />
        )}
        {/* The looping video is the sole hero backdrop; it fades in from the
            solid ink base once the first frame is decodable. */}
        {!reduced && (
          <video
            ref={videoRef}
            autoPlay
            loop
            muted
            playsInline
            preload="auto"
            // Same file as the page backdrop, so it is already in cache — the
            // hero shows a real first frame with no extra request.
            poster={PAGE_BACKGROUND}
            aria-hidden="true"
            onError={() => setVideoReady(false)}
            src={HERO_VIDEO}
            className={`pointer-events-none absolute inset-0 h-full w-full object-cover transition-opacity duration-700 ${
              videoReady ? "opacity-100" : "opacity-0"
            }`}
          />
        )}
        {/* Legibility gradient + scroll-linked darkening */}
        <div className="absolute inset-0 bg-gradient-to-t from-ink/85 via-ink/25 to-ink/40" />
        <motion.div style={{ opacity: darken }} className="absolute inset-0 bg-ink" />
      </div>

      <motion.div
        style={{ y: contentY, opacity: contentOpacity }}
        className="relative mx-auto flex h-full max-w-4xl flex-col items-center justify-center px-5 text-center sm:px-8"
      >
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: EASE_OUT_EXPO, delay: 0.05 }}
          className="font-inscribed mb-6 inline-flex w-fit items-center gap-2.5 text-base tracking-[0.2em] text-sand uppercase sm:gap-3 sm:text-xl lg:text-2xl"
        >
          <span className="relative flex h-2 w-2 shrink-0" aria-hidden="true">
            <span className="animate-pulse-ring absolute inset-0 rounded-full bg-teal" />
            <span className="relative h-2 w-2 rounded-full bg-teal" />
          </span>
          <Typewriter
            prefix={t("eyebrowPrefix")}
            texts={t.raw("eyebrowWords") as string[]}
          />
        </motion.p>

        <ProximityBrandTitle lead={t("brandLead")} highlight={t("brandHighlight")} />

        <motion.h2
          initial={{ opacity: 0, y: 18, filter: "blur(6px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          transition={{ duration: 0.8, ease: EASE_OUT_EXPO, delay: 0.7 }}
          className="font-display mt-4 text-2xl font-semibold text-white/90 sm:text-3xl lg:text-4xl"
        >
          {t("titleLead")} <span className="text-teal">{t("titleHighlight")}</span>{" "}
          {t("titleTail")}
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: EASE_OUT_EXPO, delay: 0.9 }}
          className="mt-6 max-w-xl text-base leading-relaxed text-sand/80 sm:text-lg"
        >
          {t("subtitle")}
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: EASE_OUT_EXPO, delay: 1.1 }}
          className="mt-9 flex flex-wrap items-center justify-center gap-3"
        >
          <motion.a
            href="#contact"
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            className="group inline-flex items-center gap-2 rounded-full bg-white px-6 py-3.5 text-sm font-bold text-ink shadow-[0_20px_50px_-18px_rgba(255,255,255,0.45)] transition-colors hover:bg-white/90 sm:px-7 sm:text-base"
          >
            {t("cta")}
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.4"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
              className="text-teal-deep transition-transform duration-300 group-hover:translate-x-0.5"
            >
              <path d="m9 18 6-6-6-6" />
            </svg>
          </motion.a>
          <motion.a
            href="#how"
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            className="inline-flex items-center gap-2 rounded-full border border-white/20 px-6 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-white/5 sm:px-7 sm:text-base"
          >
            {t("ctaSecondary")}
          </motion.a>
        </motion.div>
      </motion.div>

      {/* Scroll cue */}
      <motion.a
        href="#trust"
        aria-label={a11y("scrollDown")}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.8, duration: 0.8 }}
        style={{ opacity: contentOpacity }}
        className="absolute bottom-6 left-1/2 flex -translate-x-1/2 flex-col items-center gap-2"
      >
        <span className="text-[10px] font-semibold tracking-[0.2em] text-sand/70 uppercase">
          {t("scroll")}
        </span>
        <span className="relative block h-9 w-px overflow-hidden bg-white/25">
          <motion.span
            className="absolute left-0 top-0 h-3 w-px bg-teal"
            animate={{ y: [0, 36] }}
            transition={{ duration: 1.4, repeat: Infinity, ease: "easeInOut" }}
          />
        </span>
      </motion.a>
    </section>
  );
}
