import type maplibregl from 'maplibre-gl'

export const MAP_STYLE = 'https://basemaps.cartocdn.com/gl/positron-nolabels-gl-style/style.json'

export function muteMapStyle(map: maplibregl.Map) {
  const style = map.getStyle()
  if (!style?.layers) return

  for (const layer of style.layers) {
    // Hide any remaining text/symbol layers
    if (layer.type === 'symbol') {
      map.setLayoutProperty(layer.id, 'visibility', 'none')
    }
    // Mute roads to very light gray
    if (layer.type === 'line' && layer.id.includes('road')) {
      map.setPaintProperty(layer.id, 'line-color', '#e8e8e8')
    }
    // Soften boundaries
    if (layer.type === 'line' && layer.id.includes('boundary')) {
      map.setPaintProperty(layer.id, 'line-color', '#e0e0e0')
      map.setPaintProperty(layer.id, 'line-opacity', 0.4)
    }
  }

  // Tint water to soft blue-gray
  for (const layer of style.layers) {
    if (layer.type === 'fill' && layer.id.includes('water')) {
      map.setPaintProperty(layer.id, 'fill-color', '#dce6f0')
    }
  }
}
