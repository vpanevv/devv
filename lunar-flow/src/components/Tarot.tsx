import { Hourglass, Sigma, Sparkles, Timer, Zap } from "lucide-react";
import ServiceCard, { type Service } from "./ServiceCard";
import tarotPortrait from "../assets/magdalena-tarot.jpg";
// .portrait-frame (gradient ring + bloom) is shared with the About section.
import "./About.css";

const TAROT_SERVICES: Service[] = [
  { icon: Timer, title: "30 мин.", note: "онлайн видео разговор", compact: true },
  {
    icon: Hourglass,
    title: "1 час",
    note: "онлайн видео разговор",
    compact: true,
  },
  {
    icon: Sigma,
    title: "Пълен нумерологичен анализ",
    compact: true,
  },
];

export default function Tarot() {
  return (
    <section
      id="tarot"
      className="border-gold/10 relative border-t px-5 py-20 sm:py-28"
    >
      <div className="mx-auto max-w-6xl">
        <header className="mb-12 text-center">
          <p className="text-gold/85 text-[11px] tracking-[0.28em] uppercase sm:tracking-[0.36em]">
            <Sparkles aria-hidden className="mr-2 mb-1 inline size-3.5" />
            Таро и нумерология
          </p>
          <h2 className="font-display text-gold-gradient mt-3 text-[clamp(1.9rem,5vw,3.25rem)] leading-tight tracking-[0.03em] uppercase">
            Таро сеанси и Нумерология
          </h2>
        </header>

        {/* Copy left, portrait right — mirrors the About section's layout. */}
        <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-[1fr_auto] lg:gap-14">
          <div>
            {/* Lead-in above the row of cards. */}
            <div className="border-gold/25 bg-gold/[0.07] mb-7 inline-flex items-center gap-2.5 rounded-full border px-4 py-2">
              <Zap aria-hidden className="text-gold size-4" strokeWidth={1.8} />
              <span className="text-gold-soft text-sm font-semibold">
                Бърз отговор — 3 въпроса
              </span>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              {TAROT_SERVICES.map((s) => (
                <ServiceCard key={s.title} {...s} />
              ))}
            </div>
          </div>

          <div className="portrait-frame mx-auto w-full max-w-[320px] lg:mx-0 lg:w-[340px] lg:max-w-none">
            <img
              src={tarotPortrait}
              width={1000}
              height={1500}
              loading="lazy"
              decoding="async"
              alt="Магдалена Бангеева с карта таро в ръка"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
