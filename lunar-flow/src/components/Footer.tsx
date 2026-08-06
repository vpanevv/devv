import { ArrowUp, Mail, Moon, Phone } from "lucide-react";
import {
  CONTACT_EMAIL,
  CONTACT_PHONE,
  INSTAGRAM_HANDLE,
  INSTAGRAM_URL,
  NAV_ITEMS,
} from "../site";
import InstagramIcon from "./InstagramIcon";

const CONTACTS = [
  {
    icon: InstagramIcon,
    label: INSTAGRAM_HANDLE,
    href: INSTAGRAM_URL,
    external: true,
  },
  { icon: Mail, label: CONTACT_EMAIL, href: `mailto:${CONTACT_EMAIL}` },
  {
    icon: Phone,
    label: CONTACT_PHONE,
    href: `tel:${CONTACT_PHONE.replace(/\s/g, "")}`,
  },
];

export default function Footer() {
  return (
    <footer className="border-gold/10 relative border-t px-5 pt-16 pb-10">
      <div className="mx-auto max-w-6xl">
        {/* Back to top */}
        <div className="mb-14 flex justify-center">
          <a
            href="#top"
            className="border-gold/30 text-gold hover:border-gold/70 hover:bg-gold/10 group inline-flex items-center gap-2.5 rounded-full border bg-white/[0.03] px-6 py-3 text-sm font-semibold transition-all duration-300"
          >
            <ArrowUp
              aria-hidden
              className="size-4 transition-transform duration-300 group-hover:-translate-y-0.5"
            />
            Начало
          </a>
        </div>

        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr]">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-3">
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
            </div>
            <p className="text-muted-foreground mt-5 max-w-xs text-[14px] leading-relaxed">
              Астрология, таро и нумерология, авторски курсове и продукти — за
              хора, които търсят яснота и посока.
            </p>
          </div>

          {/* Navigation */}
          <nav aria-label="Навигация във футъра">
            <p className="text-gold/85 mb-4 text-[11px] tracking-[0.2em] uppercase">
              Навигация
            </p>
            {/* -my-1.5 keeps the visual rhythm while the padding lifts each
                link to a 40px touch target. */}
            <ul className="-my-1.5 space-y-0.5">
              {[...NAV_ITEMS, { label: "Запиши консултация", href: "#contact" }].map(
                (item) => (
                  <li key={item.label}>
                    <a
                      href={item.href}
                      className="text-muted-foreground hover:text-gold inline-flex min-h-10 items-center text-[14px] transition-colors"
                    >
                      {item.label}
                    </a>
                  </li>
                ),
              )}
            </ul>
          </nav>

          {/* Contacts */}
          <div>
            <p className="text-gold/85 mb-4 text-[11px] tracking-[0.2em] uppercase">
              Контакти
            </p>
            <ul className="space-y-3">
              {CONTACTS.map(({ icon: Icon, label, href, external }) => (
                <li key={label}>
                  <a
                    href={href}
                    {...(external
                      ? { target: "_blank", rel: "noreferrer noopener" }
                      : {})}
                    className="text-muted-foreground hover:text-gold group flex min-h-10 items-center gap-3 text-[14px] transition-colors"
                  >
                    <span className="border-gold/20 text-gold group-hover:border-gold/50 grid size-9 shrink-0 place-items-center rounded-full border transition-colors">
                      <Icon className="size-4" />
                    </span>
                    <span className="break-all">{label}</span>
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="border-gold/10 text-muted-foreground mt-12 flex flex-col items-center gap-2 border-t pt-7 text-center text-[12px] sm:flex-row sm:justify-between sm:text-left">
          <p>© {new Date().getFullYear()} Магдалена Бангеева</p>
          <p>Изработено с грижа · Лунна енергия ☾</p>
        </div>
      </div>
    </footer>
  );
}
