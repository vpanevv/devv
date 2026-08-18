import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { motion, useMotionValue, useReducedMotion, useTransform, type MotionValue } from 'framer-motion'

/**
 * CoverflowCarousel — a flat-slat "cover flow" gallery.
 *
 * The active item is a big landscape card centered in the stage; every other
 * item is a thin flat slat of a fixed size. Each card is positioned by its
 * wrapped relative offset from the active index, so stepping is always a
 * single-slat move and the loop is seamless.
 *
 * Adapted from the Originkit Framer component: the Framer RenderTarget shim
 * and property controls are dropped (nothing is ever statically rendered
 * here), and the fixed pixel sizing is scaled to the container so it works
 * below 1000px wide.
 */

type CoverflowImage = {
  srcUrl?: string
  alt?: string
}

type Props = {
  images?: CoverflowImage[]
  activeWidth?: number
  activeHeight?: number
  restWidth?: number
  restHeight?: number
  gap?: number
  radius?: number
  showArrows?: boolean
  arrowColor?: string
  arrowBackground?: string
  arrowSize?: number
  arrowPosition?: number
  autoplay?: boolean
  autoplayDirection?: 'leftToRight' | 'rightToLeft'
  transition?: { duration?: number; delay?: number }
  /** Called when the already-centred card is tapped again. */
  onActivate?: (index: number) => void
  style?: React.CSSProperties
}

// Warm fallbacks behind each card while its photo decodes — the original's
// rainbow gradients flashed hard against this palette.
const GRADIENT_FALLBACKS = [
  'linear-gradient(160deg, #4a3418, #241708)',
  'linear-gradient(160deg, #6b4a22, #2c1d0a)',
  'linear-gradient(160deg, #8a5a2b, #3a2510)',
  'linear-gradient(160deg, #5a4020, #1a1207)',
]

const RENDER_RANGE = 6 // max slats each side

type Sizing = {
  restWidth: number
  restHeight: number
  activeWidth: number
  activeHeight: number
}

// Card `index`'s signed distance from centre at carousel position `pos`,
// wrapped into (-count/2, count/2]. The wrap discontinuity sits at the seam,
// where opacity is already 0, so the teleport is invisible.
function relOf(index: number, pos: number, count: number): number {
  let rel = (((index - pos) % count) + count) % count
  if (rel > count / 2) rel -= count
  return rel
}

// Horizontal offset (px) from centre for a given signed distance `rel`.
function xForRel(rel: number, s: Sizing, gap: number): number {
  const ar = Math.abs(rel)
  const c1 = s.activeWidth / 2 + gap + s.restWidth / 2
  const pitch = s.restWidth + gap
  const mag = ar <= 1 ? ar * c1 : c1 + (ar - 1) * pitch
  return (rel < 0 ? -1 : 1) * mag
}

// 0 at centre (fully active size) → 1 once a full slot away (slat size).
function blendForRel(rel: number): number {
  return Math.min(Math.abs(rel), 1)
}

/**
 * One card. Every visual property derives from the shared `pos` MotionValue via
 * useTransform, so the rAF driver updates positions without React re-renders.
 * Size tracks position, so a card grows while it slides in and shrinks as it
 * slides out — perfectly synced.
 */
