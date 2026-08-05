import {
  Activity,
  Baby,
  Briefcase,
  CalendarDays,
  Clock,
  Heart,
  House,
  Sparkles,
  Star,
  TrendingUp,
  Users,
} from "lucide-react";
import Packages from "./Packages";
import ServiceCard, { type Service } from "./ServiceCard";

const SERVICES: Service[] = [
  { icon: Star, title: "Натална карта", note: "общ преглед" },
  { icon: TrendingUp, title: "„Кариерно развитие и финанси“" },
  { icon: Heart, title: "„Любов и женска енергия“" },
  {
    icon: Sparkles,
    title: "„SOUL“",
    note: "консултация на душата",
    featured: true,
  },
  { icon: Activity, title: "„Здраве и рутина“", note: "хороскоп" },
  { icon: Briefcase, title: "Бизнес хороскоп" },
  { icon: House, title: "„Астрален дом“" },
  { icon: Baby, title: "Детски хороскоп" },
];

/** Sit below the yearly packages, in the same card style. */
const MORE_SERVICES: Service[] = [
  { icon: CalendarDays, title: "Месечен план" },
  { icon: Users, title: "Партньорски хороскоп" },
  {
    icon: Clock,
    title: "Ректификация",
    desc: "Намиране на часа на раждане по събития от живота и попълване на анкета.",
  },
];

export default function Services() {
  return (
    <section
      id="services"
      className="border-gold/10 relative border-t px-5 py-20 sm:py-28"
    >
      <div className="mx-auto max-w-6xl">
        <header className="mb-12 text-center">
          <p className="text-gold/85 text-[11px] tracking-[0.28em] uppercase sm:tracking-[0.36em]">
            <Sparkles aria-hidden className="mr-2 mb-1 inline size-3.5" />
            Услуги
          </p>
          <h2 className="font-display text-gold-gradient mt-3 text-[clamp(1.9rem,5vw,3.25rem)] leading-tight tracking-[0.03em] uppercase">
            Астрологични консултации
          </h2>
        </header>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {SERVICES.map((s) => (
            <ServiceCard key={s.title} {...s} />
          ))}
        </div>

        <Packages />

        {/* Three more consultations. The max-width is the exact span of three
            columns of the grid above — 3·card + 2·gap, where card is
            (100% − 3·gap)/4 — so these cards match the eight in width. */}
        <div className="mt-16 grid gap-5 sm:grid-cols-2 lg:mx-auto lg:max-w-[calc(75%-0.3125rem)] lg:grid-cols-3">
          {MORE_SERVICES.map((s) => (
            <ServiceCard key={s.title} {...s} />
          ))}
        </div>
      </div>
    </section>
  );
}
