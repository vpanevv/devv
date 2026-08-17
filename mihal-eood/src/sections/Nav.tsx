import { useEffect, useState } from 'react'

const LINKS = [
  { label: 'Продукти', href: '#products' },
  { label: 'Доставка', href: '#delivery' },
  { label: 'За нас', href: '#about' },
  { label: 'Контакти', href: '#contact' },
]

export default function Nav() {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  // Swap from transparent-over-photo to a blurred bar once the hero starts leaving.
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
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
        className={`fade-down fixed inset-x-0 top-0 z-50 transition-colors duration-500 ${
          scrolled && !menuOpen
            ? 'border-b border-white/10 bg-timber-bark/75 backdrop-blur-md'
            : 'border-b border-transparent'
        }`}
        style={{ animationDelay: '0.25s' }}
      >
        <div className="mx-auto flex h-20 max-w-[1600px] items-center justify-between px-6 md:h-24 md:px-10">
          <a
            href="#top"
            className="font-display text-sm font-medium uppercase tracking-[0.32em] text-white transition-opacity hover:opacity-70 md:text-base"
          >
            Михал<span className="ml-2 text-timber-sap">ЕООД</span>
          </a>

          <nav aria-label="Основна навигация" className="hidden md:block">
            <ul className="flex items-center gap-11">
              {LINKS.map(({ label, href }) => (
                <li key={href}>
                  <a
                    href={href}
                    className="group relative block font-serif text-xl tracking-[0.02em] text-white/80 transition-colors hover:text-white focus-visible:text-white"
                  >
                    {label}
                    {/* Underline wipes in from the left, out to the right */}
                    <span className="absolute -bottom-2 left-0 h-px w-full origin-right scale-x-0 bg-timber-sap transition-transform duration-500 ease-out group-hover:origin-left group-hover:scale-x-100 group-focus-visible:origin-left group-focus-visible:scale-x-100" />
                  </a>
                </li>
              ))}
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
      </header>

      {/* Mobile overlay */}
      <div
        id="mobile-menu"
        hidden={!menuOpen}
        className="fixed inset-0 z-40 bg-timber-bark/95 backdrop-blur-lg md:hidden"
      >
        <nav aria-label="Мобилна навигация" className="flex h-full items-center px-8">
          <ul className="w-full space-y-2">
            {LINKS.map(({ label, href }, i) => (
              <li key={href} className={menuOpen ? 'fade-up' : ''} style={{ animationDelay: `${0.08 + i * 0.07}s` }}>
                <a
                  href={href}
                  onClick={() => setMenuOpen(false)}
                  className="block py-3 font-serif text-4xl text-white"
                >
                  {label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </>
  )
}