function Card({
  item,
  index,
  pos,
  count,
  R,
  sizing,
  gap,
  radius,
  gradient,
  onSelect,
}: {
  item: CoverflowImage | undefined
  index: number
  pos: MotionValue<number>
  count: number
  R: number
  sizing: Sizing
  gap: number
  radius: number
  gradient: string
  onSelect: ((index: number) => void) | undefined
}) {
  const src = item?.srcUrl ?? ''

  const x = useTransform(pos, (p: number) => xForRel(relOf(index, p, count), sizing, gap))
  const opacity = useTransform(pos, (p: number) => {
    const ar = Math.abs(relOf(index, p, count))
    return ar <= R ? 1 : ar >= R + 1 ? 0 : 1 - (ar - R)
  })
  const zIndex = useTransform(pos, (p: number) =>
    Math.round(1000 - Math.abs(relOf(index, p, count)) * 100),
  )
  const width = useTransform(pos, (p: number) => {
    const a = blendForRel(relOf(index, p, count))
    return sizing.activeWidth + (sizing.restWidth - sizing.activeWidth) * a
  })
  const height = useTransform(pos, (p: number) => {
    const a = blendForRel(relOf(index, p, count))
    return sizing.activeHeight + (sizing.restHeight - sizing.activeHeight) * a
  })
  const borderRadius = useTransform(pos, (p: number) => {
    const a = blendForRel(relOf(index, p, count))
    const w = sizing.activeWidth + (sizing.restWidth - sizing.activeWidth) * a
    const h = sizing.activeHeight + (sizing.restHeight - sizing.activeHeight) * a
    return (Math.max(0, Math.min(20, radius)) / 20) * (Math.min(w, h) / 2)
  })
  const boxShadow = useTransform(pos, (p: number) =>
    Math.abs(relOf(index, p, count)) < 0.5
      ? '0 24px 70px rgba(0,0,0,0.55), inset 0 0 0 1px rgba(255,255,255,0.06)'
      : '0 14px 40px rgba(0,0,0,0.45), inset 0 0 0 1px rgba(255,255,255,0.05)',
  )

  return (
    <motion.div
      onClick={onSelect ? () => onSelect(index) : undefined}
      style={{
        position: 'absolute',
        left: '50%',
        top: '50%',
        x,
        zIndex,
        opacity,
        cursor: onSelect ? 'pointer' : 'default',
      }}
    >
      <motion.div
        style={{
          x: '-50%',
          y: '-50%',
          width,
          height,
          borderRadius,
          overflow: 'hidden',
          background: gradient,
          boxShadow,
        }}
      >
        {src ? (
          <img
            src={src}
            alt={item?.alt || ''}
            loading={index < 4 ? 'eager' : 'lazy'}
            draggable={false}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              display: 'block',
              pointerEvents: 'none',
              userSelect: 'none',
            }}
          />
        ) : null}
      </motion.div>
    </motion.div>
  )
}

function ArrowButton({
  side,
  onClick,
  color,
  background,
  size,
  position,
}: {
  side: 'left' | 'right'
  onClick: () => void
  color: string
  background: string
  size: number
  position: number
}) {
  const isLeft = side === 'left'
  // 100% → flush to the boundary; 0% → both meet in the middle.
  const p = Math.max(0, Math.min(100, position))
  const inset = `calc((50% - ${size}px) * ${(100 - p) / 100})`
  return (
    <button
      type="button"
      aria-label={isLeft ? 'Предишна снимка' : 'Следваща снимка'}
      onPointerDown={(e) => e.stopPropagation()}
      onClick={(e) => {
        e.stopPropagation()
        onClick()
      }}
      style={{
        position: 'absolute',
        top: '50%',
        [isLeft ? 'left' : 'right']: inset,
        transform: 'translateY(-50%)',
        width: size,
        height: size,
        borderRadius: '50%',
        border: 'none',
        background,
        color,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        padding: 0,
        zIndex: 2000,
        boxShadow: '0 6px 18px rgba(0,0,0,0.35)',
        WebkitTapHighlightColor: 'transparent',
      }}
    >
      <svg
        width={size * 0.4}
        height={size * 0.4}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={2.2}
        strokeLinecap="round"
        strokeLinejoin="round"
        style={{ pointerEvents: 'none' }}
      >
        {isLeft ? <polyline points="15 18 9 12 15 6" /> : <polyline points="9 18 15 12 9 6" />}
      </svg>
    </button>
  )
}

const DEFAULTS = {
  activeWidth: 600,
  activeHeight: 400,
  restWidth: 200,
  restHeight: 270,
  gap: 30,
  radius: 2,
  showArrows: true,
  arrowColor: '#1a1207',
  arrowBackground: '#f5ede1',
  arrowSize: 56,
  arrowPosition: 95,
  autoplay: false,
  autoplayDirection: 'rightToLeft' as const,
  transition: { duration: 0.3, delay: 1 },
}

