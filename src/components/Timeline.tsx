import type { EventData } from '../types'
import { getTimelinePosition, getMonthLabels, formatDate } from '../lib/dateUtils'
import { TimelineMarker } from './TimelineMarker'
import { useMemo } from 'react'

interface Props {
  events: EventData[]
  selectedIndex: number
  onSelect: (index: number) => void
}

export function Timeline({ events, selectedIndex, onSelect }: Props) {
  const { startDate, endDate } = useMemo(() => {
    if (events.length === 0) {
      const now = new Date()
      return { startDate: new Date(now.getFullYear() - 1, now.getMonth(), 1), endDate: now }
    }
    const dates = events.map((e) => new Date(e.date + 'T00:00:00'))
    const min = new Date(Math.min(...dates.map((d) => d.getTime())))
    const max = new Date(Math.max(...dates.map((d) => d.getTime())))
    // Add padding: 2 weeks on each side
    const start = new Date(min.getTime() - 14 * 24 * 60 * 60 * 1000)
    const end = new Date(max.getTime() + 14 * 24 * 60 * 60 * 1000)
    return { startDate: start, endDate: end }
  }, [events])

  const monthLabels = useMemo(() => getMonthLabels(startDate, endDate), [startDate, endDate])

  return (
    <div className="fixed bottom-0 left-0 right-0 z-30 px-6 pb-5 pt-3">
      <div className="max-w-4xl mx-auto">
        {/* Month labels */}
        <div className="relative h-5 mb-1">
          {monthLabels.map((m) => (
            <span
              key={m.label + m.position}
              className="absolute -translate-x-1/2 text-[11px] text-gray-400 font-medium select-none"
              style={{ left: `${m.position}%` }}
            >
              {m.label}
            </span>
          ))}
        </div>

        {/* Timeline bar */}
        <div className="relative h-8 flex items-center">
          {/* Background line */}
          <div className="absolute inset-x-0 h-[2px] bg-gray-300/60 rounded-full" />

          {/* Progress line to active marker */}
          {selectedIndex >= 0 && (
            <div
              className="absolute h-[2px] bg-pink-400/50 rounded-full transition-all duration-500"
              style={{
                left: 0,
                width: `${getTimelinePosition(events[selectedIndex].date, startDate, endDate)}%`,
              }}
            />
          )}

          {/* Event markers */}
          {events.map((event, i) => (
            <TimelineMarker
              key={event.folderName}
              position={getTimelinePosition(event.date, startDate, endDate)}
              isActive={i === selectedIndex}
              title={event.title}
              date={formatDate(event.date)}
              onClick={() => onSelect(i)}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
