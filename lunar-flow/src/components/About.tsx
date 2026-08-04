import { useId, useState } from "react";
import { Sparkles } from "lucide-react";
import GoldButton from "./GoldButton";
import portrait from "../assets/magdalena-portrait.jpg";
import "./About.css";

/** The consultant's approach, rendered as a marked list rather than run-on lines. */
const APPROACH = [
  "Да насочвам клиентите си в най-добрата за тях посока",
  "Да превръщам минусите в характера в плюсове",
  "Да давам отговори и да внасям светлина, когато е най-тъмно",
  "Да погледна в дълбочина и да намеря източника на проблема, а не да лекувам „симптомите“",
  "Да мотивирам, да насърчавам използването на свободната воля, защото тя е тази, която строи живота на мечтите",
];

export default function About() {
  const [open, setOpen] = useState(false);
  const revealId = useId();

  return (
    <section id="about" className="relative px-5 py-20 sm:py-28">
      <div className="mx-auto max-w-6xl">
        <header className="mb-12 text-center">
          <p className="text-gold/85 text-[11px] tracking-[0.28em] uppercase sm:tracking-[0.36em]">
            <Sparkles aria-hidden className="mr-2 mb-1 inline size-3.5" />
            За мен
          </p>
          <h2 className="font-display text-gold-gradient mt-3 text-[clamp(2rem,5.5vw,3.5rem)] leading-tight tracking-[0.03em] uppercase">
            Магдалена Бангеева
          </h2>
        </header>

        <div className="glass-card p-6 sm:p-9 lg:p-12">
          {/* grid-cols-1 keeps the single-column track definite so the
              portrait's max-width can clamp it on narrow screens. On desktop the
              left column stacks portrait over contact note while the copy spans
              both rows; on mobile DOM order gives portrait → copy → note. */}
          <div className="grid grid-cols-1 items-start gap-9 lg:grid-cols-[auto_1fr] lg:grid-rows-[auto_1fr] lg:gap-x-14 lg:gap-y-8">
            {/* Portrait — grows in step with the expanding copy */}
            <div
              className={`side-col portrait-frame mx-auto lg:col-start-1 lg:row-start-1 lg:mx-0${
                open ? " is-expanded" : ""
              }`}
            >
              <img
                src={portrait}
                width={1000}
                height={1500}
                loading="lazy"
                decoding="async"
                alt="Магдалена Бангеева, седнала с отворена книга в ръце"
              />
            </div>

            {/* Copy */}
            <div className="text-[15px] leading-relaxed text-white/80 sm:text-base lg:col-start-2 lg:row-span-2 lg:row-start-1">
              <p>
                Аз съм{" "}
                <strong className="text-gold-soft font-semibold">
                  Магдалена Бангеева
                </strong>{" "}
                — дипломиран астролог, таро консултант и експерт в областта на
                езотериката, астропсихологията и минералогията.
              </p>

              <p className="mt-5">
                Създадох това{" "}
                <span className="text-gold font-semibold">МАГИ</span>чно
                пространство с мисията да помогна на колкото мога повече хора да
                се докоснат до магията на езотериката, да открият, да се върнат
                към себе си и да намерят отговорите, които търсят!
              </p>

              <p className="mt-5">
                Работата ми се базира на{" "}
                <span className="text-gold-soft font-semibold">
                  11+ години
                </span>{" "}
                трупани знания от обучения (3 годишен курс към Българска
                Астрологична Асоциация и др.), семинари, книги. И най-важното:
                от личните ми наблюдения и{" "}
                <span className="text-gold font-semibold">ПРОУЧВАНИЯ</span>.
                Това е и елементът, който смятам, че отличава добрия астролог от
                експерта.
              </p>

              {/* The sentence continues inline once expanded — the ellipsis is
                  only there to mark where the copy is cut off. */}
              <p className="mt-5">
                Още от ранна детска възраст
                {!open && <span aria-hidden>…</span>}
                <span className={`inline-more${open ? " is-open" : ""}`}>
                  {" "}
                  (благодарение на семейството ми) астрологията запали сърцето и
                  покори ума ми! За първи път се сблъсках с нещо толкова точно,
                  но и същевременно някак магично…
                </span>
              </p>

              {/* Hidden remainder */}
              <div
                id={revealId}
                className={`reveal${open ? " is-open" : ""}`}
                aria-hidden={!open}
              >
                <div>
                  <div className="pt-5">
                    <p>
                      В последствие надградих компетенциите си в езотериката и с
                      други направления: Таро, Нумерологията, Психология.
                    </p>

                    <p className="mt-5">
                      По образование съм медик: завършила съм „Клетъчна биология
                      и вирусология“ — реших обаче да приложа тези си знания по
                      един по-нестандартен начин, а именно в дял{" "}
                      <span className="text-gold-soft font-semibold">
                        „Медицинска астрология“
                      </span>
                      .
                    </p>

                    <p className="mt-6 mb-3 font-semibold text-white/90">
                      Моят подход като консултант е:
                    </p>
                    <ul className="space-y-2.5">
                      {APPROACH.map((item) => (
                        <li key={item} className="flex gap-3">
                          <span
                            aria-hidden
                            className="bg-gold/70 shadow-gold/60 mt-2 size-1.5 shrink-0 rotate-45 rounded-[1px] shadow-[0_0_8px]"
                          />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>

                    <p className="mt-5">
                      Правя всяка една консултация и продукт с най-голяма любов
                      и отдаденост.
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-7">
                <GoldButton
                  size="sm"
                  flipArrow={open}
                  onClick={() => setOpen((v) => !v)}
                  ariaExpanded={open}
                  ariaControls={revealId}
                  label={open ? "Скрий" : "Прочети още"}
                />
              </div>
            </div>

            {/* Contact note — fills the space under the portrait once expanded.
                Mounted only when open so it adds no grid gap while collapsed. */}
            {open && (
              <aside className="side-col side-note border-gold/20 mx-auto rounded-2xl border bg-white/[0.04] p-5 lg:col-start-1 lg:row-start-2 lg:mx-0 is-expanded">
                <p className="font-semibold text-white/90">
                  ❓ Искаш да работим заедно, но не си сигурен дали съм твоя
                  човек?
                </p>
                <p className="mt-2.5 text-[15px] leading-relaxed text-white/80">
                  Можеш да се свържеш с мен, за да обсъдим това, което те вълнува
                  и как (и дали) бих могла да ти бъда от полза. Не се колебай! 💌
                </p>
              </aside>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
