import {
  CalendarRange,
  Gem,
  GraduationCap,
  Layers,
  Orbit,
  Sparkles,
} from "lucide-react";
import GoldButton from "./GoldButton";
import Starfield from "./Starfield";
import ZodiacOrbit from "./ZodiacOrbit";

const OFFERS = [
  { icon: Orbit, label: "Астрология", accent: "oklch(82% 0.10 80)" },
  { icon: Layers, label: "Таро и Нумерология", accent: "oklch(72% 0.14 300)" },
  { icon: GraduationCap, label: "Авторски курсове", accent: "oklch(80% 0.11 200)" },
  {
    icon: CalendarRange,
    label: "Авторски „Дни с финансова активност“",
    accent: "oklch(80% 0.11 145)",
  },
  {
    icon: Gem,
    label: "Минерали, скъпоценни камъни, бижута, амулети",
    accent: "oklch(78% 0.11 15)",
  },
];

const STATS = [
  { emoji: "⭐", value: "11+", label: "години практика", glow: "oklch(85% 0.15 85 / 0.85)" },
  { emoji: "❤️", value: "500+", label: "доволни клиенти", glow: "oklch(70% 0.19 20 / 0.85)" },
  { emoji: "🌙", value: "Авторски", label: "подход", glow: "oklch(88% 0.09 90 / 0.85)" },
];

export default function Hero() {
  return (
    <section className="relative isolate flex min-h-svh items-center overflow-hidden pt-20 pb-14 sm:pt-24 sm:pb-20">
      <Starfield />

      {/* Rotating zodiac sphere, centred behind the name. Scaled wider than the
          copy block so the glyphs orbit around the text rather than under it. */}
      <div className="pointer-events-none absolute inset-0 z-0 flex items-center justify-center">
        <div className="float-slow scale-[0.72] opacity-80 sm:scale-105 lg:scale-[1.3] xl:scale-[1.5]">
          <ZodiacOrbit />
        </div>
      </div>

      {/* Vignettes — the tight one clears a dark bed for the name, the wide one
          lets the outer glyphs stay visible. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-[1] bg-[radial-gradient(ellipse_38%_26%_at_50%_38%,oklch(0.07_0.04_285/0.94)_0%,oklch(0.07_0.04_285/0.72)_55%,transparent_100%)]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-[1] bg-[radial-gradient(ellipse_62%_48%_at_50%_46%,oklch(0.07_0.04_285/0.62)_0%,oklch(0.08_0.04_285/0.34)_60%,transparent_85%)]"
      />
      <div
        aria-hidden
        className="from-cosmos/70 to-cosmos pointer-events-none absolute inset-0 z-[1] bg-gradient-to-b via-transparent"
      />

      <div className="relative z-10 mx-auto w-full max-w-6xl px-5 text-center">
        {/* Eyebrow */}
        <p
          className="rise text-gold/85 text-[11px] tracking-[0.18em] uppercase sm:text-xs sm:tracking-[0.42em]"
          style={{ ["--rise-delay" as string]: "0.05s" }}
        >
          <Sparkles aria-hidden className="mr-2 mb-1 inline size-3.5" />
          Влез в света на езотериката с
        </p>

        {/* The name */}
        <h1
          className="rise font-display mt-4 leading-[0.94] font-normal tracking-[0.04em] uppercase"
          style={{ ["--rise-delay" as string]: "0.15s" }}
        >
          <span className="text-gold-gradient block text-[clamp(2.7rem,10.8vw,7.5rem)] drop-shadow-[0_6px_40px_oklch(0.82_0.10_80/0.28)]">
            Магдалена
          </span>
          <span className="text-gold-gradient mt-1 block text-[clamp(2.7rem,10.8vw,7.5rem)] drop-shadow-[0_6px_40px_oklch(0.82_0.10_80/0.28)]">
            Бангеева
          </span>
        </h1>

        {/* Offer pills */}
        <ul className="mt-8 flex flex-wrap justify-center gap-2.5 sm:mt-9 sm:gap-3">
          {OFFERS.map(({ icon: Icon, label, accent }, i) => (
            <li
              key={label}
              className="rise offer group flex w-full items-center gap-2.5 rounded-full py-1.5 pr-4 pl-1.5 sm:w-auto"
              style={{
                ["--accent" as string]: accent,
                ["--rise-delay" as string]: `${0.32 + i * 0.09}s`,
              }}
            >
              <span className="offer-icon grid size-7 shrink-0 place-items-center rounded-full">
                <Icon aria-hidden className="size-[15px]" strokeWidth={1.6} />
              </span>
              <span className="text-left text-[12px] leading-tight font-medium text-white/90 sm:text-[13px]">
                {label}
                <span className="offer-rule mt-1 block h-px w-0 group-hover:w-full" />
              </span>
            </li>
          ))}
        </ul>

        {/* CTAs — both gold */}
        <div
          className="rise mt-6 flex flex-col items-center justify-center gap-5 sm:mt-8 sm:flex-row sm:gap-10"
          style={{ ["--rise-delay" as string]: "0.82s" }}
        >
          <GoldButton href="#contact" label="Какво предлагам" />
          <GoldButton href="#contact" label="Запиши консултация" />
        </div>

        {/* Stats */}
        <dl
          className="rise border-gold/12 mx-auto mt-5 grid max-w-2xl grid-cols-3 border-t pt-5"
          style={{ ["--rise-delay" as string]: "0.95s" }}
        >
          {STATS.map((s, i) => (
            <div
              key={s.label}
              className={`px-2 sm:px-3 ${i > 0 ? "border-gold/12 border-l" : ""}`}
            >
              <span
                aria-hidden
                className="stat-emoji mb-1.5 block text-base sm:text-lg"
                style={{
                  ["--glow" as string]: s.glow,
                  ["--glow-delay" as string]: `${i * 0.6}s`,
                }}
              >
                {s.emoji}
              </span>
              <dt className="text-gold font-serif text-xl leading-none font-semibold sm:text-3xl">
                {s.value}
              </dt>
              <dd className="text-muted-foreground mt-2 text-[9px] tracking-[0.12em] uppercase sm:text-xs sm:tracking-[0.16em]">
                {s.label}
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
