import { motion, useDragControls, AnimatePresence } from 'motion/react'
import { useMemo, useState, useCallback, useRef, useEffect } from 'react'
import type { MediaItem } from '../types'

interface Props {
  media: MediaItem[]
  eventKey: string
}

interface ExpandInfo {
  index: number
  rect: DOMRect
}

const TIMELINE_HEIGHT = 110
const TOP_MARGIN = 50
const SIDE_MARGIN = 70
const CARD_SIZE = 350 // rough polaroid size to avoid overlap checks
const CENTER_GAP = 360 // keep the vertical center strip clear for the event card

// Hash-based PRNG — produces well-distributed values from any integer seed
function hash(n: number): number {
  let h = (n ^ 0xDEADBEEF) | 0
  h = Math.imul(h ^ (h >>> 16), 0x45d9f3b)
  h = Math.imul(h ^ (h >>> 13), 0x45d9f3b)
  h = (h ^ (h >>> 16)) >>> 0
  return h / 0xFFFFFFFF
}

function getLayout(count: number): { x: number; y: number; rotation: number }[] {
  const vw = window.innerWidth
  const vh = window.innerHeight
  const maxY = vh - TIMELINE_HEIGHT - CARD_SIZE
  const maxX = vw - SIDE_MARGIN - CARD_SIZE
  const centerL = (vw - CENTER_GAP) / 2
  const centerR = (vw + CENTER_GAP) / 2

  const result: { x: number; y: number; rotation: number }[] = []

  for (let i = 0; i < count; i++) {
    let x: number
    let y: number
    let attempts = 0

    do {
      const seed = i * 1000 + attempts
      const rx = hash(seed)
      const ry = hash(seed + 333)
      const rSide = hash(seed + 777)

      if (rSide > 0.5) {
        x = SIDE_MARGIN + rx * Math.max(0, centerL - SIDE_MARGIN)
      } else {
        x = centerR + rx * Math.max(0, maxX - centerR)
      }
      y = TOP_MARGIN + ry * Math.max(0, maxY - TOP_MARGIN)
      attempts++
    } while (
      attempts < 40 &&
      result.some(
        (p) => Math.abs(p.x - x) < CARD_SIZE * 0.45 && Math.abs(p.y - y) < CARD_SIZE * 0.45
      )
    )

    const rotation = hash(i * 7919 + 131) * 14 - 7

    result.push({ x, y, rotation })
  }

  return result
}

const DEFAULT_WIDTH_LANDSCAPE = 320
const DEFAULT_WIDTH_PORTRAIT = 200
const MIN_WIDTH = 100
const MAX_WIDTH = 500

