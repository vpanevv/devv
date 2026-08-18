# МИХАЛ ЕООД — landing page

Vite + React + Tailwind. Bulgarian-language landing page for a timber yard in Разлог.

## Run

```bash
npm install
npm run dev
```

## Routes

| Path      | Page                          |
| --------- | ----------------------------- |
| `/`       | Landing page (hero)           |
| `/za-nas` | За нас                        |

Client-side routing via react-router. **Deploying to static hosting needs a
rewrite rule sending all paths to `index.html`**, otherwise a direct hit on
`/za-nas` returns 404. Netlify: `/* /index.html 200` in `_redirects`.
Vercel/Cloudflare Pages handle SPAs automatically.

## Background photos

`public/images/` holds both the originals (`.png`) and the compressed exports
the pages actually load (`.jpg`, q82 — roughly a sixth of the size). The
originals are unused at runtime; they are kept only as masters.

If the hero photo is missing the page falls back to a warm gradient
(`.hero-fallback` in `src/index.css`), so it never renders broken.

Guidance for new photos: landscape, at least 2400px wide, warm/golden light. The tint
layers in `src/sections/Hero.tsx` assume a mid-to-dark image; a very bright photo may
need the overlay opacities nudged up.

## Structure

- `src/sections/Hero.tsx` — hero: photo, tint stack, animated headline, CTA
- `src/sections/Nav.tsx` — liquid glass nav bar and mobile overlay menu
- `src/pages/About.tsx` — За нас
- `src/components/TintedBackdrop.tsx` — shared photo + tint stack
- `src/index.css` — keyframes, liquid glass, CTA button, grain, vignette
- `tailwind.config.js` — `timber` palette; `font-display` (Oswald),
  `font-serif` (Playfair Display), `font-sans` (Inter)
