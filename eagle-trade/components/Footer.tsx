"use client";

import { useLocale, useTranslations } from "next-intl";
import { EMAIL, PHONE, PHONE_DISPLAY, viberHref, whatsappHref } from "@/lib/site";
import { Logo } from "./Logo";
import { Reveal } from "./Reveal";

const WHATSAPP_PATH =
  "M12 2A9.9 9.9 0 0 0 2.06 11.9c0 1.75.46 3.45 1.32 4.95L2 22l5.3-1.38a9.96 9.96 0 0 0 4.7 1.18A9.9 9.9 0 0 0 21.94 11.9 9.9 9.9 0 0 0 12 2Zm0 18.1c-1.5 0-2.97-.4-4.25-1.16l-.3-.18-3.15.82.84-3.06-.2-.31a8.1 8.1 0 0 1-1.24-4.3A8.13 8.13 0 0 1 12 3.78a8.13 8.13 0 0 1 8.13 8.13A8.13 8.13 0 0 1 12 20.1Zm4.46-6.08c-.24-.12-1.44-.71-1.66-.8-.22-.08-.39-.12-.55.13-.16.24-.63.79-.77.95-.14.16-.28.18-.53.06a6.66 6.66 0 0 1-1.96-1.2 7.3 7.3 0 0 1-1.35-1.68c-.14-.24-.02-.37.1-.5.12-.11.25-.28.37-.43.12-.14.16-.24.24-.4.08-.17.04-.31-.02-.43-.06-.12-.55-1.32-.75-1.8-.2-.48-.4-.42-.55-.42h-.47c-.16 0-.43.06-.65.3-.22.25-.85.83-.85 2.02 0 1.2.87 2.35 1 2.51.12.16 1.71 2.6 4.14 3.65.58.25 1.03.4 1.38.51.58.19 1.11.16 1.53.1.47-.07 1.44-.59 1.64-1.16.2-.57.2-1.05.14-1.16-.06-.1-.22-.16-.46-.28Z";

/** Stylized mini-map of the three towns at the foot of Pirin. */
function AreaMap({ labels }: { labels: [string, string, string] }) {
  return (
    <svg viewBox="0 0 260 150" className="w-full" role="img" aria-label={labels.join(", ")}>
      <path d="M0 96 40 46 68 76 96 30 132 82 160 56 190 96Z" fill="#00A19B" opacity="0.16" />
      <path d="M60 96 96 44 126 78 150 60 190 96Z" fill="#00A19B" opacity="0.28" />
      <path
        d="M52 118 Q 105 96 130 62 Q 160 96 212 122"
        fill="none"
        stroke="#00A19B"
        strokeWidth="1.6"
        strokeDasharray="4 5"
        opacity="0.7"
      />
      {[
        { x: 52, y: 118, label: labels[0] },
        { x: 130, y: 62, label: labels[1] },
        { x: 212, y: 122, label: labels[2] },
      ].map((town) => (
        <g key={town.label}>
          <circle cx={town.x} cy={town.y} r="8" fill="#00A19B" opacity="0.25" />
          <circle cx={town.x} cy={town.y} r="3.5" fill="#00A19B" />
          <text
            x={town.x}
            y={town.y - 14}
            textAnchor="middle"
            fill="#E4DDD3"
            fontSize="11"
            fontWeight="600"
          >
            {town.label}
          </text>
        </g>
      ))}
    </svg>
  );
}

function Chevron({ className }: { className?: string }) {
  return (
    <svg
      width="15"
      height="15"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.4"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className}
    >
      <path d="m9 18 6-6-6-6" />
    </svg>
  );
}

