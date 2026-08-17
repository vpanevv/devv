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

        {/* CTA — dark fill wipes up from the base and the label inverts to cream */}
        <a
          href="#products"
          className="fade-up group relative mt-10 inline-flex items-center justify-center gap-3 overflow-hidden bg-timber-cream px-7 py-4 font-sans text-[0.7rem] font-medium uppercase tracking-[0.14em] text-timber-bark focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-timber-cream md:mt-12 md:px-11 md:py-5 md:text-[0.85rem] md:tracking-[0.18em]"
          style={{ animationDelay: '1.5s' }}
        >
          <span
            aria-hidden="true"
            className="absolute inset-0 origin-bottom scale-y-0 bg-timber-bark transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-y-100 group-focus-visible:scale-y-100"
          />
          <span className="relative z-10 transition-colors duration-300 group-hover:text-timber-cream group-focus-visible:text-timber-cream">
            Разгледай нашите продукти
          </span>
          <span
            aria-hidden="true"
            className="relative z-10 transition-all duration-300 group-hover:translate-x-1 group-hover:text-timber-cream group-focus-visible:text-timber-cream"
          >
            →
          </span>
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
