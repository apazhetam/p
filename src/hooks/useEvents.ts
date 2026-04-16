import { useState, useEffect } from 'react'
import type { EventData, MediaItem } from '../types'

const BASE = import.meta.env.BASE_URL

interface RawEvent {
  date: string
  title: string
  city: string
  location: { lat: number; lng: number }
  description: string
  photos: string[]
  videos?: string[]
  zoom?: number
}

export function useEvents(): EventData[] {
  const [events, setEvents] = useState<EventData[]>([])

  useEffect(() => {
    async function load() {
      // Fetch the manifest listing all event folder names
      const manifestRes = await fetch(`${BASE}events/manifest.json`)
      const folders: string[] = await manifestRes.json()

      // Fetch all event.json files in parallel
      const results = await Promise.all(
        folders.map(async (folderName) => {
          try {
            const res = await fetch(`${BASE}events/${folderName}/event.json`)
            if (!res.ok) return null
            const raw: RawEvent = await res.json()

            // Build media URLs (no fetching — just construct the paths)
            const media: MediaItem[] = []

            for (const filename of raw.photos) {
              media.push({
                type: 'photo',
                url: `${BASE}events/${folderName}/${filename}`,
              })
            }

            for (const filename of raw.videos ?? []) {
              media.push({
                type: 'video',
                url: `${BASE}events/${folderName}/${filename}`,
              })
            }

            return {
              ...raw,
              media,
              folderName,
            } as EventData
          } catch {
            return null
          }
        })
      )

      const loaded = results.filter((e): e is EventData => e !== null)
      loaded.sort((a, b) => a.date.localeCompare(b.date))
      setEvents(loaded)
    }

    load()
  }, [])

  return events
}
