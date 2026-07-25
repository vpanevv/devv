"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { LangToggle } from "./LangToggle";
import { Logo } from "./Logo";

export function Header() {
  const t = useTranslations("header");
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-500 ${
        scrolled ? "bg-ink/70 shadow-[0_1px_0_0_rgba(255,255,255,0.08)] backdrop-blur-md" : ""
      }`}
    >
      <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-3.5 sm:px-8">
        <Logo onDark />
        <div className="flex items-center gap-3">
          <LangToggle onDark />
          <a
            href="#contact"
            className="hidden rounded-full bg-teal px-4 py-2 text-sm font-bold text-white shadow-md shadow-teal/25 transition-transform hover:scale-[1.04] active:scale-[0.98] sm:block"
          >
            {t("cta")}
          </a>
        </div>
      </div>
    </header>
  );
}
