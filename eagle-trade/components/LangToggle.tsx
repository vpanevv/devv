"use client";

import { useLocale, useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";

export function LangToggle({ onDark = false }: { onDark?: boolean }) {
  const locale = useLocale();
  const pathname = usePathname();
  const t = useTranslations("a11y");

  return (
    <div
      aria-label={t("langSwitch")}
      className={`flex items-center gap-0.5 rounded-full p-0.5 text-xs font-semibold tracking-wide ${
        onDark ? "bg-white/10" : "bg-ink/8"
      }`}
    >
      {routing.locales.map((l) => {
        const active = l === locale;
        return (
          <Link
            key={l}
            href={pathname}
            locale={l}
            aria-current={active ? "true" : undefined}
            className={`rounded-full px-3 py-1.5 uppercase transition-colors ${
              active
                ? "bg-teal text-white"
                : onDark
                  ? "text-white/80 hover:text-white"
                  : "text-ink/60 hover:text-ink"
            }`}
          >
            {l}
          </Link>
        );
      })}
    </div>
  );
}