export function Footer() {
  const t = useTranslations("footer");
  const c = useTranslations("contact");
  const f = useTranslations("floating");
  const locale = useLocale();
  const year = new Date().getFullYear();
  const brand = locale === "bg" ? "Игъл Трейд" : "Eagle Trade";

  const towns: [string, string, string] =
    locale === "bg" ? ["Банско", "Разлог", "с. Баня"] : ["Bansko", "Razlog", "Banya"];

  const navItems = [
    ["#services", t("nav.services")],
    ["#how", t("nav.how")],
    ["#why", t("nav.why")],
    ["#testimonials", t("nav.testimonials")],
    ["#contact", t("nav.contact")],
  ] as const;

  return (
    <footer className="relative overflow-hidden bg-ink/60 text-sand">
      {/* Teal hairline glow along the top edge */}
      <div
        aria-hidden="true"
        className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-teal/70 to-transparent"
      />
      <div
        aria-hidden="true"
        className="absolute -top-24 left-1/2 h-48 w-[36rem] -translate-x-1/2 rounded-full bg-teal/10 blur-3xl"
      />

      {/* Big CTA row */}
      <div className="mx-auto max-w-6xl px-5 pt-16 sm:px-8 sm:pt-24">
        <Reveal className="flex flex-col gap-7 border-b border-white/10 pb-12 sm:flex-row sm:items-end sm:justify-between sm:pb-16">
          <h2 className="font-display max-w-xl text-3xl font-bold tracking-tight text-sand sm:text-5xl">
            {t("ctaTitle")}
          </h2>
          <a
            href="#contact"
            className="group inline-flex w-fit shrink-0 items-center gap-2 rounded-full bg-teal px-6 py-3.5 text-sm font-bold text-white shadow-lg shadow-teal/25 transition-all hover:scale-[1.04] hover:shadow-teal/40 active:scale-[0.98] sm:px-7 sm:text-base"
          >
            {t("ctaButton")}
            <Chevron className="transition-transform duration-300 group-hover:translate-x-0.5" />
          </a>
        </Reveal>
      </div>

      {/* Link columns */}
      <div className="mx-auto grid max-w-6xl gap-10 px-5 py-12 sm:grid-cols-2 sm:px-8 sm:py-16 lg:grid-cols-12">
        <Reveal className="lg:col-span-4">
          <Logo onDark />
          <p className="mt-4 max-w-xs text-sm leading-relaxed text-sand/85">{t("tagline")}</p>
          <div className="mt-6 flex gap-2.5">
            <a
              href={whatsappHref(f("prefill"))}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={f("whatsapp")}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-white/15 text-sand/85 transition-all hover:scale-110 hover:border-teal hover:bg-teal hover:text-white"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d={WHATSAPP_PATH} />
              </svg>
            </a>
            <a
              href={viberHref()}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={f("viber")}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-white/15 text-sand/85 transition-all hover:scale-110 hover:border-teal hover:bg-teal hover:text-white"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M12.03 1.5c-1.72 0-6.03.2-8.36 2.34C2.1 5.4 1.56 7.72 1.5 10.6c-.05 2.87-.12 8.26 5.06 9.72v2.23s-.03.9.56 1.08c.72.23 1.14-.46 1.83-1.2l1.28-1.44c3.55.3 6.27-.38 6.58-.48.72-.24 4.8-.76 5.47-6.16.68-5.58-.34-9.1-2.15-10.67h-.01c-.55-.5-2.75-2.1-7.66-2.13 0 0-.22-.05-.43-.05Zm.15 1.6c.18 0 .36 0 .53.02 4.17.02 6 1.32 6.44 1.73 1.47 1.26 2.28 4.3 1.7 8.96-.55 4.5-3.7 4.88-4.3 5.07-.25.08-2.57.66-5.55.46 0 0-2.22 2.68-2.91 3.37-.11.12-.24.16-.32.14-.12-.03-.15-.17-.15-.37l.02-3.7c-4.38-1.21-4.12-5.8-4.08-8.2.05-2.41.5-4.38 1.83-5.7 2-1.83 5.7-2 7.24-1.9l-.45.12Zm-3.25 3.38c-.24-.04-.5.01-.71.14h-.02c-.5.29-.94.66-1.32 1.1-.32.37-.5.75-.54 1.11-.03.22 0 .44.09.65l.03.02a15.4 15.4 0 0 0 1.36 2.99 17.4 17.4 0 0 0 2.63 3.6l.03.05.05.04.03.03.03.03a17.5 17.5 0 0 0 3.61 2.64c1.5.82 2.4 1.2 2.95 1.37v.01c.16.05.3.07.45.07a2 2 0 0 0 1.32-.6c.44-.38.8-.83 1.09-1.32v-.01c.27-.51.18-1-.21-1.32a15.3 15.3 0 0 0-2.53-1.81c-.59-.32-1.19-.13-1.43.19l-.52.66c-.27.32-.75.28-.75.28l-.01.01c-3.61-.92-4.57-4.57-4.57-4.57s-.04-.5.29-.75l.65-.53c.31-.25.52-.85.19-1.44a15.3 15.3 0 0 0-1.8-2.53.96.96 0 0 0-.6-.32Z" />
              </svg>
            </a>
          </div>
        </Reveal>

        <Reveal delay={0.06} className="lg:col-span-2">
          <h3 className="mb-4 text-xs font-bold tracking-[0.16em] text-sand/85 uppercase">
            {t("explore")}
          </h3>
          <ul className="space-y-2.5">
            {navItems.map(([href, label]) => (
              <li key={href}>
                <a
                  href={href}
                  className="group inline-flex items-center gap-1.5 text-sm text-sand/85 transition-all hover:translate-x-1 hover:text-teal"
                >
                  <span className="h-px w-0 bg-teal transition-all duration-300 group-hover:w-3" />
                  {label}
                </a>
              </li>
            ))}
          </ul>
        </Reveal>

        <Reveal delay={0.12} className="lg:col-span-3">
          <h3 className="mb-4 text-xs font-bold tracking-[0.16em] text-sand/85 uppercase">
            {t("contactTitle")}
          </h3>
          <ul className="space-y-3">
            <li>
              <a
                href={`tel:${PHONE}`}
                className="font-display text-lg font-bold text-sand transition-colors hover:text-teal"
              >
                {PHONE_DISPLAY}
              </a>
            </li>
            <li>
              <a
                href={`mailto:${EMAIL}`}
                className="text-sm text-sand/85 underline decoration-white/20 underline-offset-4 transition-colors hover:text-teal hover:decoration-teal"
              >
                {EMAIL}
              </a>
            </li>
          </ul>
          <div className="mt-5 flex flex-wrap gap-2">
            {[c("locations.bansko"), c("locations.razlog"), c("locations.banya")].map((town) => (
              <span
                key={town}
                className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-xs text-sand/85"
              >
                {town}
              </span>
            ))}
          </div>
        </Reveal>

        <Reveal delay={0.18} className="lg:col-span-3">
          <div className="liquid-glass rounded-2xl p-4">
            <h3 className="mb-2 text-xs font-bold tracking-[0.16em] text-sand/85 uppercase">
              {t("areasTitle")}
            </h3>
            <AreaMap labels={towns} />
          </div>
        </Reveal>
      </div>

      {/* Bottom bar */}
      <div className="relative border-t border-white/10">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-5 sm:px-8">
          <p className="text-xs text-sand/75">
            © {year} {brand}. {t("rights")}
          </p>
          <a
            href="#"
            aria-label={t("backToTop")}
            className="group flex h-10 w-10 items-center justify-center rounded-full border border-white/15 text-sand/85 transition-all hover:border-teal hover:bg-teal/10 hover:text-teal"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
              className="transition-transform duration-300 group-hover:-translate-y-0.5"
            >
              <path d="M12 19V5m-7 7 7-7 7 7" />
            </svg>
          </a>
        </div>
      </div>

      {/* Giant half-clipped brand watermark */}
      <div aria-hidden="true" className="pointer-events-none relative h-24 overflow-hidden sm:h-40">
        <p className="font-display absolute top-0 left-1/2 -translate-x-1/2 bg-gradient-to-b from-teal/25 to-teal/0 bg-clip-text text-[24vw] leading-none font-bold tracking-tight whitespace-nowrap text-transparent select-none sm:text-[15vw]">
          {brand}
        </p>
      </div>
    </footer>
  );
}