function Polaroid({
  item,
  x,
  y,
  rotation,
  index,
  onBringToFront,
  onExpand,
  zIndex,
}: {
  item: MediaItem
  x: number
  y: number
  rotation: number
  index: number
  onBringToFront: (index: number) => void
  onExpand: (index: number, rect: DOMRect) => void
  zIndex: number
}) {
  const [width, setWidth] = useState<number | null>(null)
  const startData = useRef({ mouseX: 0, mouseY: 0, startWidth: 0 })
  const dragControls = useDragControls()
  const cardRef = useRef<HTMLDivElement>(null)

  // Detect orientation from the media's natural dimensions
  const onMediaLoad = useCallback((naturalW: number, naturalH: number) => {
    if (width !== null) return
    const portrait = naturalH > naturalW
    setWidth(portrait ? DEFAULT_WIDTH_PORTRAIT : DEFAULT_WIDTH_LANDSCAPE)
  }, [width])

  const onResizeStart = useCallback(
    (e: React.PointerEvent) => {
      e.stopPropagation()
      e.preventDefault()
      onBringToFront(index)
      startData.current = { mouseX: e.clientX, mouseY: e.clientY, startWidth: width ?? DEFAULT_WIDTH_LANDSCAPE }

      const onMove = (ev: PointerEvent) => {
        const dx = ev.clientX - startData.current.mouseX
        const dy = ev.clientY - startData.current.mouseY
        const delta = (dx + dy) / 2
        const newWidth = Math.max(MIN_WIDTH, Math.min(MAX_WIDTH, startData.current.startWidth + delta))
        setWidth(newWidth)
      }

      const onUp = () => {
        window.removeEventListener('pointermove', onMove)
        window.removeEventListener('pointerup', onUp)
      }

      window.addEventListener('pointermove', onMove)
      window.addEventListener('pointerup', onUp)
    },
    [index, onBringToFront, width]
  )

  const handleDoubleClick = useCallback(() => {
    if (cardRef.current) {
      onExpand(index, cardRef.current.getBoundingClientRect())
    }
  }, [index, onExpand])

  const mediaReady = width !== null
  const displayWidth = width ?? DEFAULT_WIDTH_LANDSCAPE
  const bottomPad = Math.max(32, displayWidth * 0.16)

  return (
    <motion.div
      drag
      dragControls={dragControls}
      dragListener={false}
      dragMomentum={false}
      dragElastic={0.1}
      whileDrag={{ scale: 1.05, boxShadow: '0 20px 40px rgba(0,0,0,0.2)' }}
      initial={false}
      animate={{
        opacity: mediaReady ? 1 : 0,
        scale: mediaReady ? 1 : 0.8,
        x, y, rotate: rotation,
      }}
      transition={{ duration: 0.5, delay: mediaReady ? 0.1 + index * 0.08 : 0, ease: [0.22, 1, 0.36, 1] }}
      className="absolute cursor-grab active:cursor-grabbing select-none"
      style={{ zIndex, touchAction: 'none', width: displayWidth + 16 }}
    >
      <div
        ref={cardRef}
        className="bg-white rounded-sm shadow-lg relative"
        style={{ padding: `8px 8px ${bottomPad}px 8px` }}
        onPointerDown={(e) => {
          onBringToFront(index)
          dragControls.start(e)
        }}
        onDoubleClick={handleDoubleClick}
      >
        {item.type === 'video' ? (
          <div className="relative" style={{ width: displayWidth }}>
            <video
              src={item.url}
              style={{ width: displayWidth }}
              className="rounded-[2px] pointer-events-none"
              preload="metadata"
              muted
              playsInline
              onLoadedMetadata={(e) => {
                const v = e.currentTarget
                onMediaLoad(v.videoWidth, v.videoHeight)
              }}
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-12 h-12 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center">
                <svg className="w-6 h-6 text-white ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z" />
                </svg>
              </div>
            </div>
          </div>
        ) : (
          <img
            src={item.url}
            alt=""
            style={{ width: displayWidth, display: 'block' }}
            className="rounded-[2px]"
            loading="lazy"
            draggable={false}
            onLoad={(e) => {
              const img = e.currentTarget
              onMediaLoad(img.naturalWidth, img.naturalHeight)
            }}
          />
        )}

        {/* Resize handle */}
        <div
          onPointerDown={onResizeStart}
          className="absolute bottom-1 right-1 w-6 h-6 cursor-nwse-resize flex items-center justify-center opacity-0 hover:opacity-60 transition-opacity"
          style={{ zIndex: 3 }}
        >
          <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
            <path d="M9 1L1 9M9 5L5 9M9 9L9 9" stroke="#999" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </div>
      </div>
    </motion.div>
  )
}

