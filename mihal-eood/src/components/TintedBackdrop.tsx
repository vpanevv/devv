type Props = {
  /** Path under /public. */
  src: string
  /** Extra darkening for pages that carry body copy rather than a headline. */
  strength?: 'hero' | 'copy'
}

/**
 * The shared photographic backdrop: the image, a warm multiply, a vertical
 * fall-off, a vignette and film grain. Extracted so the hero and the About
 * page tint identically instead of drifting apart.
 */
export default function TintedBackdrop({ src, strength = 'hero' }: Props) {
  return (
    <>
      <img
        src={src}
        alt=""
        aria-hidden="true"
        className="absolute inset-0 h-full w-full object-cover object-center"
      />
      <div className="absolute inset-0 bg-[#3b2510] opacity-30 mix-blend-multiply" />
      <div
        className={
          strength === 'copy'
            ? 'absolute inset-0 bg-timber-bark/75'
            : 'absolute inset-0 bg-gradient-to-b from-timber-bark/50 via-timber-bark/15 to-timber-bark/70'
        }
      />
      <div className="hero-vignette absolute inset-0" />
      <div className="hero-grain absolute inset-0 opacity-[0.14] mix-blend-overlay" />
    </>
  )
}
