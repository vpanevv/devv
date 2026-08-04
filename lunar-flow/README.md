# lunar-flow

Rebuild of the Магдалена Бангеева landing page (originally `lunar-flow-landing.lovable.app`),
kept on the same stack so it can be pushed back to Lovable via GitHub sync.

**Stack:** Vite 7 · React 19 · TypeScript · Tailwind v4 · lucide-react

```bash
npm install
npm run dev     # http://localhost:5180
```

## Status

| Section | State |
|---|---|
| Header | ported, minimal |
| Hero | **rebuilt** |
| Course · Services · Tarot · Финансови дни · Amulets · Steps · About · Testimonials · FAQ · Contact · Footer | not yet ported |

## Design tokens

The OKLCH palette in `src/index.css` (`@theme`) is copied verbatim from the original build —
cosmos base, plum/violet accents, gold primary, the gold gradient and the `0 0 60px` glow.
Fonts stay Cormorant Garamond (serif) + Manrope (sans).

## Background effects

Both are reproduced from the original:

- `Starfield.tsx` — 90 randomised stars driven by the `twinkle` keyframe via `--d` / `--delay`.
- `ZodiacOrbit.tsx` — the rotating sphere of zodiac glyphs. Signs sit on a sphere of radius
  `size * 0.425`, stepping `0.16` down the Y axis and `-85°` in azimuth per sign; depth (`z`)
  drives `scale = 0.85 + 0.25·(z/r)` and `opacity = 0.625 + 0.375·(z/r)`. Two orbit rings at
  `rotateX(75deg)` and `rotateY(70deg) rotateX(15deg)`. A rAF loop spins the sphere and
  oscillates the tilt; it is skipped under `prefers-reduced-motion`.

## Fixes carried in from the audit

- `<html lang="bg">` (the original shipped `lang="en"` on a fully Bulgarian page)
- real `aria-label` on the Instagram link
- `prefers-reduced-motion` honoured across every animation
- lucide dropped brand marks in v1, so the Instagram glyph is a local inline SVG
