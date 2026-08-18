import type { Product } from '../data/products'

type Props = {
  product: Product
  onOpen: (product: Product) => void
  delay: number
}

export default function ProductCard({ product, onOpen, delay }: Props) {
  return (
    <button
      type="button"
      onClick={() => onOpen(product)}
      style={{ animationDelay: `${delay}s` }}
      className="fade-up group relative aspect-[16/10] w-full overflow-hidden rounded-3xl text-left [isolation:isolate] focus:outline-none focus-visible:ring-2 focus-visible:ring-timber-sap focus-visible:ring-offset-4 focus-visible:ring-offset-timber-bark sm:aspect-[3/4]"
    >
      <img
        src={product.image}
        alt=""
        aria-hidden="true"
        className="absolute inset-0 h-full w-full object-cover object-center transition-transform duration-[900ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-105"
      />

      {/* Dark at the base so the label always has something to sit on, and a
          lighter wash overall that lifts on hover to reveal more of the photo. */}
      <div className="absolute inset-0 bg-[#3b2510] opacity-25 mix-blend-multiply" />
      <div className="absolute inset-0 bg-timber-bark/45 transition-colors duration-500 group-hover:bg-timber-bark/25" />
      <div className="absolute inset-0 bg-gradient-to-t from-timber-bark via-timber-bark/30 to-transparent" />
      <div className="hero-grain absolute inset-0 opacity-[0.12] mix-blend-overlay" />

      {/* Rim light, so the cards read as objects rather than cropped photos */}
      <div className="absolute inset-0 rounded-3xl ring-1 ring-inset ring-white/15 transition-colors duration-500 group-hover:ring-white/35" />

      <div className="absolute inset-x-0 bottom-0 p-6 md:p-7">
        <h2 className="font-display text-xl font-bold uppercase leading-[1.05] tracking-[0.01em] text-white [text-shadow:0_2px_20px_rgba(18,12,4,0.7)] md:text-2xl">
          {product.name}
        </h2>

        {/* Arrow stays in the text flow, so it follows the last word when the
            label wraps on narrow cards instead of stranding at the far edge. */}
        <span className="mt-3 block font-sans text-[0.6rem] font-medium uppercase leading-[1.6] tracking-[0.14em] text-timber-sap md:text-[0.64rem]">
          Натисни за повече информация{' '}
          <span
            aria-hidden="true"
            className="inline-block transition-transform duration-500 ease-out group-hover:translate-x-1"
          >
            →
          </span>
        </span>
      </div>
    </button>
  )
}
