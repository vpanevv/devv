import { useEffect, useRef } from 'react'
import type { Product } from '../data/products'

type Props = {
  product: Product | null
  onClose: () => void
}

export default function ProductDialog({ product, onClose }: Props) {
  const closeRef = useRef<HTMLButtonElement>(null)
  const lastFocused = useRef<Element | null>(null)

  useEffect(() => {
    if (!product) return

    lastFocused.current = document.activeElement
    closeRef.current?.focus()

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', onKey)

    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener('keydown', onKey)
      // Send focus back to whatever opened the dialog.
      ;(lastFocused.current as HTMLElement | null)?.focus?.()
    }
  }, [product, onClose])

  if (!product) return null

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center p-4 md:p-8"
      role="dialog"
      aria-modal="true"
      aria-labelledby="product-dialog-title"
    >
      {/* Click-away layer */}
      <button
        type="button"
        aria-label="Затвори"
        tabIndex={-1}
        onClick={onClose}
        className="absolute inset-0 cursor-default bg-timber-bark/70 backdrop-blur-sm"
      />

      <div className="liquid-glass fade-up relative max-h-full w-full max-w-lg overflow-y-auto rounded-3xl p-7 md:p-10">
        <button
          ref={closeRef}
          type="button"
          onClick={onClose}
          aria-label="Затвори"
          className="absolute right-5 top-5 flex h-9 w-9 items-center justify-center rounded-full border border-white/25 text-white transition-colors hover:border-white hover:bg-white hover:text-timber-bark md:right-7 md:top-7"
        >
          ✕
        </button>

        <h2
          id="product-dialog-title"
          className="pr-12 font-display text-2xl font-bold uppercase tracking-[0.02em] text-white md:text-3xl"
        >
          {product.name}
        </h2>

        <div className="mt-5 h-px w-full bg-gradient-to-r from-timber-sap/60 via-timber-sap/20 to-transparent" />

        {product.note && (
          <p className="mt-6 font-sans text-[0.95rem] font-light leading-[1.8] text-timber-cream/85">
            {product.note}
          </p>
        )}

        {product.groups.map((group, i) => (
          <div key={group.title ?? i} className={i === 0 && !product.note ? 'mt-6' : 'mt-7'}>
            {group.title && (
              <h3 className="font-display text-lg font-bold uppercase tracking-[0.12em] text-timber-sap">
                {group.title}
              </h3>
            )}
            <dl className={group.title ? 'mt-3 space-y-3' : 'space-y-3'}>
              {group.specs.map((spec) => (
                <div key={spec.label} className="flex flex-wrap items-center gap-x-3 gap-y-2">
                  <dt className="font-sans text-[0.9rem] font-light text-timber-cream/70">
                    {spec.label}
                  </dt>
                  <dd className="flex flex-wrap items-center gap-1.5">
                    {spec.values.map((value) => (
                      <span
                        key={value}
                        className="rounded-lg bg-timber-sap/20 px-2.5 py-1 font-sans text-[0.9rem] font-medium text-timber-cream ring-1 ring-inset ring-timber-sap/40"
                      >
                        {value} {spec.unit}
                      </span>
                    ))}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        ))}
      </div>
    </div>
  )
}
