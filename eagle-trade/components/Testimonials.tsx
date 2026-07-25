"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useTranslations } from "next-intl";
import { SectionHeading } from "./Reveal";

const keys = ["one", "two", "three"] as const;

export function Testimonials() {
  const t = useTranslations("testimonials");
  const [index, setIndex] = useState(0);
  const [onScreen, setOnScreen] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);
  const reduced = useReducedMotion();

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setOnScreen(e.isIntersecting));
    io.observe(el);
    return () => io.disconnect();
  }, []);

  // Only rotate while the section is actually on screen — off-screen ticks
  // would re-render and run transitions nobody can see.
  useEffect(() => {
    if (reduced || !onScreen) return;
    const id = setInterval(() => setIndex((i) => (i + 1) % keys.length), 6000);
    return () => clearInterval(id);
  }, [reduced, onScreen]);

  const key = keys[index];

  return (
    <section ref={sectionRef} id="testimonials" className="border-b border-white/10 bg-ink/30">
      <div className="mx-auto max-w-4xl px-5 py-20 sm:px-8 sm:py-28">
        <SectionHeading title={t("title")} />

        <div className="relative min-h-[240px] text-center sm:min-h-[200px]">
          <span
            className="font-display absolute -top-10 left-1/2 -translate-x-1/2 text-[110px] leading-none text-teal/35 select-none"
            aria-hidden="true"
          >
            “
          </span>
          <AnimatePresence mode="wait">
            <motion.blockquote
              key={key}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -14 }}
              transition={{ duration: 0.45, ease: "easeOut" }}
              className="relative mx-auto max-w-3xl pt-8"
            >
              <p className="font-display text-xl leading-relaxed text-sand sm:text-2xl">
                {t(`items.${key}.quote`)}
              </p>
              <footer className="mt-6">
                <p className="font-bold text-sand">{t(`items.${key}.name`)}</p>
                <p className="text-sm text-sand/70">{t(`items.${key}.meta`)}</p>
              </footer>
            </motion.blockquote>
          </AnimatePresence>
        </div>

        <div className="mt-8 flex justify-center gap-2" role="tablist" aria-label={t("title")}>
          {keys.map((k, i) => (
            <button
              key={k}
              role="tab"
              aria-selected={i === index}
              aria-label={t(`items.${k}.name`)}
              onClick={() => setIndex(i)}
              // Visual dot stays small; the button carries a 24px+ hit area.
              className="group flex h-6 items-center px-2"
            >
              <span
                className={`block h-2 rounded-full transition-all duration-400 ${
                  i === index ? "w-8 bg-teal" : "w-2 bg-white/25 group-hover:bg-white/45"
                }`}
              />
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
