import { useMemo } from "react";

/**
 * Twinkling starfield. Positions are randomised once on mount and driven by
 * the CSS `twinkle` keyframe via the --d / --delay custom properties.
 */
export default function Starfield({ count = 90 }: { count?: number }) {
  const stars = useMemo(
    () =>
      Array.from({ length: count }, () => ({
        top: Math.random() * 100,
        left: Math.random() * 100,
        size: 0.5 + Math.random() * 2,
        opacity: 0.4 + Math.random() * 0.6,
        duration: 3.4 + Math.random() * 4.6,
        delay: Math.random() * 5,
      })),
    [count],
  );

  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      {stars.map((s, i) => (
        <span
          key={i}
          className="star absolute rounded-full bg-white"
          style={{
            top: `${s.top}%`,
            left: `${s.left}%`,
            width: `${s.size}px`,
            height: `${s.size}px`,
            opacity: s.opacity,
            boxShadow: "0 0 6px rgba(255,255,255,0.6)",
            ["--d" as string]: `${s.duration}s`,
            ["--delay" as string]: `${s.delay}s`,
          }}
        />
      ))}
    </div>
  );
}
