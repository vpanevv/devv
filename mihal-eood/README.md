# МИХАЛ ЕООД — landing page

Vite + React + Tailwind. Bulgarian-language landing page for a timber yard in Разлог.

## Run

```bash
npm install
npm run dev
```

## Hero background photo

The hero expects the lumber-yard photograph at:

```
public/images/hero.png
```

If that file is missing the hero falls back to a warm gradient (`.hero-fallback` in
`src/index.css`), so the page never renders broken.

Guidance for the file: landscape, at least 2400px wide, warm/golden light. The tint
layers in `src/sections/Hero.tsx` assume a mid-to-dark image; a very bright photo may
need the overlay opacities nudged up.

## Structure

- `src/sections/Hero.tsx` — hero section: photo, tint stack, animated headline
- `src/index.css` — keyframes, film grain, vignette, gradient fallback
- `tailwind.config.js` — `timber` palette, `font-display` (Oswald) / `font-sans` (Inter)