/** The layout above is authored for a 1000px stage; scale it below that. */
const DESIGN_WIDTH = 1000

export default function CoverflowCarousel(props: Props) {
  const merged = { ...DEFAULTS, ...props }
  const {
    images: rawImages,
    gap,
    radius,
    showArrows,
    arrowColor,
    arrowBackground,
    arrowPosition,
    autoplay,
    autoplayDirection,
    transition: transitionProp,
    onActivate,
    style,
  } = merged

  const prefersReducedMotion = useReducedMotion()

  const images = useMemo(() => (Array.isArray(rawImages) ? rawImages : []), [rawImages])
  const count = Math.max(1, images.length)

  // Scale the fixed design sizes down to fit narrow viewports.
  const stageRef = useRef<HTMLDivElement>(null)
  const [scale, setScale] = useState(1)
  useLayoutEffect(() => {
    const el = stageRef.current
    if (!el) return
    const measure = () => {
      const w = el.clientWidth
      if (w > 0) setScale(Math.min(1, Math.max(0.42, w / DESIGN_WIDTH)))
    }
    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  const sizing: Sizing = useMemo(
    () => ({
      activeWidth: merged.activeWidth * scale,
      activeHeight: merged.activeHeight * scale,
      restWidth: merged.restWidth * scale,
      restHeight: merged.restHeight * scale,
    }),
    [merged.activeWidth, merged.activeHeight, merged.restWidth, merged.restHeight, scale],
  )
  const scaledGap = gap * scale
  const arrowSize = Math.max(38, merged.arrowSize * scale)

  const moveDur = typeof transitionProp?.duration === 'number' ? transitionProp.duration : 0.5
  const dwell = typeof transitionProp?.delay === 'number' ? Math.max(0, transitionProp.delay) : 1.2

  // Keep the loop seam out of the visible window.
  const R = Math.max(1, Math.min(RENDER_RANGE, Math.floor(count / 2) - 1))

  // ---- Single rAF driver -------------------------------------------------
  const pos = useMotionValue(0)
  const targetRef = useRef(0)
  const rafRef = useRef<number | null>(null)
  const lastTRef = useRef<number | null>(null)
  const autoplayingRef = useRef(false)
  const dirRef = useRef(1)
  const dwellAccRef = useRef(0)
  const moveDurRef = useRef(moveDur)
  moveDurRef.current = moveDur
  const dwellRef = useRef(dwell)
  dwellRef.current = dwell
  const reducedRef = useRef(prefersReducedMotion)
  reducedRef.current = prefersReducedMotion

  const tick = useCallback(
    (t: number) => {
      const last = lastTRef.current ?? t
      // Clamp dt so a long pause (backgrounded tab) can't produce a jump.
      const dt = Math.min((t - last) / 1000, 1 / 30)
      lastTRef.current = t

      const cur = pos.get()
      const diff = targetRef.current - cur
      const dur = Math.max(0.08, moveDurRef.current)
      const step = (1 / dur) * dt
      const arriving = reducedRef.current || Math.abs(diff) <= step

      if (arriving) {
        pos.set(targetRef.current)
        if (autoplayingRef.current) {
          dwellAccRef.current += dt
          if (dwellAccRef.current >= Math.max(0, dwellRef.current)) {
            dwellAccRef.current = 0
            targetRef.current += dirRef.current
          }
          rafRef.current = requestAnimationFrame(tick)
          return
        }
        // Idle and settled → stop (no per-frame layout).
        rafRef.current = null
        lastTRef.current = null
        return
      }

      pos.set(cur + Math.sign(diff) * step)
      rafRef.current = requestAnimationFrame(tick)
    },
    [pos],
  )

  const ensureRunning = useCallback(() => {
    if (rafRef.current == null) {
      lastTRef.current = null
      rafRef.current = requestAnimationFrame(tick)
    }
  }, [tick])

  // Nav bumps the TARGET, so rapid clicks accumulate and chase the farthest one.
  const goNext = useCallback(() => {
    targetRef.current += 1
    ensureRunning()
  }, [ensureRunning])
  const goPrev = useCallback(() => {
    targetRef.current -= 1
    ensureRunning()
  }, [ensureRunning])
  const goTo = useCallback(
    (index: number) => {
      const cur = targetRef.current
      let d = index - cur
      d = ((d % count) + count) % count
      if (d > count / 2) d -= count
      targetRef.current = cur + d
      ensureRunning()
    },
    [ensureRunning, count],
  )

  // A tap on an off-centre slat brings it in; a tap on the card already at
  // centre opens it full size. Reading pos directly keeps the active index
  // current without holding it in React state.
  const handleCardTap = useCallback(
    (index: number) => {
      const active = ((Math.round(pos.get()) % count) + count) % count
      if (index === active && onActivate) onActivate(index)
      else goTo(index)
    },
    [pos, count, onActivate, goTo],
  )

  useEffect(() => {
    return () => {
      if (rafRef.current != null) cancelAnimationFrame(rafRef.current)
      rafRef.current = null
    }
  }, [])

  // Autoplay pacing lives inside the rAF, so hiding the tab pauses it and it
  // resumes seamlessly — no setTimeout drift, no catch-up rush.
  useEffect(() => {
    const on = autoplay && count > 1
    autoplayingRef.current = on
    if (on) {
      dirRef.current = autoplayDirection === 'leftToRight' ? -1 : 1
      dwellAccRef.current = 0
      ensureRunning()
    }
    return () => {
      autoplayingRef.current = false
    }
  }, [autoplay, autoplayDirection, count, ensureRunning])

  // Arrow keys, while the stage is hovered or focused.
  const isHoveredRef = useRef(false)
  useEffect(() => {
    if (autoplay) return
    const onKey = (e: KeyboardEvent) => {
      if (!isHoveredRef.current) return
      if (e.key === 'ArrowLeft') {
        e.preventDefault()
        goPrev()
      } else if (e.key === 'ArrowRight') {
        e.preventDefault()
        goNext()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [autoplay, goPrev, goNext])

  const containerStyle: React.CSSProperties = {
    ...style,
    position: 'relative',
    width: '100%',
    height: '100%',
    minWidth: 280,
    overflow: 'hidden',
    userSelect: 'none',
    touchAction: 'pan-y',
    outline: 'none',
  }

  const selectable = !autoplay

  return (
    <div
      ref={stageRef}
      tabIndex={0}
      role="region"
      aria-roledescription="карусел"
      aria-label="Галерия"
      onMouseEnter={() => {
        isHoveredRef.current = true
      }}
      onMouseLeave={() => {
        isHoveredRef.current = false
      }}
      onFocus={() => {
        isHoveredRef.current = true
      }}
      onBlur={() => {
        isHoveredRef.current = false
      }}
      style={containerStyle}
    >
      <div
        style={{
          position: 'absolute',
          inset: 0,
          overflow: 'hidden',
          // Contain card z-indexes so the arrows (siblings) stay on top.
          isolation: 'isolate',
          zIndex: 0,
        }}
      >
        {images.map((img, i) => (
          <Card
            key={img.srcUrl ?? i}
            item={img}
            index={i}
            pos={pos}
            count={count}
            R={R}
            sizing={sizing}
            gap={scaledGap}
            radius={radius}
            gradient={GRADIENT_FALLBACKS[i % GRADIENT_FALLBACKS.length]}
            onSelect={selectable ? handleCardTap : undefined}
          />
        ))}
      </div>

      {showArrows && count > 1 && (
        <>
          <ArrowButton
            side="left"
            onClick={goPrev}
            color={arrowColor}
            background={arrowBackground}
            size={arrowSize}
            position={arrowPosition}
          />
          <ArrowButton
            side="right"
            onClick={goNext}
            color={arrowColor}
            background={arrowBackground}
            size={arrowSize}
            position={arrowPosition}
          />
        </>
      )}
    </div>
  )
}
