import { useRef, useEffect } from 'react'
import { useMap } from '../hooks/useMap'
import type { EventData } from '../types'

interface Props {
  events: EventData[]
  selectedEvent: EventData | null
  onMapReady?: () => void
  onSelectEvent?: (index: number) => void
}

export function MapView({ events, selectedEvent, onMapReady, onSelectEvent }: Props) {
  const containerRef = useRef<HTMLDivElement>(null)
  const { flyToEvent, resetView, mapRef } = useMap(containerRef)
  const hasInitialized = useRef(false)

  // Fit to all events on first load
  useEffect(() => {
    if (hasInitialized.current || events.length === 0) return
    const map = mapRef.current
    if (!map) return

    const onLoad = () => {
      resetView(events, onSelectEvent)
      hasInitialized.current = true
      onMapReady?.()
    }

    if (map.loaded()) {
      onLoad()
    } else {
      map.on('load', onLoad)
      return () => { map.off('load', onLoad) }
    }
  }, [events, resetView, mapRef, onMapReady, onSelectEvent])

  // Fly to selected event, or reset view when deselected
  useEffect(() => {
    if (selectedEvent) {
      flyToEvent(selectedEvent)
    } else if (hasInitialized.current) {
      resetView(events, onSelectEvent)
    }
  }, [selectedEvent, flyToEvent, resetView, events, onSelectEvent])

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 w-full h-full"
    />
  )
}
