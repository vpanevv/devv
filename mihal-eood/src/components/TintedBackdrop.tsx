type Props = {
  /** Path under /public. */
  src: string
  /** Extra darkening for pages that carry body copy rather than a headline. */
  strength?: 'hero' | 'copy' | 'dark'
}

/**
 * The shared photographic backdrop: the image, a warm multiply, a vertical
 * fall-off, a vignette and film grain. Extracted so the hero and the About
 * page tint identically instead of drifting apart.
 */
const TINTS: Record<NonNullable<Props['strength']>, string> = {
  hero: 'bg-gradient-to-b from-timber-bark/50 via-timber-bark/15 to-timber-bark/70',
  copy: 'bg-timber-bark/75',
  dark: 'bg-timber-bark/90',
}

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
      <div className={`absolute inset-0 ${TINTS[strength]}`} />
      <div className="hero-vignette absolute inset-0" />
      <div className="hero-grain absolute inset-0 opacity-[0.14] mix-blend-overlay" />
    </>
  )
}