function ExpandedView({ item, onClose, sourceRect }: { item: MediaItem; onClose: () => void; sourceRect: DOMRect }) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose])

  const [finalRect, setFinalRect] = useState<{ x: number; y: number; w: number; h: number } | null>(null)
  const contentRef = useRef<HTMLDivElement>(null)

  const pad = 10
  const bottomFrame = 40

  // After mount, measure the actual content to get the real final size
  useEffect(() => {
    // Small delay to let the image/video render at natural size
    const timer = setTimeout(() => {
      if (contentRef.current) {
        const el = contentRef.current
        const w = el.offsetWidth
        const h = el.offsetHeight
        const x = (window.innerWidth - w) / 2
        const y = (window.innerHeight - h) / 2
        setFinalRect({ x, y, w, h })
      }
    }, 20)
    return () => clearTimeout(timer)
  }, [])

  // Fallback: center with generous size until measured
  const vw = window.innerWidth
  const vh = window.innerHeight
  const fallbackW = Math.min(vw * 0.7, 600)
  const fallbackH = Math.min(vh * 0.8, 700)
  const target = finalRect ?? {
    x: (vw - fallbackW) / 2,
    y: (vh - fallbackH) / 2,
    w: fallbackW,
    h: fallbackH,
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4 }}
      className="fixed inset-0 z-[100] bg-black/70 backdrop-blur-sm"
      onClick={onClose}
    >
      <button
        onClick={onClose}
        className="absolute top-5 right-5 z-10 p-2 rounded-full bg-white/20 hover:bg-white/40 text-white transition-colors cursor-pointer"
        aria-label="Close"
      >
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>

      {/* Hidden measurer to get natural content size */}
      <div
        ref={contentRef}
        className="fixed invisible pointer-events-none bg-white rounded-sm"
        style={{ padding: `${pad}px ${pad}px ${bottomFrame}px ${pad}px` }}
      >
        {item.type === 'video' ? (
          <video
            src={item.url}
            className="max-w-[85vw] max-h-[75vh] rounded-[2px]"
            preload="metadata"
          />
        ) : (
          <img src={item.url} alt="" className="max-w-[85vw] max-h-[75vh] rounded-[2px]" />
        )}
      </div>

      <motion.div
        className="absolute bg-white rounded-sm shadow-2xl overflow-hidden"
        style={{ padding: `${pad}px ${pad}px ${bottomFrame}px ${pad}px` }}
        initial={{
          left: sourceRect.left,
          top: sourceRect.top,
          width: sourceRect.width,
          height: sourceRect.height,
        }}
        animate={{
          left: target.x,
          top: target.y,
          width: target.w,
          height: target.h,
        }}
        exit={{
          left: sourceRect.left,
          top: sourceRect.top,
          width: sourceRect.width,
          height: sourceRect.height,
        }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        onClick={(e) => e.stopPropagation()}
      >
        {item.type === 'video' ? (
          <video
            src={item.url}
            className="w-full h-full rounded-[2px] object-contain"
            controls
            autoPlay
            playsInline
          />
        ) : (
          <img
            src={item.url}
            alt=""
            className="w-full h-full rounded-[2px] object-contain"
          />
        )}
      </motion.div>
    </motion.div>
  )
}

export function PhotoGallery({ media, eventKey }: Props) {
  const layout = useMemo(() => getLayout(media.length), [media.length])
  const [zOrder, setZOrder] = useState<number[]>(() => media.map((_, i) => i))
  const [expanded, setExpanded] = useState<ExpandInfo | null>(null)

  if (media.length === 0) return null

  const bringToFront = (index: number) => {
    setZOrder((prev) => {
      const max = Math.max(...prev)
      if (prev[index] === max) return prev
      const next = [...prev]
      next[index] = max + 1
      return next
    })
  }

  const handleExpand = (index: number, rect: DOMRect) => {
    setExpanded({ index, rect })
  }

  return (
    <>
      {media.map((item, i) => (
        <Polaroid
          key={eventKey + '-polaroid-' + i}
          item={item}
          x={layout[i]?.x ?? 80}
          y={layout[i]?.y ?? 80 + i * 200}
          rotation={layout[i]?.rotation ?? 0}
          index={i}
          onBringToFront={bringToFront}
          onExpand={handleExpand}
          zIndex={zOrder[i] ?? i}
        />
      ))}

      <AnimatePresence>
        {expanded !== null && (
          <ExpandedView
            key="expanded"
            item={media[expanded.index]}
            sourceRect={expanded.rect}
            onClose={() => setExpanded(null)}
          />
        )}
      </AnimatePresence>
    </>
  )
}
