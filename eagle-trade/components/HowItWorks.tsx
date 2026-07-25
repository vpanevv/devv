"use client";

import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { fadeUp, EASE_OUT_EXPO, SectionHeading, staggerParent } from "./Reveal";

const steps = ["one", "two", "three"] as const;

export function HowItWorks() {
  const t = useTranslations("how");

  return (
    <section id="how" className="border-y border-white/10 bg-ink/40 text-sand">
      <div className="mx-auto max-w-6xl px-5 py-20 sm:px-8 sm:py-28">
        <SectionHeading title={t("title")} subtitle={t("subtitle")} />

        <div className="relative">
          {/* Connecting line — draws in on scroll through the centered step markers */}
          <svg
            className="absolute top-7 left-[16.7%] hidden h-2 w-[66.6%] lg:block"
            viewBox="0 0 100 2"
            preserveAspectRatio="none"
            aria-hidden="true"
          >
            <motion.line
              x1="0"
              y1="1"
              x2="100"
              y2="1"
              stroke="#00A19B"
              strokeWidth="2"
              strokeDasharray="1"
              initial={{ pathLength: 0 }}
              whileInView={{ pathLength: 1 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 1.4, ease: EASE_OUT_EXPO }}
            />
          </svg>

          <motion.ol
            variants={staggerParent}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-60px" }}
            className="relative grid gap-12 lg:grid-cols-3 lg:gap-8"
          >
            {steps.map((key, i) => (
              <motion.li
                key={key}
                variants={fadeUp}
                className="flex flex-col items-center text-center"
              >
                <span className="font-display relative z-10 flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-teal text-xl font-bold text-white shadow-lg shadow-teal/30">
                  {i + 1}
                </span>
                <div className="pt-5">
                  <h3 className="font-display text-xl font-bold text-sand">
                    {t(`steps.${key}.title`)}
                  </h3>
                  <p className="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-sand/70">
                    {t(`steps.${key}.description`)}
                  </p>
                </div>
              </motion.li>
            ))}
          </motion.ol>
        </div>
      </div>
    </section>
  );
}
