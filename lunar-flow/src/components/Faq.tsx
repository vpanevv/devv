import { useId, useState } from "react";
import { ChevronDown, Sparkles } from "lucide-react";
import "./Faq.css";

type Item = { q: string; a: string };

const ITEMS: Item[] = [
  {
    q: "Какво се случва, ако нямам точен час на раждане?",
    a: "Не е пречка. За такива случаи правя ректификация — намираме часа на раждане по ключови събития от живота ти и попълване на анкета. Напиши ми какво знаеш за раждането си и ще ти кажа кой е най-добрият подход за твоята карта.",
  },
  {
    q: "Как се провеждат консултациите?",
    a: "Всичко е онлайн. Получаваш или аудио запис (~75 мин.), който остава при теб завинаги, или онлайн видео среща, която също записвам и ти изпращам. Таро сеансите са като видео разговор — 30 минути или 1 час. След запитването уточняваме услугата и удобно за теб време.",
  },
  {
    // TODO: confirm with client — gift/voucher policy is not stated anywhere yet.
    q: "Има ли опция за подарък/ваучер?",
    a: "Да — всяка консултация и авторски продукт може да бъде подарък. Свържи се с мен и ще уточним детайлите и как да го получи човекът, за когото е предназначен.",
  },
  {
    // TODO: confirm with client — real turnaround times per service.
    q: "Колко време отнема изготвянето на услугата?",
    a: "Зависи от услугата. След запитването ти казвам конкретен срок и се уговаряме за дата, така че да знаеш точно кога да очакваш материала си.",
  },
  {
    q: "Как да разбера коя услуга е за мен, имам колебания?",
    a: "Просто ми пиши — това е най-бързият начин. Разкажи ми накратко какво те вълнува и ще ти кажа откровено коя услуга би ти била най-полезна и дали изобщо бих могла да ти бъда от полза. Не се колебай.",
  },
];

export default function Faq() {
  const [open, setOpen] = useState<number | null>(0);
  const baseId = useId();

  return (
    <section
      id="faq"
      className="border-gold/10 relative border-t px-5 py-20 sm:py-28"
    >
      <div className="mx-auto max-w-3xl">
        <header className="mb-12 text-center">
          <p className="text-gold/85 text-[11px] tracking-[0.28em] uppercase sm:tracking-[0.36em]">
            <Sparkles aria-hidden className="mr-2 mb-1 inline size-3.5" />
            Въпроси
          </p>
          <h2 className="font-display text-gold-gradient mt-3 text-[clamp(1.9rem,5vw,3.25rem)] leading-tight tracking-[0.03em] uppercase">
            Често задавани въпроси
          </h2>
        </header>

        <div className="space-y-3">
          {ITEMS.map(({ q, a }, i) => {
            const isOpen = open === i;
            const panelId = `${baseId}-panel-${i}`;
            const buttonId = `${baseId}-button-${i}`;

            return (
              <div
                key={q}
                className={`faq-item border-gold/15 overflow-hidden rounded-2xl border bg-[oklch(20%_0.06_292/0.4)] backdrop-blur-md transition-colors duration-300 ${
                  isOpen ? "is-open border-gold/35" : "hover:border-gold/25"
                }`}
              >
                <h3>
                  <button
                    type="button"
                    id={buttonId}
                    aria-expanded={isOpen}
                    aria-controls={panelId}
                    onClick={() => setOpen(isOpen ? null : i)}
                    className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left sm:px-6 sm:py-5"
                  >
                    <span className="font-serif text-lg text-white sm:text-xl">
                      {q}
                    </span>
                    <ChevronDown
                      aria-hidden
                      className="faq-icon text-gold size-5 shrink-0"
                      strokeWidth={2}
                    />
                  </button>
                </h3>

                <div
                  id={panelId}
                  role="region"
                  aria-labelledby={buttonId}
                  className={`faq-answer${isOpen ? " is-open" : ""}`}
                >
                  <div>
                    <p className="px-5 pb-5 text-[15px] leading-relaxed text-white/80 sm:px-6 sm:pb-6">
                      {a}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
