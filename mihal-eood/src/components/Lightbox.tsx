import { useEffect, useRef } from 'react'
import type { GalleryImage } from '../data/gallery'

type Props = {
  image: GalleryImage | null
  onClose: () => void
}

export default function Lightbox({ image, onClose }: Props) {
  const closeRef = useRef<HTMLButtonElement>(null)
  const lastFocused = useRef<Element | null>(null)

  useEffect(() => {
    if (!image) return

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
      ;(lastFocused.current as HTMLElement | null)?.focus?.()
    }
  }, [image, onClose])

  if (!image) return null

  return (
    <div
      className="fixed inset-0 z-[70] flex items-center justify-center p-4 md:p-10"
      role="dialog"
      aria-modal="true"
      aria-label={image.alt}
    >
      {/* Click-away layer */}
      <button
        type="button"
        aria-label="Затвори"
        tabIndex={-1}
        onClick={onClose}
        className="absolute inset-0 cursor-default bg-timber-bark/90 backdrop-blur-md"
      />

      <img
        src={image.srcUrl}
        alt={image.alt}
        className="fade-up relative max-h-full max-w-full rounded-xl object-contain shadow-[0_30px_90px_rgba(0,0,0,0.7)]"
      />

      <button
        ref={closeRef}
        type="button"
        onClick={onClose}
        aria-label="Затвори"
        className="absolute right-4 top-4 flex h-11 w-11 items-center justify-center rounded-full border border-white/30 bg-timber-bark/60 text-lg text-white backdrop-blur-sm transition-colors hover:border-white hover:bg-white hover:text-timber-bark md:right-8 md:top-8"
      >
        ✕
      </button>
    </div>
  )
}
