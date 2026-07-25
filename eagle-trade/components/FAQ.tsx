"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { EASE_OUT_EXPO, Reveal, SectionHeading } from "./Reveal";

const keys = ["one", "two", "three", "four", "five", "six"] as const;
type Key = (typeof keys)[number];

export function FAQ() {
  const t = useTranslations("faq");
  const [open, setOpen] = useState<Key | null>("one");

  // FAQPage structured data for rich results
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: keys.map((k) => ({
      "@type": "Question",
      name: t(`items.${k}.q`),
      acceptedAnswer: { "@type": "Answer", text: t(`items.${k}.a`) },
    })),
  };

  return (
    <section id="faq" className="mx-auto max-w-3xl px-5 py-20 sm:px-8 sm:py-28">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <SectionHeading title={t("title")} subtitle={t("subtitle")} />

      <Reveal>
        <div className="space-y-3">
          {keys.map((k) => {
            const isOpen = open === k;
            return (
              <div
                key={k}
                className={`rounded-2xl border transition-colors duration-300 ${
                  isOpen
                    ? "border-teal/50 bg-white/[0.07] shadow-[0_16px_40px_-24px_rgba(0,161,155,0.6)]"
                    : "border-white/10 bg-white/[0.03] hover:border-teal/30"
                }`}
              >
                <button
                  type="button"
                  onClick={() => setOpen(isOpen ? null : k)}
                  aria-expanded={isOpen}
                  className="flex w-full items-center justify-between gap-4 rounded-2xl px-5 py-4 text-left sm:px-6 sm:py-5"
                >
                  <span className="font-display text-base font-bold text-sand sm:text-lg">
                    {t(`items.${k}.q`)}
                  </span>
                  <motion.span
                    animate={{ rotate: isOpen ? 45 : 0 }}
                    transition={{ duration: 0.35, ease: EASE_OUT_EXPO }}
                    aria-hidden="true"
                    className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full transition-colors ${
                      isOpen ? "bg-teal text-white" : "bg-teal/15 text-teal"
                    }`}
                  >
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.4"
                      strokeLinecap="round"
                    >
                      <path d="M12 5v14M5 12h14" />
                    </svg>
                  </motion.span>
                </button>
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      key="answer"
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.4, ease: EASE_OUT_EXPO }}
                      className="overflow-hidden"
                    >
                      <p className="px-5 pb-5 text-sm leading-relaxed text-sand/70 sm:px-6 sm:pb-6 sm:text-base">
                        {t(`items.${k}.a`)}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </Reveal>
    </section>
  );
}
