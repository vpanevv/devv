import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import Nav from '../sections/Nav'
import Footer from '../sections/Footer'
import TintedBackdrop from '../components/TintedBackdrop'
import CoverflowCarousel from '../components/CoverflowCarousel'
import Lightbox from '../components/Lightbox'
import { GALLERY_IMAGES } from '../data/gallery'

export default function Gallery() {
  const [zoomed, setZoomed] = useState<number | null>(null)

  useEffect(() => {
    document.title = 'Галерия — МИХАЛ ЕООД'
  }, [])

  return (
    <>
      <Nav />

      <div className="fixed inset-0 z-0 overflow-hidden bg-timber-bark">
        <TintedBackdrop src="/images/services.jpg" strength="dark" />
      </div>

      <main className="relative z-10 flex min-h-svh flex-col items-center justify-center px-4 py-32 md:py-40">
        <h1 className="sr-only">Галерия</h1>

        <div className="fade-up h-[420px] w-full max-w-[1200px] md:h-[520px]" style={{ animationDelay: '0.2s' }}>
          <CoverflowCarousel images={GALLERY_IMAGES} onActivate={setZoomed} />
        </div>

        <p
          className="fade-up mt-8 px-6 text-center font-sans text-[0.66rem] uppercase tracking-[0.2em] text-timber-cream/45"
          style={{ animationDelay: '0.35s' }}
        >
          Натиснете снимка, за да я видите в по-голям размер
        </p>

        <div className="fade-up mt-12 md:mt-14" style={{ animationDelay: '0.45s' }}>
          <Link to="/" className="cta-button cta-button--sm font-sans uppercase tracking-[0.18em]">
            <span>Назад</span>
          </Link>
        </div>
      </main>

      <Footer />

      <Lightbox
        image={zoomed === null ? null : GALLERY_IMAGES[zoomed]}
        onClose={() => setZoomed(null)}
      />
    </>
  )
}
