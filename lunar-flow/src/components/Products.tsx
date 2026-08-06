import { CalendarDays, Check, Sparkles } from "lucide-react";
import GoldButton from "./GoldButton";

const BENEFITS = [
  "Точни дати за месеца",
  "Указания как да използваш всеки ден",
  "Изпраща се персонално",
];

/** Illustrative sample month — the real dates are calculated per client. */
const LUNAR_DAYS = Array.from({ length: 28 }, (_, i) => i + 1);
const ACTIVE_DAYS = new Set([4, 8, 12, 15, 19, 23, 26]);

function LunarCalendar() {
  return (
    <div className="border-gold/15 rounded-3xl border bg-[oklch(20%_0.06_292/0.45)] p-6 shadow-[0_30px_70px_-40px_oklch(4%_0.02_285/0.9)] backdrop-blur-md sm:p-7">
      <div className="mb-6 flex items-center justify-between">
        <p className="font-serif text-xl text-white/90">Лунен месец</p>
        <CalendarDays aria-hidden className="text-gold size-5" strokeWidth={1.6} />
      </div>

      <div aria-hidden className="grid grid-cols-7 gap-2">
        {LUNAR_DAYS.map((day) => {
          const active = ACTIVE_DAYS.has(day);
          return (
            <span
              key={day}
              className={`grid aspect-square place-items-center rounded-xl text-[13px] transition-colors ${
                active
                  ? "text-cosmos bg-[linear-gradient(140deg,oklch(92%_0.08_88),oklch(80%_0.12_78))] font-bold shadow-[0_0_18px_-4px_oklch(0.82_0.10_80/0.8)]"
                  : "bg-white/[0.04] text-white/40"
              }`}
            >
              {day}
            </span>
          );
        })}
      </div>

      <p className="text-muted-foreground mt-6 flex items-center gap-2.5 text-[13px]">
        <span
          aria-hidden
          className="bg-gold shadow-gold/70 size-2 shrink-0 rounded-full shadow-[0_0_8px]"
        />
        Дни с финансова активност
      </p>
    </div>
  );
}

export default function Products() {
  return (
    <section
      id="products"
      className="border-gold/10 relative border-t px-5 py-20 sm:py-28"
    >
      <div className="mx-auto max-w-6xl">
        <header className="mb-14 text-center">
          <p className="text-gold/85 text-[11px] tracking-[0.28em] uppercase sm:tracking-[0.36em]">
            <Sparkles aria-hidden className="mr-2 mb-1 inline size-3.5" />
            Авторски
          </p>
          <h2 className="font-display text-gold-gradient mt-3 text-[clamp(1.9rem,5vw,3.25rem)] leading-tight tracking-[0.03em] uppercase">
            Авторски продукти и курсове
          </h2>
        </header>

        <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
          {/* Copy */}
          <div>
            <p className="text-gold/85 text-[11px] tracking-[0.28em] uppercase">
              Авторски продукт
            </p>
            <h3 className="font-serif mt-4 text-[clamp(1.9rem,4.5vw,3rem)] leading-tight text-white">
              Дни с{" "}
              <span className="text-gold-gradient">Финансова активност</span>
            </h3>

            <p className="mt-5 text-[15px] leading-relaxed text-white/80 sm:text-base">
              Авторски изчислени дни от месеца, в които енергията благоприятства
              финансови решения, преговори и стартиране на нови проекти.
              Получаваш персонален календар с точни дати и кратки указания.
            </p>

            <ul className="mt-7 space-y-3">
              {BENEFITS.map((item) => (
                <li
                  key={item}
                  className="flex gap-3 text-[15px] leading-relaxed text-white/85"
                >
                  <Check
                    aria-hidden
                    className="text-gold mt-1 size-4 shrink-0"
                    strokeWidth={2.5}
                  />
                  <span>{item}</span>
                </li>
              ))}
            </ul>

            <div className="mt-9">
              <GoldButton href="#contact" label="Получи моя месец" />
            </div>
          </div>

          {/* Calendar */}
          <LunarCalendar />
        </div>
      </div>
    </section>
  );
}
