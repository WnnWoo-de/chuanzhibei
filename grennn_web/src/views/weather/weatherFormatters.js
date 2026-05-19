import { computed } from 'vue'
import { langText } from '@/language'

export const weatherFmt = {
  temp: (value) => (value !== null && value !== undefined ? Math.round(value) : '--'),
}

export const useWeatherFormatters = () => {
  const formatHour = (iso) => {
    const d = new Date(iso)
    if (Number.isNaN(d.getTime())) return iso
    const now = new Date()
    if (d.getHours() === now.getHours() && d.getDate() === now.getDate()) {
      return langText.value.weather.nowLabel
    }
    return `${d.getHours()}${langText.value.weather.hourSuffix}`
  }

  const formatDay = (dateStr) => {
    const d = new Date(dateStr)
    if (Number.isNaN(d.getTime())) return dateStr
    return langText.value.weather.days[d.getDay()]
  }

  const formatTime = (iso) => {
    if (!iso) return '--'
    const d = new Date(iso)
    if (Number.isNaN(d.getTime())) return iso
    return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
  }

  const getUvLevel = (uv) => {
    const w = langText.value.weather
    if (!uv) return w.uvLow
    if (uv < 3) return w.uvLow
    if (uv < 6) return w.uvMedium
    if (uv < 8) return w.uvHigh
    if (uv < 11) return w.uvVeryHigh
    return w.uvDanger
  }

  return { formatHour, formatDay, formatTime, getUvLevel }
}

export const getAqiColor = (aqi) => {
  if (aqi <= 50) return '#10b981'
  if (aqi <= 100) return '#eab308'
  if (aqi <= 150) return '#f97316'
  if (aqi <= 200) return '#ef4444'
  if (aqi <= 300) return '#a855f7'
  return '#be123c'
}
