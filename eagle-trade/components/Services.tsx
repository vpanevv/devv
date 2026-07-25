"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { fadeUp, Reveal, staggerParent } from "./Reveal";
// Static import so Next can emit an inline blur placeholder — the photo fades
// in from a blurred preview instead of popping in when scrolled to.
import servicesBg from "@/public/services-bg.jpg";

const icons: Record<string, React.ReactNode> = {
  management: <path d="M3 21V8l9-5 9 5v13M9 21v-6h6v6M3 21h18" />,
  cleaning: (
    <path d="M12 3v3m0 12v3m9-9h-3M6 12H3m13.5-6.5-2 2m-7 7-2 2m11 0-2-2m-7-7-2-2M12 8.5 13.2 11l2.6 1-2.6 1L12 15.5 10.8 13l-2.6-1 2.6-1L12 8.5Z" />
  ),
  repairs: (
    <path d="M14.7 6.3a4.5 4.5 0 0 0-6 5.6L3 17.6V21h3.4l5.7-5.7a4.5 4.5 0 0 0 5.6-6l-3 3-2.8-.7-.7-2.8 3.5-2.5Z" />
  ),
  transfers: (
    <path d="M5 17h-2v-5l2-6h12l3 4h2v7h-2m-13 0a2 2 0 1 0 4 0m-4 0a2 2 0 1 1 4 0m5 0a2 2 0 1 0 4 0m-4 0a2 2 0 1 1 4 0M3 12h16" />
  ),
};

const keys = ["management", "cleaning", "repairs", "transfers"] as const;

export function Services() {
  const t = useTranslations("services");

  return (
    <section
      id="services"
      // Extra height on phones: the panel is taller there, so without this the
      // photo would be reduced to a sliver above it.
      className="relative flex min-h-[128svh] flex-col justify-end overflow-hidden sm:min-h-svh"
    >
      {/* Property photo fills the section; content sits in the lower third so
          the room and the slope view stay clearly readable above it. */}
      <Image
        src={servicesBg}
        alt={t("imageAlt")}
        fill
        placeholder="blur"
        sizes="100vw"
        className="object-cover"
      />
      {/* The photo stays untouched across the top, then ramps to a strong dark
          exactly where the glass panel sits. Darkening the backdrop instead of
          the card is what lets the card itself stay barely tinted. */}
      <div
        aria-hidden="true"
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(to top, rgba(22,22,22,0.95) 0%, rgba(22,22,22,0.85) 40%, rgba(22,22,22,0.58) 63%, rgba(22,22,22,0.12) 80%, transparent 100%)",
        }}
      />

      <div className="relative mx-auto w-full max-w-6xl px-5 pt-24 pb-10 sm:px-8 sm:pb-14">
        {/* NOTE: no animated wrapper around this panel. A parent with transform
            or opacity < 1 creates a new backdrop root, which switches
            backdrop-filter off — the glass would render unblurred during the
            entrance animation and then visibly snap. Inner content animates
            instead; descendants don't affect the panel's backdrop. */}
        <div className="liquid-glass-dark rounded-[2rem] p-6 sm:p-9">
          <Reveal className="mx-auto mb-8 max-w-2xl text-center">
            <h2 className="font-display text-3xl font-bold tracking-tight text-sand sm:text-4xl lg:text-5xl">
              {t("title")}
            </h2>
            <p className="mt-3 text-base text-sand/90 sm:text-lg">
              {t("subtitle")}
            </p>
          </Reveal>

          <motion.ul
            variants={staggerParent}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-60px" }}
            // Two columns even on phones — stacking all four would grow the
            // panel until it swallowed the photo behind it.
            className="grid grid-cols-2 gap-2.5 sm:gap-3 lg:grid-cols-4"
          >
            {keys.map((key) => (
              <motion.li
                key={key}
                variants={fadeUp}
                whileHover={{ y: -6 }}
                // No fill by default: a white tint here would lighten the
                // glass backdrop and drop the text below AA contrast.
                className="group flex flex-col items-center rounded-2xl border border-white/12 p-4 text-center transition-[box-shadow,border-color,background-color] duration-300 hover:border-teal/60 hover:bg-white/[0.07] hover:shadow-[0_18px_45px_-18px_rgba(0,161,155,0.6)] sm:p-5"
              >
                <span className="mb-3 flex h-10 w-10 items-center justify-center rounded-2xl bg-teal/20 text-teal transition-colors group-hover:bg-teal group-hover:text-white sm:mb-4 sm:h-11 sm:w-11">
                  <svg
                    width="22"
                    height="22"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.7"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    {icons[key]}
                  </svg>
                </span>
                <h3 className="font-display text-base font-bold text-sand sm:text-lg">
                  {t(`items.${key}.title`)}
                </h3>
                <p className="mt-1.5 text-[13px] leading-relaxed text-sand/90 sm:text-sm">
                  {t(`items.${key}.description`)}
                </p>
              </motion.li>
            ))}
          </motion.ul>
        </div>
      </div>
    </section>
  );
}
