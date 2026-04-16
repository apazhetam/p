import { useEffect, useRef, useCallback } from 'react'
import maplibregl from 'maplibre-gl'
import { MAP_STYLE, muteMapStyle } from '../lib/mapStyle'
import type { EventData } from '../types'

const HEART_SVG = `<svg viewBox="0 0 24 24" width="26" height="26" style="filter: drop-shadow(0 2px 4px rgba(0,0,0,0.25))"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" fill="rgb(236, 72, 153)" stroke="white" stroke-width="2.5" stroke-linejoin="round"/></svg>`

function createHeartElement() {
  const el = document.createElement('div')
  el.innerHTML = HEART_SVG
  el.style.cssText = 'display: flex; align-items: center; justify-content: center; cursor: pointer;'
  return el
}

export function useMap(containerRef: React.RefObject<HTMLDivElement | null>) {
  const mapRef = useRef<maplibregl.Map | null>(null)
  const activeMarkerRef = useRef<maplibregl.Marker | null>(null)
  const allMarkersRef = useRef<maplibregl.Marker[]>([])

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return

    const map = new maplibregl.Map({
      container: containerRef.current,
      style: MAP_STYLE,
      center: [0, 20],
      zoom: 1.8,
      attributionControl: false,
      dragRotate: false,
      pitchWithRotate: false,
    })

    map.on('style.load', () => {
      muteMapStyle(map)
    })

    mapRef.current = map

    return () => {
      map.remove()
      mapRef.current = null
    }
  }, [containerRef])

  const clearAllMarkers = useCallback(() => {
    for (const m of allMarkersRef.current) {
      m.remove()
    }
    allMarkersRef.current = []
  }, [])

  const showAllMarkers = useCallback((events: EventData[], onSelect?: (index: number) => void) => {
    const map = mapRef.current
    if (!map) return

    clearAllMarkers()

    events.forEach((event, i) => {
      const el = createHeartElement()
      if (onSelect) {
        el.addEventListener('click', () => onSelect(i))
      }
      const marker = new maplibregl.Marker({ element: el })
        .setLngLat([event.location.lng, event.location.lat])
        .addTo(map)
      allMarkersRef.current.push(marker)
    })
  }, [clearAllMarkers])

  const flyToEvent = useCallback((event: EventData) => {
    const map = mapRef.current
    if (!map) return

    // Clear overview markers
    clearAllMarkers()

    // Remove previous active marker
    if (activeMarkerRef.current) {
      activeMarkerRef.current.remove()
      activeMarkerRef.current = null
    }

    map.flyTo({
      center: [event.location.lng, event.location.lat],
      zoom: event.zoom ?? 11,
      speed: 0.8,
      curve: 1.5,
      essential: true,
    })

    // Add a single heart marker for the active event
    const el = createHeartElement()
    const marker = new maplibregl.Marker({ element: el })
      .setLngLat([event.location.lng, event.location.lat])
      .addTo(map)

    activeMarkerRef.current = marker
  }, [clearAllMarkers])

  const resetView = useCallback((events: EventData[], onSelect?: (index: number) => void) => {
    const map = mapRef.current
    if (!map || events.length === 0) return

    // Remove active marker
    if (activeMarkerRef.current) {
      activeMarkerRef.current.remove()
      activeMarkerRef.current = null
    }

    // Show all markers
    showAllMarkers(events, onSelect)

    if (events.length === 1) {
      map.flyTo({
        center: [events[0].location.lng, events[0].location.lat],
        zoom: 3,
        speed: 0.5,
      })
      return
    }

    const bounds = new maplibregl.LngLatBounds()
    for (const event of events) {
      bounds.extend([event.location.lng, event.location.lat])
    }
    map.fitBounds(bounds, { padding: 100, maxZoom: 5, duration: 1500 })
  }, [showAllMarkers])

  return { flyToEvent, resetView, mapRef }
}
