import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, Quote, Sparkles, Star } from "lucide-react";
import "./Testimonials.css";

/**
 * PLACEHOLDER COPY — written to fill the layout while the real client
 * testimonials are pending. Replace every entry below before the site goes
 * live; none of these are real people or real quotes.
 */
const TESTIMONIALS = [
  {
    quote:
      "Наталната карта ми обясни неща, които усещах от години, но не можех да назова. Излязох от консултацията с усещането, че най-накрая разбирам себе си.",
    name: "Виктория Д.",
    meta: "Натална карта",
  },
  {
    quote:
      "Дните с финансова активност ги ползвам за преговори и важни срещи. Разликата се усеща — вече планирам месеца си според календара.",
    name: "Елена П.",
    meta: "Дни с финансова активност",
  },
  {
    quote:
      "Очаквах общи приказки, а получих конкретен план — кога, какво и защо. Магдалена говори директно и без излишен мистицизъм.",
    name: "Деян С.",
    meta: "Кариерно развитие и финанси",
  },
  {
    quote:
      "Амулетът се изработва лично за теб и това си личи. Нося го всеки ден и ми носи спокойствие, а изработката е истинско произведение.",
    name: "Калина М.",
    meta: "Авторски амулет",
  },
];

export default function Testimonials() {
  const trackRef = useRef<HTMLDivElement>(null);
  const [atStart, setAtStart] = useState(true);
  const [atEnd, setAtEnd] = useState(false);

  const syncArrows = useCallback(() => {
    const el = trackRef.current;
    if (!el) return;
    setAtStart(el.scrollLeft <= 2);
    setAtEnd(el.scrollLeft + el.clientWidth >= el.scrollWidth - 2);
  }, []);

  useEffect(() => {
    syncArrows();
    window.addEventListener("resize", syncArrows);
    return () => window.removeEventListener("resize", syncArrows);
  }, [syncArrows]);

  const slide = (direction: 1 | -1) => {
    const el = trackRef.current;
    if (!el) return;
    const card = el.querySelector<HTMLElement>(".tm-card");
    const step = card ? card.offsetWidth + 20 : el.clientWidth * 0.8;
    el.scrollBy({ left: direction * step, behavior: "smooth" });
  };

  return (
    <section
      id="testimonials"
      className="border-gold/10 relative border-t px-5 py-20 sm:py-28"
    >
      <div className="mx-auto max-w-6xl">
        <header className="mb-10 flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div className="text-center sm:text-left">
            <p className="text-gold/85 text-[11px] tracking-[0.28em] uppercase sm:tracking-[0.36em]">
              <Sparkles aria-hidden className="mr-2 mb-1 inline size-3.5" />
              Отзиви
            </p>
            <h2 className="font-display text-gold-gradient mt-3 text-[clamp(1.9rem,5vw,3.25rem)] leading-tight tracking-[0.03em] uppercase">
              Какво казват клиентите
            </h2>
          </div>

          <div className="flex justify-center gap-3 sm:justify-end">
            <button
              type="button"
              onClick={() => slide(-1)}
              disabled={atStart}
              aria-label="Предишен отзив"
              className="tm-arrow border-gold/30 text-gold hover:border-gold/60 hover:bg-gold/10 grid size-11 place-items-center rounded-full border transition-colors"
            >
              <ChevronLeft aria-hidden className="size-5" />
            </button>
            <button
              type="button"
              onClick={() => slide(1)}
              disabled={atEnd}
              aria-label="Следващ отзив"
              className="tm-arrow border-gold/30 text-gold hover:border-gold/60 hover:bg-gold/10 grid size-11 place-items-center rounded-full border transition-colors"
            >
              <ChevronRight aria-hidden className="size-5" />
            </button>
          </div>
        </header>

        <div
          ref={trackRef}
          onScroll={syncArrows}
          tabIndex={0}
          role="group"
          aria-label="Отзиви от клиенти"
          className="tm-track focus-visible:outline-gold/60 focus-visible:outline-2 focus-visible:outline-offset-4"
        >
          {TESTIMONIALS.map(({ quote, name, meta }) => (
            <figure
              key={name}
              className="tm-card border-gold/15 flex flex-col rounded-3xl border bg-[oklch(20%_0.06_292/0.42)] p-6 shadow-[0_24px_60px_-40px_oklch(4%_0.02_285/0.9)] backdrop-blur-md transition-all duration-300 hover:-translate-y-1 hover:border-gold/35 hover:shadow-[0_0_45px_-22px_oklch(0.82_0.10_80/0.7)]"
            >
              <Quote
                aria-hidden
                className="text-gold/50 size-7 shrink-0"
                strokeWidth={1.5}
              />

              <blockquote className="mt-4 flex-1 text-[15px] leading-relaxed text-white/85">
                {quote}
              </blockquote>

              <div
                aria-hidden
                className="text-gold mt-5 flex gap-1"
                title="5 от 5"
              >
                {Array.from({ length: 5 }, (_, i) => (
                  <Star key={i} className="size-3.5 fill-current" />
                ))}
              </div>

              <figcaption className="border-gold/12 mt-4 border-t pt-4">
                <p className="font-serif text-lg text-white">{name}</p>
                <p className="text-muted-foreground mt-1 text-[11px] tracking-[0.14em] uppercase">
                  {meta}
                </p>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}
