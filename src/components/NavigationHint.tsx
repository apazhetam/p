import { motion, AnimatePresence } from 'motion/react'

interface Props {
  show: boolean
  hasPrev: boolean
  hasNext: boolean
  onPrev: () => void
  onNext: () => void
}

export function NavigationHint({ show, hasPrev, hasNext, onPrev, onNext }: Props) {
  return (
    <>
      {/* Arrow buttons (always visible when there are events) */}
      <div className="fixed left-2 md:left-6 bottom-20 md:bottom-auto md:top-1/2 md:-translate-y-1/2 z-20">
        <button
          onClick={onPrev}
          disabled={!hasPrev}
          className="p-2 md:p-3 rounded-full bg-white/80 backdrop-blur-sm shadow-lg border border-gray-200/50 text-gray-600 hover:text-gray-900 hover:bg-white transition-all disabled:opacity-30 disabled:cursor-default cursor-pointer"
          aria-label="Previous event"
        >
          <svg className="w-4 h-4 md:w-5 md:h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
      </div>

      <div className="fixed right-2 md:right-6 bottom-20 md:bottom-auto md:top-1/2 md:-translate-y-1/2 z-20">
        <button
          onClick={onNext}
          disabled={!hasNext}
          className="p-2 md:p-3 rounded-full bg-white/80 backdrop-blur-sm shadow-lg border border-gray-200/50 text-gray-600 hover:text-gray-900 hover:bg-white transition-all disabled:opacity-30 disabled:cursor-default cursor-pointer"
          aria-label="Next event"
        >
          <svg className="w-4 h-4 md:w-5 md:h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      {/* Keyboard hint overlay - fades out after first interaction */}
      <AnimatePresence>
        {show && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            transition={{ duration: 0.3 }}
            className="fixed bottom-20 left-1/2 -translate-x-1/2 z-30"
          >
            <div className="flex items-center gap-2 px-4 py-2 bg-gray-900/80 backdrop-blur-sm text-white text-xs rounded-full shadow-lg">
              <kbd className="px-1.5 py-0.5 bg-white/20 rounded text-[10px] font-mono">&larr;</kbd>
              <kbd className="px-1.5 py-0.5 bg-white/20 rounded text-[10px] font-mono">&rarr;</kbd>
              <span className="text-gray-300 ml-1">to navigate</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
