import { useEffect, useMemo, useRef } from "react";

const SIGNS = ["♈", "♉", "♊", "♋", "♌", "♍", "♎", "♏", "♐", "♑", "♒", "♓"];

/** Vertical step between signs, as a fraction of the sphere radius. */
const Y_STEP = 0.16;
/** Azimuth advance per sign, in degrees. */
const AZIMUTH_STEP = -85;

/**
 * Rotating 3D sphere of zodiac glyphs with two orbit rings — the signature
 * background of the hero. Signs are laid out on a sphere of radius
 * `size * 0.425`; depth (z) drives both scale and opacity so glyphs at the
 * back read as further away.
 */
export default function ZodiacOrbit({ size = 780 }: { size?: number }) {
  const radius = size * 0.425;
  const ringSize = size * 0.92;

  const rootRef = useRef<HTMLDivElement>(null);
  const tiltRef = useRef<HTMLDivElement>(null);
  const spinRef = useRef<HTMLDivElement>(null);

  const glyphs = useMemo(
    () =>
      SIGNS.map((sign, i) => {
        const yNorm = 1 - i * Y_STEP;
        const y = radius * yNorm;
        const ringRadius = radius * Math.sqrt(Math.max(0, 1 - yNorm * yNorm));
        const angle = (i * AZIMUTH_STEP * Math.PI) / 180;
        const x = ringRadius * Math.cos(angle);
        const z = ringRadius * Math.sin(angle);
        const depth = z / radius;
        return {
          sign,
          x,
          y,
          z,
          scale: 0.85 + 0.25 * depth,
          opacity: 0.625 + 0.375 * depth,
        };
      }),
    [radius],
  );

  useEffect(() => {
    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    if (reduced) return;

    const root = rootRef.current;
    if (!root) return;

    let frame = 0;
    let running = false;

    const loop = (t: number) => {
      const seconds = t / 1000;
      if (spinRef.current) {
        spinRef.current.style.transform = `rotateY(${(seconds * 4.5) % 360}deg)`;
      }
      if (tiltRef.current) {
        tiltRef.current.style.transform = `rotateX(${-12 + 4 * Math.sin(seconds * 0.11)}deg)`;
      }
      frame = requestAnimationFrame(loop);
    };

    const start = () => {
      if (running) return;
      running = true;
      frame = requestAnimationFrame(loop);
    };
    const stop = () => {
      if (!running) return;
      running = false;
      cancelAnimationFrame(frame);
    };

    /* Only spin while the hero is actually on screen — otherwise this runs for
       the whole 10,000px page and keeps the main thread busy for nothing. */
    const observer = new IntersectionObserver(
      ([entry]) => (entry.isIntersecting ? start() : stop()),
      { rootMargin: "100px" },
    );
    observer.observe(root);

    const onVisibility = () =>
      document.hidden ? stop() : root.checkVisibility?.() !== false && start();
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      observer.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
      stop();
    };
  }, []);

  return (
    <div
      ref={rootRef}
      aria-hidden
      className="pointer-events-none relative"
      style={{ width: size, height: size, perspective: size * 2.2 }}
    >
      {/* Soft gold core glow */}
      <div className="absolute inset-0 rounded-full bg-[radial-gradient(circle,oklch(0.82_0.10_80/0.20),transparent_60%)] blur-2xl" />

      <div
        ref={tiltRef}
        className="absolute inset-0"
        style={{ transformStyle: "preserve-3d", transform: "rotateX(-12deg)" }}
      >
        <div
          ref={spinRef}
          className="absolute inset-0"
          style={{ transformStyle: "preserve-3d" }}
        >
          {/* Two orbit rings at different inclinations */}
          <div
            className="absolute top-1/2 left-1/2 rounded-full border border-gold/25"
            style={{
              width: ringSize,
              height: ringSize,
              transform: "translate(-50%, -50%) rotateX(75deg)",
              boxShadow: "inset 0 0 40px oklch(0.82 0.10 80 / 0.10)",
            }}
          />
          <div
            className="absolute top-1/2 left-1/2 rounded-full border border-gold/15"
            style={{
              width: ringSize,
              height: ringSize,
              transform: "translate(-50%, -50%) rotateY(70deg) rotateX(15deg)",
            }}
          />

          {glyphs.map((g) => (
            <span
              key={g.sign}
              className="font-serif text-gold select-none"
              style={{
                position: "absolute",
                left: "50%",
                top: "50%",
                transform: `translate(-50%, -50%) translate3d(${g.x}px, ${g.y}px, ${g.z}px) scale(${g.scale})`,
                opacity: g.opacity,
                willChange: "transform",
                fontSize: size / 15,
                fontWeight: 500,
                textShadow:
                  "0 0 22px oklch(0.82 0.10 80 / 0.7), 0 4px 14px oklch(0.05 0.02 285 / 0.6)",
              }}
            >
              {g.sign}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
