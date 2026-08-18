import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import Nav from '../sections/Nav'
import Footer from '../sections/Footer'
import TintedBackdrop from '../components/TintedBackdrop'
import ProductCard from '../components/ProductCard'
import ProductDialog from '../components/ProductDialog'
import { PRODUCTS, type Product } from '../data/products'

export default function Products() {
  const [open, setOpen] = useState<Product | null>(null)

  useEffect(() => {
    document.title = 'Продукти — МИХАЛ ЕООД'
  }, [])

  return (
    <>
      <Nav />

      <div className="fixed inset-0 z-0 overflow-hidden bg-timber-bark">
        <TintedBackdrop src="/images/services.jpg" strength="dark" />
      </div>

      <main className="relative z-10 flex min-h-svh flex-col items-center justify-center px-6 py-32 md:px-10 md:py-44">
        <h1 className="sr-only">Продукти</h1>

        <div className="grid w-full max-w-[1200px] grid-cols-1 gap-5 sm:grid-cols-2 md:gap-6 xl:grid-cols-4">
          {PRODUCTS.map((product, i) => (
            <ProductCard
              key={product.id}
              product={product}
              onOpen={setOpen}
              delay={0.15 + i * 0.09}
            />
          ))}
        </div>

        <div className="fade-up mt-14 md:mt-16" style={{ animationDelay: '0.65s' }}>
          <Link to="/" className="cta-button cta-button--sm font-sans uppercase tracking-[0.18em]">
            <span>Назад</span>
          </Link>
        </div>
      </main>

      <Footer />

      <ProductDialog product={open} onClose={() => setOpen(null)} />
    </>
  )
}
