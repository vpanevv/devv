import { useLocale } from "next-intl";

export function Logo({ onDark = false }: { onDark?: boolean }) {
  const locale = useLocale();
  return (
    <a href="#" className="flex items-center gap-2" aria-label="Eagle Trade">
      {/* Stylized eagle-wing mark built from the two brand colors */}
      <svg width="30" height="30" viewBox="0 0 32 32" aria-hidden="true">
        <path d="M2 22 Q10 8 16 8 Q22 8 30 22 Q22 17 16 17 Q10 17 2 22Z" fill="#00A19B" />
        <path
          d="M6 26 Q11 18 16 18 Q21 18 26 26 Q21 22.5 16 22.5 Q11 22.5 6 26Z"
          fill={onDark ? "#E4DDD3" : "#161616"}
          opacity="0.85"
        />
      </svg>
      <span
        className={`font-display text-lg font-bold tracking-tight ${
          onDark ? "text-white" : "text-ink"
        }`}
      >
        {locale === "bg" ? "Игъл Трейд" : "Eagle Trade"}
      </span>
    </a>
  );
}
