import { useMemo } from 'react'
import type { EventData, MediaItem } from '../types'

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

const eventModules = import.meta.glob<RawEvent>('/events/*/event.json', {
  eager: true,
  import: 'default',
})

const imageModules = import.meta.glob<string>('/events/*/*.{jpg,jpeg,png,webp,JPG,JPEG,PNG,WEBP}', {
  eager: true,
  query: '?url',
  import: 'default',
})

const videoModules = import.meta.glob<string>('/events/*/*.{mp4,webm,mov,MP4,WEBM,MOV}', {
  eager: true,
  query: '?url',
  import: 'default',
})

export function useEvents(): EventData[] {
  return useMemo(() => {
    const events: EventData[] = []

    for (const [path, raw] of Object.entries(eventModules)) {
      const folderMatch = path.match(/\/events\/([^/]+)\/event\.json$/)
      if (!folderMatch) continue
      const folderName = folderMatch[1]

      const media: MediaItem[] = []

      // Resolve photos
      for (const filename of raw.photos) {
        const imagePath = `/events/${folderName}/${filename}`
        const url = imageModules[imagePath]
        if (url) media.push({ type: 'photo', url })
      }

      // Resolve videos
      for (const filename of raw.videos ?? []) {
        const videoPath = `/events/${folderName}/${filename}`
        const url = videoModules[videoPath]
        if (url) media.push({ type: 'video', url })
      }

      events.push({
        ...raw,
        media,
        folderName,
      })
    }

    events.sort((a, b) => a.date.localeCompare(b.date))
    return events
  }, [])
}
