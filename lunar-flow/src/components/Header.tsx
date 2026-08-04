import { ArrowRight, Moon } from "lucide-react";

/** lucide dropped brand marks in v1, so the Instagram glyph lives here. */
function InstagramIcon({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="2" y="2" width="20" height="20" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <path d="M17.5 6.5h.01" />
    </svg>
  );
}

export default function Header() {
  return (
    <header className="border-gold/10 bg-cosmos/60 fixed inset-x-0 top-0 z-50 border-b backdrop-blur-xl">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-3.5">
        <a href="#" className="flex items-center gap-3">
          <span className="border-gold/30 text-gold grid size-10 place-items-center rounded-full border bg-white/5">
            <Moon aria-hidden className="size-4" />
          </span>
          <span className="leading-tight">
            <span className="font-serif text-gold-soft block text-lg">Magdalena</span>
            <span className="text-muted-foreground block text-[10px] tracking-[0.3em] uppercase">
              Bangeeva
            </span>
          </span>
        </a>

        <div className="flex items-center gap-2.5">
          <a
            href="https://instagram.com/magdalena.bangeeva"
            target="_blank"
            rel="noreferrer noopener"
            aria-label="Instagram профил на Магдалена Бангеева"
            className="border-gold/25 text-gold hover:border-gold/60 hover:bg-gold/10 grid size-10 place-items-center rounded-full border transition-colors"
          >
            <InstagramIcon className="size-4" />
          </a>
          <a
            href="#contact"
            className="text-cosmos group inline-flex items-center gap-2 rounded-full bg-[linear-gradient(135deg,oklch(88%_0.09_85)_0%,oklch(78%_0.12_75)_100%)] px-5 py-2.5 text-sm font-bold transition-all duration-300 hover:brightness-110"
          >
            Запиши
            <ArrowRight
              aria-hidden
              className="size-3.5 transition-transform duration-300 group-hover:translate-x-0.5"
            />
          </a>
        </div>
      </div>
    </header>
  );
}
