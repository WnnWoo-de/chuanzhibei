export const weatherFmt = {
  temp: (value) => (value !== null && value !== undefined ? Math.round(value) : '--'),
}

export const formatHour = (iso) => {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return iso
  const now = new Date()
  if (d.getHours() === now.getHours() && d.getDate() === now.getDate()) return '现在'
  return `${d.getHours()}时`
}

export const formatDay = (dateStr) => {
  const d = new Date(dateStr)
  if (Number.isNaN(d.getTime())) return dateStr
  const days = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']
  return days[d.getDay()]
}

export const formatTime = (iso) => {
  if (!iso) return '--'
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return iso
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
}

export const getUvLevel = (uv) => {
  if (!uv) return '低'
  if (uv < 3) return '低'
  if (uv < 6) return '中等'
  if (uv < 8) return '高'
  if (uv < 11) return '极高'
  return '危险'
}

export const getAqiColor = (aqi) => {
  if (aqi <= 50) return '#10b981'
  if (aqi <= 100) return '#eab308'
  if (aqi <= 150) return '#f97316'
  if (aqi <= 200) return '#ef4444'
  if (aqi <= 300) return '#a855f7'
  return '#be123c'
}
