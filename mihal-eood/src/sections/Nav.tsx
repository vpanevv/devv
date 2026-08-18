import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

const LINKS = [
  { label: 'Продукти', href: '/products', route: true },
  { label: 'Доставка', href: '/#delivery', route: false },
  { label: 'Галерия', href: '/gallery', route: true },
  { label: 'За нас', href: '/about-us', route: true },
  { label: 'Контакти', href: '/contacts', route: true },
]

/** Scroll distance over which the bar ramps from clear to fully opaque. */
const DARKEN_OVER = 140

export default function Nav() {
  const [progress, setProgress] = useState(0)
  const [menuOpen, setMenuOpen] = useState(false)

  // The bar darkens continuously with scroll rather than snapping at a
  // threshold — a white tint alone lightens against bright photography, so
  // content behind it bled through and the links became hard to read.
  useEffect(() => {
    let frame = 0
    const onScroll = () => {
      cancelAnimationFrame(frame)
      frame = requestAnimationFrame(() =>
        setProgress(Math.min(window.scrollY / DARKEN_OVER, 1)),
      )
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      cancelAnimationFrame(frame)
      window.removeEventListener('scroll', onScroll)
    }
  }, [])

  // Lock the page behind the mobile overlay, and let Escape dismiss it.
  useEffect(() => {
    if (!menuOpen) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMenuOpen(false)
    }
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener('keydown', onKey)
    }
  }, [menuOpen])

  return (
    <>
      <header
        className="fade-down fixed inset-x-0 top-0 z-50 px-4 pt-4 md:px-8 md:pt-6"
        style={{ animationDelay: '0.25s' }}
      >
        <div className="liquid-glass relative mx-auto h-16 max-w-[1500px] overflow-hidden rounded-full md:h-20">
          {/* Opacity ramps with scroll position, so the bar gains weight
              exactly as much as it needs to stay legible. */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 bg-timber-bark"
            style={{ opacity: 0.06 + 0.82 * (menuOpen ? 1 : progress) }}
          />

          <div className="relative flex h-full items-center justify-between px-6 md:px-10">
          <Link
            to="/"
            className="font-display text-sm font-medium uppercase tracking-[0.32em] text-white transition-opacity hover:opacity-70 md:text-base"
          >
            Михал<span className="ml-2 text-timber-sap">ЕООД</span>
          </Link>

          <nav aria-label="Основна навигация" className="hidden md:block">
            <ul className="flex items-center gap-11">
              {LINKS.map(({ label, href, route }) => {
                const className =
                  'group relative block font-serif text-xl tracking-[0.02em] text-white/80 transition-colors hover:text-white focus-visible:text-white'
                // Underline wipes in from the left, out to the right
                const underline = (
                  <span className="absolute -bottom-1 left-0 h-px w-full origin-right scale-x-0 bg-timber-sap transition-transform duration-500 ease-out group-hover:origin-left group-hover:scale-x-100 group-focus-visible:origin-left group-focus-visible:scale-x-100" />
                )
                return (
                  <li key={href}>
                    {route ? (
                      <Link to={href} className={className}>
                        {label}
                        {underline}
                      </Link>
                    ) : (
                      <a href={href} className={className}>
                        {label}
                        {underline}
                      </a>
                    )}
                  </li>
                )
              })}
            </ul>
          </nav>

          <button
            type="button"
            onClick={() => setMenuOpen((open) => !open)}
            aria-expanded={menuOpen}
            aria-controls="mobile-menu"
            aria-label={menuOpen ? 'Затвори менюто' : 'Отвори менюто'}
            className="relative z-50 -mr-2 flex h-10 w-10 flex-col items-center justify-center gap-[7px] md:hidden"
          >
            <span
              className={`block h-px w-7 bg-white transition-transform duration-300 ${
                menuOpen ? 'translate-y-[4px] rotate-45' : ''
              }`}
            />
            <span
              className={`block h-px w-7 bg-white transition-transform duration-300 ${
                menuOpen ? '-translate-y-[4px] -rotate-45' : ''
              }`}
            />
          </button>
          </div>
        </div>
      </header>

      {/* Mobile overlay */}
      <div
        id="mobile-menu"
        hidden={!menuOpen}
        className="liquid-glass-panel fixed inset-0 z-40 md:hidden"
      >
        <nav aria-label="Мобилна навигация" className="flex h-full items-center px-8">
          <ul className="w-full space-y-2">
            {LINKS.map(({ label, href, route }, i) => (
              <li key={href} className={menuOpen ? 'fade-up' : ''} style={{ animationDelay: `${0.08 + i * 0.07}s` }}>
                {route ? (
                  <Link
                    to={href}
                    onClick={() => setMenuOpen(false)}
                    className="block py-3 font-serif text-4xl text-white"
                  >
                    {label}
                  </Link>
                ) : (
                  <a
                    href={href}
                    onClick={() => setMenuOpen(false)}
                    className="block py-3 font-serif text-4xl text-white"
                  >
                    {label}
                  </a>
                )}
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </>
  )
}
