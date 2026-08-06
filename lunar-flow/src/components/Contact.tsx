import { useState } from "react";
import { ChevronDown, Package, Sparkles } from "lucide-react";
import GoldButton from "./GoldButton";
/**
 * The form has no backend — on submit it composes a prefilled email in the
 * visitor's mail client. Nothing is stored or sent by the site itself, so no
 * enquiry can be silently lost. Swap this for a POST endpoint (Formspree,
 * Netlify Forms, Supabase…) when one exists.
 */
import { CONTACT_EMAIL } from "../site";

/** Every bookable thing on the page, grouped the way the sections are. */
const SERVICE_GROUPS = [
  {
    label: "Астрологични консултации",
    options: [
      "Натална карта — общ преглед",
      "„Кариерно развитие и финанси“",
      "„Любов и женска енергия“",
      "„SOUL“ — консултация на душата",
      "„Здраве и рутина“ хороскоп",
      "Бизнес хороскоп",
      "„Астрален дом“",
      "Детски хороскоп",
      "Месечен план",
      "Партньорски хороскоп",
      "Ректификация",
    ],
  },
  {
    label: "Годишен хороскоп",
    options: [
      "Годишен хороскоп — СТАНДАРТ (198 €)",
      "Годишен хороскоп — ПЪЛЕН ВИП ПАКЕТ (350 €)",
    ],
  },
  {
    label: "Таро и нумерология",
    options: [
      "Бърз отговор — 3 въпроса",
      "Таро — 30 мин. онлайн видео разговор",
      "Таро — 1 час онлайн видео разговор",
      "Пълен нумерологичен анализ",
    ],
  },
  {
    label: "Авторски продукти",
    options: ["Дни с финансова активност"],
  },
  {
    label: "Езотерични продукти",
    options: [
      "Амулети",
      "Енергиен парфюм",
      "Бижута",
      "Камъни",
    ],
  },
];

/** Selecting one of these reveals the delivery options. */
const PHYSICAL_PRODUCTS = new Set([
  "Амулети",
  "Енергиен парфюм",
  "Бижута",
  "Камъни",
]);

const REFERRAL_SOURCES = [
  "Приятел",
  "Facebook",
  "Instagram",
  "TikTok",
  "Друго",
];

const DELIVERY_OPTIONS = [
  {
    value: "Speedy",
    title: "Speedy",
    note: "Безплатна доставка при поръчка над 89 €",
  },
  {
    value: "Box Now",
    title: "Box Now автомат",
    note: "Безплатна доставка",
  },
];

const fieldClass =
  "w-full rounded-xl border border-gold/20 bg-white/[0.04] px-4 py-3 text-[15px] text-white outline-none transition placeholder:text-white/30 focus:border-gold/60 focus:bg-white/[0.06]";

const labelClass =
  "mb-2 block text-[11px] tracking-[0.14em] text-muted-foreground uppercase";

/** Native select plus an overlaid chevron — a background-image data URI does
    not survive Tailwind's arbitrary-value parser. */
function SelectShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative">
      {children}
      <ChevronDown
        aria-hidden
        className="text-gold pointer-events-none absolute top-1/2 right-4 size-[18px] -translate-y-1/2"
        strokeWidth={2}
      />
    </div>
  );
}

function Field({
  label,
  htmlFor,
  hint,
  children,
  className = "",
}: {
  label: string;
  htmlFor: string;
  hint?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={className}>
      <label className={labelClass} htmlFor={htmlFor}>
        {label}
      </label>
      {children}
      {hint && (
        <p className="text-muted-foreground/80 mt-1.5 text-[12px]">{hint}</p>
      )}
    </div>
  );
}

