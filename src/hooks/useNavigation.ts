import { useState, useEffect, useCallback } from 'react'

export function useNavigation(totalEvents: number) {
  const [selectedIndex, setSelectedIndex] = useState(-1)
  const [hasInteracted, setHasInteracted] = useState(false)

  const goNext = useCallback(() => {
    if (totalEvents === 0) return
    setHasInteracted(true)
    setSelectedIndex((i) => (i < totalEvents - 1 ? i + 1 : i))
  }, [totalEvents])

  const goPrev = useCallback(() => {
    if (totalEvents === 0) return
    setHasInteracted(true)
    setSelectedIndex((i) => (i > 0 ? i - 1 : i))
  }, [totalEvents])

  const goTo = useCallback((index: number) => {
    setHasInteracted(true)
    setSelectedIndex(index)
  }, [])

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
        e.preventDefault()
        goNext()
      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        e.preventDefault()
        goPrev()
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [goNext, goPrev])

  return { selectedIndex, setSelectedIndex, goNext, goPrev, goTo, hasInteracted }
}
