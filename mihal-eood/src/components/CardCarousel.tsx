import { useCallback, useEffect, useRef, useState } from 'react'

export type Card = {
  image: string
  text: string
}

type Props = {
  cards: Card[]
  label: string
}

/**
 * Scroll-snap carousel. Native horizontal scrolling does the swiping — that
 * gives real touch momentum and trackpad gestures for free — while the arrows,
 * dots and arrow keys drive the same scroll container.
 */
export default function CardCarousel({ cards, label }: Props) {
  const trackRef = useRef<HTMLDivElement>(null)
  const [active, setActive] = useState(0)

  // Whichever card's centre sits closest to the track's centre is the active one.
  const syncActive = useCallback(() => {
    const track = trackRef.current
    if (!track) return
    const trackCentre = track.scrollLeft + track.clientWidth / 2
    let closest = 0
    let smallest = Infinity
    Array.from(track.children).forEach((child, i) => {
      const el = child as HTMLElement
      const distance = Math.abs(el.offsetLeft + el.clientWidth / 2 - trackCentre)
      if (distance < smallest) {
        smallest = distance
        closest = i
      }
    })
    setActive(closest)
  }, [])

  const goTo = useCallback((index: number) => {
    const track = trackRef.current
    if (!track) return
    const card = track.children[index] as HTMLElement | undefined
    if (!card) return
    // Scrolling the track directly, rather than scrollIntoView, so the page
    // itself never moves vertically.
    track.scrollTo({
      left: card.offsetLeft - (track.clientWidth - card.clientWidth) / 2,
      behavior: 'smooth',
    })
  }, [])

  useEffect(() => {
    syncActive()
    window.addEventListener('resize', syncActive)
    return () => window.removeEventListener('resize', syncActive)
  }, [syncActive])

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowRight') {
      e.preventDefault()
      goTo(Math.min(active + 1, cards.length - 1))
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault()
      goTo(Math.max(active - 1, 0))
    }
  }

  return (
    <section aria-roledescription="карусел" aria-label={label}>
      <div
        ref={trackRef}
        onScroll={syncActive}
        onKeyDown={onKeyDown}
        tabIndex={0}
        className="no-scrollbar flex snap-x snap-mandatory gap-4 overflow-x-auto px-[9vw] pb-2 focus:outline-none md:gap-6 md:px-0"
      >
        {cards.map((card, i) => (
          <article
            key={card.image}
            aria-label={`${i + 1} от ${cards.length}`}
            className="relative w-[82vw] shrink-0 snap-center overflow-hidden rounded-3xl [isolation:isolate] md:w-full"
          >
            <img
              src={card.image}
              alt=""
              aria-hidden="true"
              className="absolute inset-0 h-full w-full object-cover object-center"
            />
            {/* Light enough to read the photograph through, with a scrim behind
                the copy doing the contrast work instead of a flat page-wide tint. */}
            <div className="absolute inset-0 bg-[#3b2510] opacity-20 mix-blend-multiply" />
            <div className="absolute inset-0 bg-timber-bark/45" />
            <div className="hero-scrim absolute inset-0" />
            <div className="hero-grain absolute inset-0 opacity-[0.12] mix-blend-overlay" />

            <div className="relative flex min-h-[420px] items-center justify-center p-8 md:min-h-[460px] md:p-14">
              <p className="max-w-[46ch] text-center font-sans text-[0.95rem] font-light leading-[1.85] text-white [text-shadow:0_1px_18px_rgba(18,12,4,0.85)] md:text-[1.05rem]">
                {card.text}
              </p>
            </div>
          </article>
        ))}
      </div>

      {/* Controls */}
      <div className="mt-8 flex items-center justify-between px-[9vw] md:px-0">
        <div className="flex gap-2.5" role="tablist" aria-label="Карти">
          {cards.map((card, i) => (
            <button
              key={card.image}
              type="button"
              role="tab"
              aria-selected={i === active}
              aria-label={`Карта ${i + 1}`}
              onClick={() => goTo(i)}
              className={`h-1.5 rounded-full transition-all duration-500 ${
                i === active ? 'w-8 bg-timber-sap' : 'w-1.5 bg-white/30 hover:bg-white/60'
              }`}
            />
          ))}
        </div>

        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => goTo(Math.max(active - 1, 0))}
            disabled={active === 0}
            aria-label="Предишна карта"
            className="flex h-11 w-11 items-center justify-center rounded-full border border-white/25 text-white transition-colors hover:border-white hover:bg-white hover:text-timber-bark disabled:pointer-events-none disabled:opacity-30"
          >
            ←
          </button>
          <button
            type="button"
            onClick={() => goTo(Math.min(active + 1, cards.length - 1))}
            disabled={active === cards.length - 1}
            aria-label="Следваща карта"
            className="flex h-11 w-11 items-center justify-center rounded-full border border-white/25 text-white transition-colors hover:border-white hover:bg-white hover:text-timber-bark disabled:pointer-events-none disabled:opacity-30"
          >
            →
          </button>
        </div>
      </div>
    </section>
  )
}
