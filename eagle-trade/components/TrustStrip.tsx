"use client";

import { useEffect, useRef } from "react";
import {
  animate,
  motion,
  useInView,
  useMotionValue,
  useReducedMotion,
  useTransform,
} from "framer-motion";
import { useTranslations } from "next-intl";

function Stat({
  value,
  prefix = "",
  suffix = "",
  label,
  decimals = 0,
}: {
  value: number;
  prefix?: string;
  suffix?: string;
  label: string;
  decimals?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  const reduced = useReducedMotion();
  const mv = useMotionValue(0);
  const text = useTransform(mv, (v) =>
    v.toLocaleString("en-US", {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    })
  );

  useEffect(() => {
    if (!inView) return;
    if (reduced) {
      mv.set(value);
      return;
    }
    const controls = animate(mv, value, { duration: 1.8, ease: [0.16, 1, 0.3, 1] });
    return () => controls.stop();
  }, [inView, reduced, mv, value]);

  return (
    <div ref={ref} className="flex flex-col items-center gap-1 text-center">
      <p className="font-display text-3xl font-bold text-sand sm:text-4xl">
        {prefix}
        <motion.span>{text}</motion.span>
        <span className="text-teal">{suffix}</span>
      </p>
      <p className="max-w-[12rem] text-xs leading-snug text-sand/70 sm:text-sm">{label}</p>
    </div>
  );
}

export function TrustStrip() {
  const t = useTranslations("trust");
  return (
    <section id="trust" className="border-b border-white/10">
      <div className="mx-auto grid max-w-6xl grid-cols-2 gap-x-4 gap-y-8 px-5 py-12 sm:px-8 lg:grid-cols-4 lg:py-16">
        <Stat value={87} suffix={t("occupancy.suffix")} label={t("occupancy.label")} />
        <Stat value={120} suffix={t("properties.suffix")} label={t("properties.label")} />
        <Stat value={9400} prefix={t("payout.prefix")} label={t("payout.label")} />
        <Stat value={4.9} decimals={1} suffix={t("rating.suffix")} label={t("rating.label")} />
      </div>
    </section>
  );
}
