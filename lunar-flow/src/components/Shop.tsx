import { Check, Diamond, Gem, Shield, Sparkles, SprayCan } from "lucide-react";
import GoldButton from "./GoldButton";

/** Card chrome shared by all four products. */
function ProductCard({
  icon: Icon,
  title,
  children,
}: {
  icon: typeof Gem;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <article className="border-gold/15 flex flex-col rounded-3xl border bg-[oklch(20%_0.06_292/0.42)] p-6 shadow-[0_24px_60px_-40px_oklch(4%_0.02_285/0.9)] backdrop-blur-md transition-all duration-300 hover:-translate-y-1 hover:border-gold/35 hover:shadow-[0_0_50px_-22px_oklch(0.82_0.10_80/0.7)] sm:p-7">
      <span className="bg-gold/10 text-gold grid size-11 place-items-center rounded-xl shadow-[inset_0_0_0_1px_oklch(0.82_0.10_80/0.22)]">
        <Icon aria-hidden className="size-5" strokeWidth={1.6} />
      </span>

      <h3 className="font-serif mt-5 text-2xl text-white sm:text-[1.65rem]">
        {title}
      </h3>

      <div className="mt-5">{children}</div>

      <div className="mt-auto pt-7">
        <GoldButton size="sm" href="#contact" label="Поръчай" />
      </div>
    </article>
  );
}

const AMULET_KINDS = ["Пречистване", "Защита", "Изобилие", "Любов"];

const PERFUME_SIZES = [
  { size: "Малък", volume: "5 мл", price: "17 €" },
  { size: "Голям", volume: "10 мл", price: "30 €" },
];

const STONE_POINTS = ["Полускъпоценни и скъпоценни", "Енергийни свойства"];

export default function Shop() {
  return (
    <section
      id="shop"
      className="border-gold/10 relative border-t px-5 py-20 sm:py-28"
    >
      <div className="mx-auto max-w-5xl">
        <header className="mb-12 text-center">
          <p className="text-gold/85 text-[11px] tracking-[0.28em] uppercase sm:tracking-[0.36em]">
            <Sparkles aria-hidden className="mr-2 mb-1 inline size-3.5" />
            Магазин
          </p>
          <h2 className="font-display text-gold-gradient mt-3 text-[clamp(1.9rem,5vw,3.25rem)] leading-tight tracking-[0.03em] uppercase">
            Езотерични продукти
          </h2>
        </header>

        <div className="grid gap-6 sm:grid-cols-2">
          {/* Амулети — four short keywords read better as chips than a list. */}
          <ProductCard icon={Shield} title="Амулети">
            <ul className="flex flex-wrap gap-2">
              {AMULET_KINDS.map((kind) => (
                <li
                  key={kind}
                  className="border-gold/25 bg-gold/[0.07] text-gold-soft rounded-full border px-3.5 py-1.5 text-[13px] font-medium"
                >
                  {kind}
                </li>
              ))}
            </ul>
          </ProductCard>

          {/* Енергиен парфюм — two sizes with prices. */}
          <ProductCard icon={SprayCan} title="Енергиен парфюм">
            <ul className="divide-gold/10 border-gold/10 divide-y border-y">
              {PERFUME_SIZES.map(({ size, volume, price }) => (
                <li
                  key={size}
                  className="flex items-baseline justify-between gap-4 py-3"
                >
                  <span className="text-[15px] text-white/85">
                    {size}
                    <span className="text-muted-foreground ml-2 text-[13px]">
                      {volume}
                    </span>
                  </span>
                  <span className="text-gold font-serif text-xl font-semibold">
                    {price}
                  </span>
                </li>
              ))}
            </ul>
          </ProductCard>

          {/* Бижута */}
          <ProductCard icon={Gem} title="Бижута">
            <p className="text-[15px] leading-relaxed text-white/80">
              Ръчно направени с естествени камъни и енергийно заредени.
            </p>
          </ProductCard>

          {/* Камъни */}
          <ProductCard icon={Diamond} title="Камъни">
            <ul className="space-y-3">
              {STONE_POINTS.map((point) => (
                <li
                  key={point}
                  className="flex gap-3 text-[15px] leading-relaxed text-white/80"
                >
                  <Check
                    aria-hidden
                    className="text-gold mt-1 size-4 shrink-0"
                    strokeWidth={2.5}
                  />
                  <span>{point}</span>
                </li>
              ))}
            </ul>
          </ProductCard>
        </div>
      </div>
    </section>
  );
}
