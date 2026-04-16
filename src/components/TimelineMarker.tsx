import { motion } from 'motion/react'

interface Props {
  position: number
  isActive: boolean
  title: string
  date: string
  onClick: () => void
}

export function TimelineMarker({ position, isActive, title, date, onClick }: Props) {
  return (
    <motion.button
      className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 group cursor-pointer z-10"
      style={{ left: `${position}%` }}
      onClick={onClick}
      whileHover={{ scale: 1.3 }}
      whileTap={{ scale: 0.9 }}
      aria-label={`${title} - ${date}`}
    >
      <motion.div
        className="rounded-full border-2 border-white"
        animate={{
          width: isActive ? 14 : 10,
          height: isActive ? 14 : 10,
          backgroundColor: isActive ? 'rgb(236, 72, 153)' : 'rgb(156, 163, 175)',
          boxShadow: isActive
            ? '0 0 0 4px rgba(236, 72, 153, 0.2), 0 1px 3px rgba(0,0,0,0.1)'
            : '0 1px 3px rgba(0,0,0,0.1)',
        }}
        transition={{ type: 'spring', stiffness: 400, damping: 25 }}
      />

      {/* Tooltip */}
      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
        <div className="bg-gray-900 text-white text-xs px-2.5 py-1.5 rounded-lg shadow-lg">
          <div className="font-medium">{title}</div>
          <div className="text-gray-400 text-[10px]">{date}</div>
        </div>
        <div className="w-2 h-2 bg-gray-900 rotate-45 absolute left-1/2 -translate-x-1/2 -bottom-1" />
      </div>
    </motion.button>
  )
}
