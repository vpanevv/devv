import { useEffect, useRef, useState } from "react";
import { ArrowRight, ChevronDown, Menu, Moon, X } from "lucide-react";
import { INSTAGRAM_URL, NAV_ITEMS } from "../site";
import InstagramIcon from "./InstagramIcon";

/** Every section id the nav can point at, for scroll-spy. */
const SPY_IDS = [
  "about",
  "services",
  "packages",
  "tarot",
  "products",
  "shop",
  "testimonials",
  "faq",
  "contact",
];

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [active, setActive] = useState<string>("");
  const navRef = useRef<HTMLElement>(null);

  /* Solidify the bar once the page moves. */
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  /* Highlight whichever section is currently in view. */
  useEffect(() => {
    const targets = SPY_IDS.map((id) => document.getElementById(id)).filter(
      (el): el is HTMLElement => el !== null,
    );
    if (!targets.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) setActive(`#${visible[0].target.id}`);
      },
      { rootMargin: "-30% 0px -60% 0px" },
    );

    targets.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  /* Close the dropdown on outside click or Escape. */
  useEffect(() => {
    const onPointerDown = (e: PointerEvent) => {
      if (!navRef.current?.contains(e.target as Node)) setOpenMenu(null);
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpenMenu(null);
        setMobileOpen(false);
      }
    };
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, []);

  /* Lock body scroll while the mobile panel is open. */
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  const isActive = (item: (typeof NAV_ITEMS)[number]) =>
    active === item.href || item.children?.some((c) => c.href === active);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 border-b transition-colors duration-300 ${
        scrolled
          ? "border-gold/15 bg-cosmos/85 backdrop-blur-xl"
          : "border-transparent bg-cosmos/40 backdrop-blur-md"
      }`}
    >
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-5 py-3.5">
        {/* Logo */}
        <a href="#top" className="flex shrink-0 items-center gap-3">
          <span className="border-gold/30 text-gold grid size-10 place-items-center rounded-full border bg-white/5">
            <Moon aria-hidden className="size-4" />
          </span>
          <span className="leading-tight">
            <span className="font-serif text-gold-soft block text-lg">
              Magdalena
            </span>
            <span className="text-muted-foreground block text-[10px] tracking-[0.3em] uppercase">
              Bangeeva
            </span>
          </span>
        </a>

        {/* Desktop nav */}
        <nav ref={navRef} className="hidden lg:block">
          <ul className="flex items-center gap-1">
            {NAV_ITEMS.map((item) => {
              const open = openMenu === item.label;
              return (
                <li
                  key={item.label}
                  className="relative"
                  onMouseEnter={() =>
                    item.children && setOpenMenu(item.label)
                  }
                  onMouseLeave={() => item.children && setOpenMenu(null)}
                >
                  {item.children ? (
                    <>
                      <button
                        type="button"
                        aria-expanded={open}
                        aria-haspopup="true"
                        onClick={() => setOpenMenu(open ? null : item.label)}
                        className={`flex items-center gap-1.5 rounded-full px-3.5 py-2 text-sm transition-colors ${
                          isActive(item)
                            ? "text-gold"
                            : "text-white/75 hover:text-gold"
                        }`}
                      >
                        {item.label}
                        <ChevronDown
                          aria-hidden
                          className={`size-3.5 transition-transform duration-300 ${
                            open ? "rotate-180" : ""
                          }`}
                        />
                      </button>

                      <div
                        className={`border-gold/20 bg-cosmos/95 absolute top-full left-1/2 w-64 -translate-x-1/2 rounded-2xl border p-2 shadow-[0_24px_60px_-30px_oklch(4%_0.02_285/0.95)] backdrop-blur-xl transition-all duration-200 ${
                          open
                            ? "visible translate-y-2 opacity-100"
                            : "invisible translate-y-0 opacity-0"
                        }`}
                      >
                        <ul>
                          {item.children.map((child) => (
                            <li key={child.label}>
                              <a
                                href={child.href}
                                onClick={() => setOpenMenu(null)}
                                className={`block rounded-xl px-3.5 py-2.5 text-sm transition-colors ${
                                  active === child.href
                                    ? "bg-gold/10 text-gold"
                                    : "hover:bg-gold/10 text-white/80 hover:text-gold"
                                }`}
                              >
                                {child.label}
                              </a>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </>
                  ) : (
                    <a
                      href={item.href}
                      className={`block rounded-full px-3.5 py-2 text-sm transition-colors ${
                        isActive(item)
                          ? "text-gold"
                          : "text-white/75 hover:text-gold"
                      }`}
                    >
                      {item.label}
                    </a>
                  )}
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Actions */}
        <div className="flex shrink-0 items-center gap-2.5">
          <a
            href={INSTAGRAM_URL}
            target="_blank"
            rel="noreferrer noopener"
            aria-label="Instagram профил на Магдалена Бангеева"
            className="border-gold/25 text-gold hover:border-gold/60 hover:bg-gold/10 hidden size-10 place-items-center rounded-full border transition-colors sm:grid"
          >
            <InstagramIcon className="size-4" />
          </a>
          <a
            href="#contact"
            className="text-cosmos group hidden items-center gap-2 rounded-full bg-[linear-gradient(135deg,oklch(88%_0.09_85)_0%,oklch(78%_0.12_75)_100%)] px-5 py-2.5 text-sm font-bold transition-all duration-300 hover:brightness-110 sm:inline-flex"
          >
            Запиши
            <ArrowRight
              aria-hidden
              className="size-3.5 transition-transform duration-300 group-hover:translate-x-0.5"
            />
          </a>

          <button
            type="button"
            onClick={() => setMobileOpen((v) => !v)}
            aria-expanded={mobileOpen}
            aria-controls="mobile-nav"
            aria-label={mobileOpen ? "Затвори менюто" : "Отвори менюто"}
            className="border-gold/25 text-gold hover:border-gold/60 grid size-10 place-items-center rounded-full border transition-colors lg:hidden"
          >
            {mobileOpen ? (
              <X aria-hidden className="size-5" />
            ) : (
              <Menu aria-hidden className="size-5" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile panel */}
      <div
        id="mobile-nav"
        // `invisible` when closed keeps the collapsed links out of the tab
        // order — max-height alone only hides them visually.
        className={`border-gold/15 bg-cosmos/97 overflow-y-auto border-t backdrop-blur-xl transition-[max-height,opacity] duration-300 lg:hidden ${
          mobileOpen
            ? "visible max-h-[80vh] opacity-100"
            : "invisible max-h-0 opacity-0"
        }`}
      >
        <nav className="mx-auto max-w-6xl px-5 py-4">
          <ul className="space-y-1">
            {NAV_ITEMS.map((item) => (
              <li key={item.label}>
                <a
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className={`block rounded-xl px-4 py-3 text-[15px] font-medium transition-colors ${
                    isActive(item)
                      ? "bg-gold/10 text-gold"
                      : "text-white/85 hover:bg-white/5"
                  }`}
                >
                  {item.label}
                </a>
                {item.children && (
                  <ul className="border-gold/15 mt-1 ml-4 space-y-1 border-l pl-3">
                    {item.children.map((child) => (
                      <li key={child.label}>
                        <a
                          href={child.href}
                          onClick={() => setMobileOpen(false)}
                          className="text-muted-foreground hover:text-gold flex min-h-11 items-center rounded-lg px-3 text-sm transition-colors"
                        >
                          {child.label}
                        </a>
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            ))}
            <li className="pt-3">
              <a
                href="#contact"
                onClick={() => setMobileOpen(false)}
                className="text-cosmos flex items-center justify-center gap-2 rounded-full bg-[linear-gradient(135deg,oklch(88%_0.09_85)_0%,oklch(78%_0.12_75)_100%)] px-5 py-3 text-sm font-bold"
              >
                Запиши консултация
                <ArrowRight aria-hidden className="size-4" />
              </a>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
}
