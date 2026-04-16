export function formatDate(dateStr: string): string {
  const date = new Date(dateStr + 'T00:00:00')
  return date.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })
}

export function getTimelinePosition(
  dateStr: string,
  startDate: Date,
  endDate: Date
): number {
  const date = new Date(dateStr + 'T00:00:00')
  const total = endDate.getTime() - startDate.getTime()
  const offset = date.getTime() - startDate.getTime()
  return Math.max(0, Math.min(100, (offset / total) * 100))
}

export function getMonthLabels(startDate: Date, endDate: Date): { label: string; position: number }[] {
  const labels: { label: string; position: number }[] = []
  const current = new Date(startDate)
  current.setDate(1)
  current.setMonth(current.getMonth() + 1)

  while (current < endDate) {
    const total = endDate.getTime() - startDate.getTime()
    const offset = current.getTime() - startDate.getTime()
    const position = (offset / total) * 100

    labels.push({
      label: current.toLocaleDateString('en-US', { month: 'short' }),
      position,
    })

    current.setMonth(current.getMonth() + 1)
  }

  return labels
}
