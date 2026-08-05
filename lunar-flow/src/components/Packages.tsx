import { Check, Plus, Star } from "lucide-react";
import GoldButton from "./GoldButton";

const STANDARD_INCLUDES = [
  "Основна стратегия за годината, подход и качества за развитие, какво да избягваш",
  "Основни уроци и предизвикателства за годината",
  "Кои качества и навици ще ти пречат да успееш",
  "Активни сфери и към кои да насочиш енергията си",
  "Какво да очакваш във всяка една сфера през твоята лична година (личност, здраве, кариера, взаимоотношения, приятелски кръг и т.н.)",
  "Какъв подход да използваш за всяка",
  "Лична нумерологична година",
  "Съвети, насоки",
];

const VIP_EXTRAS = [
  {
    text: "Авторска програма за активиране на личната година (действия за първите 12 дни) — PDF формат",
  },
  {
    text: "14 лични месечни прогнози със съвети и насоки, които преди всеки твой личен месец изпращам под формата на ~4–5 мин. аудио",
    footnote:
      "14 са, защото се изчисляват лично (не са януари, февруари и т.н.). Всяка излиза на цена от по-малко от 15 €.",
  },
];

/** Shared chrome for both package cards. */
function PackageShell({
  featured,
  children,
}: {
  featured?: boolean;
  children: React.ReactNode;
}) {
  return (
    <article
      className={`relative flex flex-col rounded-3xl border p-6 backdrop-blur-md transition-shadow duration-300 sm:p-8 ${
        featured
          ? "border-gold/45 bg-[linear-gradient(160deg,oklch(82%_0.10_80/0.12)_0%,oklch(20%_0.06_292/0.5)_55%)] shadow-[0_0_60px_-22px_oklch(0.82_0.10_80/0.7)]"
          : "border-gold/15 bg-[oklch(20%_0.06_292/0.42)] shadow-[0_24px_60px_-40px_oklch(4%_0.02_285/0.9)]"
      }`}
    >
      {featured && (
        <span className="border-gold/55 text-gold absolute -top-3 left-1/2 inline-flex -translate-x-1/2 items-center gap-1.5 rounded-full border bg-[oklch(12%_0.04_288)] px-3 py-1 text-[10px] font-bold tracking-[0.14em] whitespace-nowrap uppercase">
          <Star aria-hidden className="size-3 fill-current" />
          най-поръчван
        </span>
      )}
      {children}
    </article>
  );
}

/** Pinned to the bottom of the card so both packages line their prices up. */
function PriceBlock({ amount, cta }: { amount: string; cta: string }) {
  return (
    <div className="mt-auto">
      <div className="border-gold/15 mt-7 border-t pt-5">
        <p className="text-muted-foreground text-[13px] leading-relaxed">
          <span aria-hidden className="mr-1.5">
            💌
          </span>
          Аудио запис (~75 мин.) или онлайн среща със запис
        </p>
        <p className="text-gold font-serif mt-2 text-4xl font-semibold">
          {amount}
        </p>
      </div>
      <div className="mt-6">
        <GoldButton size="sm" href="#contact" label={cta} />
      </div>
    </div>
  );
}

export default function Packages() {
  return (
    <div className="mt-20 sm:mt-24">
      <header className="mb-11 text-center">
        <p className="text-gold/85 text-[11px] tracking-[0.28em] uppercase sm:tracking-[0.34em]">
          Пакети
        </p>
        <h3 className="font-display text-gold-gradient mt-3 text-[clamp(1.6rem,4vw,2.6rem)] leading-tight tracking-[0.03em] uppercase">
          Годишен хороскоп
        </h3>
      </header>

      {/* Stretch, not items-start — equal-height cards keep the prices aligned. */}
      <div className="grid gap-6 lg:grid-cols-2 lg:gap-7">
        {/* ---------- Standard ---------- */}
        <PackageShell>
          <div className="flex items-baseline gap-3">
            <span aria-hidden className="text-2xl">
              🌞
            </span>
            <h4 className="font-serif text-2xl text-white sm:text-[1.75rem]">
              СТАНДАРТ
            </h4>
          </div>
          <p className="text-muted-foreground mt-2 text-[13px] tracking-[0.12em] uppercase">
            пакетът включва
          </p>

          <ul className="mt-6 space-y-3">
            {STANDARD_INCLUDES.map((item) => (
              <li
                key={item}
                className="flex gap-3 text-[15px] leading-relaxed text-white/80"
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

          <div className="border-gold/20 mt-6 rounded-2xl border bg-white/[0.04] p-4">
            <p className="text-[15px] leading-relaxed text-white/85">
              <span aria-hidden className="mr-1.5">
                ⭐️
              </span>
              PDF кратък файл ~2 стр. с най-важната информация, синтезирано
            </p>
          </div>

          <PriceBlock amount="198 €" cta="Заяви СТАНДАРТ" />
        </PackageShell>

        {/* ---------- Full VIP ---------- */}
        <PackageShell featured>
          <div className="flex items-baseline gap-3">
            <span aria-hidden className="text-2xl">
              💎
            </span>
            <h4 className="font-serif text-2xl text-white sm:text-[1.75rem]">
              ПЪЛЕН ВИП ПАКЕТ
            </h4>
          </div>

          <div className="border-gold/30 bg-gold/10 mt-6 rounded-2xl border p-4">
            <p className="text-gold-soft text-[15px] font-semibold">
              <span aria-hidden className="mr-1.5">
                ⭐️
              </span>
              Включва всичко от СТАНДАРТ
            </p>
          </div>

          <ul className="mt-6 space-y-5">
            {VIP_EXTRAS.map((extra) => (
              <li key={extra.text} className="flex gap-3">
                <Plus
                  aria-hidden
                  className="text-gold mt-0.5 size-4 shrink-0"
                  strokeWidth={2.5}
                />
                <div>
                  <p className="text-[15px] leading-relaxed text-white/85">
                    {extra.text}
                  </p>
                  {extra.footnote && (
                    <p className="text-muted-foreground mt-1.5 text-[13px] leading-relaxed">
                      {extra.footnote}
                    </p>
                  )}
                </div>
              </li>
            ))}
          </ul>

          <PriceBlock amount="350 €" cta="Заяви ВИП пакет" />
        </PackageShell>
      </div>

      <p className="text-muted-foreground mt-6 text-center text-[13px] leading-relaxed">
        * Можете да заплатите на вноски, ако желаете. При необходимост издавам и
        фактура.
      </p>
    </div>
  );
}
