import { useState, useCallback, useEffect } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { useEvents } from './hooks/useEvents'
import { useNavigation } from './hooks/useNavigation'
import { MapView } from './components/MapView'
import { Timeline } from './components/Timeline'
import { EventCard } from './components/EventCard'
import { NavigationHint } from './components/NavigationHint'

export default function App() {
  const events = useEvents()
  const { selectedIndex, setSelectedIndex, goNext, goPrev, goTo, hasInteracted } = useNavigation(events.length)
  const [mapReady, setMapReady] = useState(false)
  const [showTitle, setShowTitle] = useState(true)
  const [appReady, setAppReady] = useState(false)

  const selectedEvent = selectedIndex >= 0 ? events[selectedIndex] : null

  const handleMapReady = useCallback(() => {
    setMapReady(true)
  }, [])

  // Opening sequence: show title, then auto-select first event
  useEffect(() => {
    if (!mapReady || events.length === 0) return

    // Show title for 2.5 seconds, then select first event
    const titleTimer = setTimeout(() => {
      setShowTitle(false)
    }, 2500)

    const eventTimer = setTimeout(() => {
      setSelectedIndex(0)
      setAppReady(true)
    }, 3200)

    return () => {
      clearTimeout(titleTimer)
      clearTimeout(eventTimer)
    }
  }, [mapReady, events.length, setSelectedIndex])

  return (
    <div className="relative w-full h-full bg-gray-50">
      {/* Map layer */}
      <MapView
        events={events}
        selectedEvent={selectedEvent}
        onMapReady={handleMapReady}
        onSelectEvent={goTo}
      />

      {/* Opening title */}
      <AnimatePresence>
        {showTitle && mapReady && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            className="fixed inset-0 z-40 flex items-center justify-center pointer-events-none"
          >
            <h1
              className="text-5xl md:text-6xl text-gray-800"
              style={{ fontFamily: 'var(--font-handwriting)' }}
            >
              22 &lt;3
            </h1>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Event card */}
      <EventCard event={selectedEvent} onClose={() => setSelectedIndex(-1)} />

      {/* Navigation arrows */}
      {appReady && events.length > 0 && (
        <NavigationHint
          show={!hasInteracted && appReady}
          hasPrev={selectedIndex > 0}
          hasNext={selectedIndex < events.length - 1}
          onPrev={goPrev}
          onNext={goNext}
        />
      )}

      {/* Timeline */}
      {appReady && (
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        >
          <Timeline
            events={events}
            selectedIndex={selectedIndex}
            onSelect={goTo}
          />
        </motion.div>
      )}
    </div>
  )
}
