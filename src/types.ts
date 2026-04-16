export interface MediaItem {
  type: 'photo' | 'video'
  url: string
}

export interface EventData {
  date: string
  title: string
  city: string
  location: { lat: number; lng: number }
  description: string
  photos: string[]
  videos?: string[]
  zoom?: number
  // Resolved at load time
  media: MediaItem[]
  folderName: string
}
