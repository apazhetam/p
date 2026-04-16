import { AnimatePresence, motion } from 'motion/react'
import type { EventData } from '../types'
import { formatDate } from '../lib/dateUtils'
import { PhotoGallery } from './PhotoGallery'

interface Props {
  event: EventData | null
  onClose?: () => void
}

export function EventCard({ event, onClose }: Props) {
  return (
    <AnimatePresence mode="wait">
      {event && (
        <div key={event.folderName}>
          {/* Polaroids scattered on the map */}
          <div className="fixed inset-0 z-15 pointer-events-none">
            <div className="pointer-events-auto">
              <PhotoGallery media={event.media} eventKey={event.folderName} />
            </div>
          </div>

          {/* Info card */}
          <motion.div
            initial={{ opacity: 0, x: 40, scale: 0.95 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: -40, scale: 0.95 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="fixed top-6 left-1/2 -translate-x-1/2 z-20 w-[320px] rounded-2xl shadow-2xl"
            style={{
              backgroundColor: 'var(--color-card)',
              border: '1px solid var(--color-card-border)',
            }}
          >
            {/* Close button */}
            <button
              onClick={onClose}
              className="absolute top-3 right-3 z-10 p-1.5 rounded-full bg-white/80 hover:bg-white text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
              aria-label="Close"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <div className="p-5 space-y-3">
              {/* Date */}
              <p
                className="text-lg text-gray-500"
                style={{ fontFamily: 'var(--font-handwriting)' }}
              >
                {formatDate(event.date)}
              </p>

              {/* Title */}
              <h2 className="text-lg font-bold text-gray-900 leading-tight -mt-1">
                {event.title}
              </h2>

              {/* City */}
              <div className="flex items-center gap-1.5 text-sm text-gray-400 -mt-1">
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                {event.city}
              </div>

              {/* Description */}
              {event.description && (
                <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-line">
                  {event.description}
                </p>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
