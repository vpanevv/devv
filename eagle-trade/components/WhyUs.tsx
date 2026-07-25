"use client";

import Image from "next/image";
import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { useTranslations } from "next-intl";
import { IMAGES } from "@/lib/site";
import { Reveal } from "./Reveal";

const bullets = ["one", "two", "three"] as const;

export function WhyUs() {
  const t = useTranslations("why");
  const ref = useRef<HTMLElement>(null);

  // Soft parallax: images drift slower than the page
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const yMain = useTransform(scrollYProgress, [0, 1], [50, -50]);
  const ySmall = useTransform(scrollYProgress, [0, 1], [90, -30]);

  return (
    <section ref={ref} id="why" className="overflow-hidden">
      <div className="mx-auto grid max-w-6xl items-center gap-12 px-5 py-20 sm:px-8 sm:py-28 lg:grid-cols-2 lg:gap-16">
        <div className="relative order-2 h-[420px] sm:h-[500px] lg:order-1">
          <motion.div
            style={{ y: yMain }}
            className="absolute top-0 left-0 h-[78%] w-[72%] overflow-hidden rounded-3xl shadow-2xl shadow-ink/20"
          >
            <Image
              src={IMAGES.house}
              alt={t("imageAlt1")}
              fill
              sizes="(min-width: 1024px) 40vw, 72vw"
              className="object-cover"
            />
          </motion.div>
          <motion.div
            style={{ y: ySmall }}
            className="absolute right-0 bottom-0 h-[52%] w-[52%] overflow-hidden rounded-3xl border-4 border-ink shadow-xl shadow-ink/40"
          >
            <Image
              src={IMAGES.interior}
              alt={t("imageAlt2")}
              fill
              sizes="(min-width: 1024px) 28vw, 52vw"
              className="object-cover"
            />
          </motion.div>
          <div
            className="absolute right-[38%] top-[8%] -z-10 h-40 w-40 rounded-full bg-teal/15 blur-3xl"
            aria-hidden="true"
          />
        </div>

        <div className="order-1 lg:order-2">
          <Reveal>
            <h2 className="font-display text-3xl font-bold tracking-tight text-sand sm:text-4xl lg:text-5xl">
              {t("title")}
            </h2>
          </Reveal>
          <Reveal delay={0.08}>
            <p className="mt-5 leading-relaxed text-sand/70">{t("p1")}</p>
            <p className="mt-4 leading-relaxed text-sand/70">{t("p2")}</p>
          </Reveal>
          <Reveal delay={0.16}>
            <ul className="mt-7 space-y-3">
              {bullets.map((key) => (
                <li key={key} className="flex items-start gap-3 text-sm font-medium text-sand sm:text-base">
                  <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-teal/20">
                    <svg width="11" height="11" viewBox="0 0 12 12" aria-hidden="true">
                      <path
                        d="M2 6.5 4.5 9 10 3.5"
                        stroke="#00A19B"
                        strokeWidth="2"
                        fill="none"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </span>
                  {t(`bullets.${key}`)}
                </li>
              ))}
            </ul>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
