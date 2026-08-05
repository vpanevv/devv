import { ArrowRight, Star, type LucideIcon } from "lucide-react";
import "./ServiceCard.css";

export type Service = {
  icon: LucideIcon;
  title: string;
  /** Small all-caps qualifier printed under the title. */
  note?: string;
  /** Longer sentence-case blurb, for names that need explaining. */
  desc?: string;
  featured?: boolean;
  /** Shorter card — used where three sit beside the tarot portrait. */
  compact?: boolean;
};

/** 5x5 hover grid — each cell tilts the card toward the cursor. */
const TRACKERS = Array.from({ length: 25 }, (_, i) => i + 1);

export default function ServiceCard({
  icon: Icon,
  title,
  note,
  desc,
  featured,
  compact,
}: Service) {
  return (
    <a
      href="#contact"
      aria-label={`${title}${note ? ` — ${note}` : ""} · Заяви консултация`}
      className={`svc${featured ? " is-featured" : ""}${compact ? " is-compact" : ""}`}
    >
      <div className="svc-canvas">
        {TRACKERS.map((n) => (
          <div key={n} className={`tracker tr-${n}`} />
        ))}

        <div className="svc-card">
          <div className="svc-content">
            <div className="svc-glare" />
            <div className="svc-lines">
              <span />
              <span />
              <span />
              <span />
            </div>
            <div className="svc-scan" />
            <div className="svc-glows">
              <div className="g1" />
              <div className="g2" />
              <div className="g3" />
            </div>
            <div className="svc-particles">
              <span />
              <span />
              <span />
              <span />
              <span />
              <span />
            </div>
            <div className="svc-corners">
              <span />
              <span />
              <span />
              <span />
            </div>

            {featured && (
              <span className="svc-badge">
                <Star aria-hidden className="size-2.5 fill-current" />
                най-поръчван
              </span>
            )}

            <div className="svc-body">
              <span className="svc-icon">
                <Icon aria-hidden className="size-5" strokeWidth={1.6} />
              </span>
              <h3 className="svc-name">{title}</h3>
              {note && <p className="svc-note">{note}</p>}
              {desc && <p className="svc-desc">{desc}</p>}
              <span className="svc-cta" aria-hidden>
                Заяви консултация
                <ArrowRight className="size-3.5" />
              </span>
            </div>
          </div>
        </div>
      </div>
    </a>
  );
}