export default function Contact() {
  const [service, setService] = useState("");
  const isPhysical = PHYSICAL_PRODUCTS.has(service);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const get = (key: string) => String(data.get(key) ?? "").trim();

    const lines = [
      `Име: ${[get("firstName"), get("middleName"), get("lastName")].filter(Boolean).join(" ")}`,
      `Дата на раждане: ${get("birthDate") || "—"}`,
      `Час на раждане: ${get("birthTime") || "не е известен"}`,
      `Място на раждане: ${get("birthPlace") || "—"}`,
      "",
      `Услуга: ${get("service")}`,
      isPhysical ? `Доставка: ${get("delivery") || "—"}` : "",
      "",
      "Казус / защо я искам:",
      get("message"),
      "",
      `Откъде чух за Магдалена: ${get("referral") || "—"}`,
      `Имейл: ${get("email")}`,
      `Телефон: ${get("phone") || "—"}`,
    ].filter((line) => line !== "");

    window.location.href = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(
      `Запитване: ${get("service")}`,
    )}&body=${encodeURIComponent(lines.join("\n"))}`;
  };

  return (
    <section
      id="contact"
      className="border-gold/10 relative border-t px-5 py-20 sm:py-28"
    >
      <div className="mx-auto max-w-3xl">
        <header className="mb-12 text-center">
          <p className="text-gold/85 text-[11px] tracking-[0.28em] uppercase sm:tracking-[0.36em]">
            <Sparkles aria-hidden className="mr-2 mb-1 inline size-3.5" />
            Свържи се
          </p>
          <h2 className="font-display text-gold-gradient mt-3 text-[clamp(1.9rem,5vw,3.25rem)] leading-tight tracking-[0.03em] uppercase">
            Запиши си консултация
          </h2>
          <p className="text-muted-foreground mx-auto mt-5 max-w-xl text-[15px] leading-relaxed">
            Попълни формата и ще се свържа с теб. Колкото повече ми споделиш,
            толкова по-точно ще мога да те насоча.
          </p>
        </header>

        <form
          onSubmit={handleSubmit}
          className="border-gold/15 rounded-3xl border bg-[oklch(20%_0.06_292/0.42)] p-6 shadow-[0_30px_70px_-40px_oklch(4%_0.02_285/0.9)] backdrop-blur-md sm:p-8"
        >
          {/* Name */}
          <fieldset>
            <legend className="font-serif mb-4 text-xl text-white">
              Твоите имена
            </legend>
            <div className="grid gap-4 sm:grid-cols-3">
              <Field label="Име *" htmlFor="firstName">
                <input
                  id="firstName"
                  name="firstName"
                  required
                  autoComplete="given-name"
                  className={fieldClass}
                />
              </Field>
              <Field label="Презиме" htmlFor="middleName">
                <input
                  id="middleName"
                  name="middleName"
                  autoComplete="additional-name"
                  className={fieldClass}
                />
              </Field>
              <Field label="Фамилия *" htmlFor="lastName">
                <input
                  id="lastName"
                  name="lastName"
                  required
                  autoComplete="family-name"
                  className={fieldClass}
                />
              </Field>
            </div>
          </fieldset>

          {/* Birth data */}
          <fieldset className="border-gold/12 mt-8 border-t pt-8">
            <legend className="font-serif mb-4 text-xl text-white">
              Данни за раждане
            </legend>
            <div className="grid gap-4 sm:grid-cols-3">
              <Field label="Дата *" htmlFor="birthDate">
                <input
                  id="birthDate"
                  name="birthDate"
                  type="date"
                  required
                  className={`${fieldClass} [color-scheme:dark]`}
                />
              </Field>
              <Field
                label="Час"
                htmlFor="birthTime"
                hint="Ако не го знаеш, остави празно."
              >
                <input
                  id="birthTime"
                  name="birthTime"
                  type="time"
                  className={`${fieldClass} [color-scheme:dark]`}
                />
              </Field>
              <Field label="Място *" htmlFor="birthPlace">
                <input
                  id="birthPlace"
                  name="birthPlace"
                  required
                  placeholder="град, държава"
                  className={fieldClass}
                />
              </Field>
            </div>
          </fieldset>

          {/* Service */}
          <fieldset className="border-gold/12 mt-8 border-t pt-8">
            <legend className="font-serif mb-4 text-xl text-white">
              Какво те интересува
            </legend>

            <Field label="Услуга *" htmlFor="service">
              <SelectShell>
                <select
                  id="service"
                  name="service"
                  required
                  value={service}
                  onChange={(e) => setService(e.target.value)}
                  className={`${fieldClass} appearance-none pr-12`}
                >
                  <option value="">Избери услуга…</option>
                  {SERVICE_GROUPS.map((group) => (
                    <optgroup key={group.label} label={group.label}>
                      {group.options.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </optgroup>
                  ))}
                </select>
              </SelectShell>
            </Field>

            <Field
              label="Защо я искаш / какъв казус имаш *"
              htmlFor="message"
              className="mt-5"
            >
              <textarea
                id="message"
                name="message"
                required
                rows={5}
                placeholder="Разкажи ми накратко какво те вълнува…"
                className={`${fieldClass} resize-y`}
              />
            </Field>
          </fieldset>

          {/* Delivery — only for physical products */}
          {isPhysical && (
            <fieldset className="border-gold/12 mt-8 border-t pt-8">
              <legend className="font-serif mb-1 flex items-center gap-2.5 text-xl text-white">
                <Package aria-hidden className="text-gold size-5" />
                Доставка
              </legend>
              <p className="text-muted-foreground mb-4 text-[13px]">
                Избрал/а си физически продукт — избери как да го получиш.
              </p>
              <div className="grid gap-3 sm:grid-cols-2">
                {DELIVERY_OPTIONS.map(({ value, title, note }) => (
                  <label
                    key={value}
                    className="border-gold/20 hover:border-gold/45 has-checked:border-gold/60 has-checked:bg-gold/[0.08] flex cursor-pointer items-start gap-3 rounded-xl border bg-white/[0.04] p-4 transition-colors"
                  >
                    <input
                      type="radio"
                      name="delivery"
                      value={value}
                      required
                      className="accent-gold mt-1 size-4 shrink-0"
                    />
                    <span>
                      <span className="block text-[15px] font-semibold text-white">
                        {title}
                      </span>
                      <span className="text-muted-foreground mt-0.5 block text-[13px]">
                        {note}
                      </span>
                    </span>
                  </label>
                ))}
              </div>
            </fieldset>
          )}

          {/* Contact details */}
          <fieldset className="border-gold/12 mt-8 border-t pt-8">
            <legend className="font-serif mb-4 text-xl text-white">
              За връзка
            </legend>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Имейл *" htmlFor="email">
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  autoComplete="email"
                  placeholder="name@example.com"
                  className={fieldClass}
                />
              </Field>
              <Field label="Телефонен номер" htmlFor="phone">
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  autoComplete="tel"
                  placeholder="+359…"
                  className={fieldClass}
                />
              </Field>
            </div>

            <Field
              label="Откъде чу за мен"
              htmlFor="referral"
              className="mt-5"
            >
              <SelectShell>
                <select
                  id="referral"
                  name="referral"
                  defaultValue=""
                  className={`${fieldClass} appearance-none pr-12`}
                >
                  <option value="">Избери…</option>
                  {REFERRAL_SOURCES.map((source) => (
                    <option key={source} value={source}>
                      {source}
                    </option>
                  ))}
                </select>
              </SelectShell>
            </Field>
          </fieldset>

          <div className="mt-9 flex flex-col items-center gap-4 sm:flex-row sm:justify-between">
            <p className="text-muted-foreground text-[12px]">
              * Задължителни полета
            </p>
            <GoldButton type="submit" label="Изпрати запитване" />
          </div>
        </form>
      </div>
    </section>
  );
}
