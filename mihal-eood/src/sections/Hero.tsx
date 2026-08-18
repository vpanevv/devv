import { useState } from 'react'

const HEADLINE = 'МИХАЛ ЕООД'

// Split into words so nothing breaks mid-word, but keep one running glyph
// counter across the whole line so the stagger reads as a single sweep.
const WORDS = (() => {
  let glyphIndex = 0
  return HEADLINE.split(' ').map((word) => ({
    word,
    glyphs: [...word].map((glyph) => ({ glyph, delay: 0.55 + glyphIndex++ * 0.055 })),
  }))
})()

// hero.jpg is a q82 export of the original hero.png (2.1 MB → 362 KB).
const HERO_IMAGE = '/images/hero.jpg'

export default function Hero() {
  // If the photo is missing the gradient fallback shows through instead of a broken image.
  const [photoFailed, setPhotoFailed] = useState(false)

  return (
    <section className="hero-fallback relative h-svh min-h-[560px] w-full overflow-hidden">
      {/* Photograph */}
      {!photoFailed && (
        <img
          src={HERO_IMAGE}
          alt=""
          aria-hidden="true"
          className="hero-kenburns absolute inset-0 h-full w-full object-cover object-center"
          onError={() => setPhotoFailed(true)}
        />
      )}

      {/* Tint: a warm multiply, then a vertical fall-off so the type stays legible */}
      <div className="absolute inset-0 bg-[#3b2510] opacity-30 mix-blend-multiply" />
      <div className="absolute inset-0 bg-gradient-to-b from-timber-bark/50 via-timber-bark/15 to-timber-bark/70" />
      <div className="hero-scrim absolute inset-0" />
      <div className="hero-vignette absolute inset-0" />
      <div className="hero-grain absolute inset-0 opacity-[0.14] mix-blend-overlay" />

      {/* Headline + CTA */}
      <div className="relative z-10 flex h-full flex-col items-center justify-center px-6">
        {/* Wraps to two lines on phones, so it can be sized far larger there than the one-line desktop setting */}
        <h1 className="text-center font-display text-[clamp(3rem,16vw,6rem)] font-bold uppercase leading-[0.86] tracking-[0.005em] text-white [text-shadow:0_2px_40px_rgba(18,12,4,0.55)] md:text-[min(10.5vw,12rem)]">
          <span className="sr-only">{HEADLINE}</span>
          {WORDS.map(({ word, glyphs }) => (
            <span key={word} aria-hidden="true" className="mx-[0.14em] inline-block whitespace-nowrap">
              {glyphs.map(({ glyph, delay }, i) => (
                <span
                  key={`${word}-${i}`}
                  className="inline-block overflow-hidden align-bottom pb-[0.06em]"
                >
                  <span className="glyph-rise inline-block" style={{ animationDelay: `${delay}s` }}>
                    {glyph}
                  </span>
                </span>
              ))}
            </span>
          ))}
        </h1>

        {/* CTA */}
        <a
          href="#products"
          className="cta-button fade-up mt-10 font-sans uppercase tracking-[0.14em] md:mt-12 md:tracking-[0.18em]"
          style={{ animationDelay: '1.5s' }}
        >
          <span>Разгледай нашите продукти</span>
        </a>
      </div>

      {/* Hairline rule that hands the eye off to whatever section comes next */}
      <div
        className="fade-up absolute inset-x-0 bottom-0 z-10 h-px bg-gradient-to-r from-transparent via-timber-sap/45 to-transparent"
        style={{ animationDelay: '1.6s' }}
      />
    </section>
  )
}
