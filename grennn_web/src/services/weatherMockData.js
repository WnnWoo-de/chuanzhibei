const WEATHER_TEXT_PRESETS = [
  { text: '晴', icon: '100' },
  { text: '多云', icon: '101' },
  { text: '阴', icon: '104' },
  { text: '小雨', icon: '305' },
  { text: '阵雨', icon: '306' },
]

const WIND_DIRECTIONS = ['北风', '东北风', '东风', '东南风', '南风', '西南风', '西风', '西北风']
const POLLUTANT_KEYS = ['pm2p5', 'pm10', 'o3', 'no2', 'so2', 'co']
const DAY_LABELS = ['今天', '明天', '后天']

const pad = (value) => String(value).padStart(2, '0')

const toIsoLocal = (date) => {
  const year = date.getFullYear()
  const month = pad(date.getMonth() + 1)
  const day = pad(date.getDate())
  const hour = pad(date.getHours())
  const minute = pad(date.getMinutes())
  return `${year}-${month}-${day}T${hour}:${minute}:00+08:00`
}

const toDateOnly = (date) => {
  const year = date.getFullYear()
  const month = pad(date.getMonth() + 1)
  const day = pad(date.getDate())
  return `${year}-${month}-${day}`
}

const clamp = (value, min, max) => Math.min(max, Math.max(min, value))

const getSeed = (city) => {
  const normalized = String(city || '北京').trim() || '北京'
  return [...normalized].reduce((sum, char, index) => sum + char.charCodeAt(0) * (index + 1), 0)
}

const pickWeather = (seed, offset = 0) => WEATHER_TEXT_PRESETS[(seed + offset) % WEATHER_TEXT_PRESETS.length]

const getAirGrade = (aqi) => {
  if (aqi <= 50) return { category: '优', level: '优', advice: '空气清新，适合跑步、散步等户外活动。' }
  if (aqi <= 100) return { category: '良', level: '良', advice: '空气质量稳定，敏感人群可适度减少高强度户外运动。' }
  if (aqi <= 150) return { category: '轻度污染', level: '轻度污染', advice: '建议缩短长时间户外停留，外出时可视情况佩戴口罩。' }
  if (aqi <= 200) return { category: '中度污染', level: '中度污染', advice: '儿童与老人尽量减少外出，保持室内通风节奏平衡。' }
  return { category: '重度污染', level: '重度污染', advice: '建议减少外出并关闭门窗，注意防护。' }
}

const buildHourly = (seed, baseTemp) => {
  const now = new Date()
  now.setMinutes(0, 0, 0)

  return Array.from({ length: 24 }, (_, index) => {
    const time = new Date(now)
    time.setHours(now.getHours() + index)

    const phase = ((index + seed) % 24) / 24
    const temp = Math.round(baseTemp + Math.sin(phase * Math.PI * 2) * 4 + ((seed + index) % 3) - 1)
    const weather = pickWeather(seed, index)

    return {
      time: toIsoLocal(time),
      temp,
      icon: weather.icon,
      precipProb: clamp((seed + index * 7) % 100, 5, 95),
      windScale: String(2 + ((seed + index) % 4)),
    }
  })
}

const buildForecast = (seed, baseTemp) => {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  return Array.from({ length: 10 }, (_, index) => {
    const date = new Date(today)
    date.setDate(today.getDate() + index)

    const min = Math.round(baseTemp - 5 + ((seed + index) % 4) - index % 2)
    const max = Math.round(min + 7 + ((seed + index * 3) % 5))
    const dayWeather = pickWeather(seed, index)
    const nightWeather = pickWeather(seed, index + 2)

    return {
      date: toDateOnly(date),
      textDay: dayWeather.text,
      textNight: nightWeather.text,
      iconDay: dayWeather.icon,
      iconNight: nightWeather.icon,
      tempMax: max,
      tempMin: min,
      humidity: clamp(45 + ((seed + index * 9) % 35), 35, 88),
      precip: Number((((seed + index * 5) % 28) / 10).toFixed(1)),
      precipSum: Number((((seed + index * 5) % 28) / 10).toFixed(1)),
      precipProb: clamp(18 + ((seed + index * 11) % 70), 8, 92),
      uvIndex: clamp(3 + ((seed + index) % 8), 1, 11),
      windDirDay: WIND_DIRECTIONS[(seed + index) % WIND_DIRECTIONS.length],
      windScaleDay: String(2 + ((seed + index) % 5)),
      label: DAY_LABELS[index] || '',
    }
  })
}

const buildAirTrend = (seed, baseValue, unitScale = 1) => {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  return Array.from({ length: 5 }, (_, index) => {
    const date = new Date(today)
    date.setDate(today.getDate() + index)
    return {
      date: toDateOnly(date),
      value: Number((baseValue + ((seed + index * 3) % 12) * unitScale).toFixed(unitScale < 1 ? 1 : 0)),
    }
  })
}

export const createMockWeatherData = (city) => {
  const normalizedCity = String(city || '北京').trim() || '北京'
  const seed = getSeed(normalizedCity)
  const nowTime = new Date()
  const baseTemp = 12 + (seed % 15)
  const currentWeather = pickWeather(seed)
  const forecast = buildForecast(seed, baseTemp)
  const hourly = buildHourly(seed, baseTemp)
  const aqi = clamp(38 + (seed % 105), 32, 168)
  const airGrade = getAirGrade(aqi)
  const windSpeed = 8 + (seed % 18)

  const pollutants = [
    { key: 'pm2p5', name: 'PM2.5', unit: 'μg/m³', value: 18 + (seed % 38) },
    { key: 'pm10', name: 'PM10', unit: 'μg/m³', value: 36 + (seed % 52) },
    { key: 'o3', name: 'O₃', unit: 'μg/m³', value: 72 + (seed % 54) },
    { key: 'no2', name: 'NO₂', unit: 'μg/m³', value: 14 + (seed % 24) },
    { key: 'so2', name: 'SO₂', unit: 'μg/m³', value: 4 + (seed % 12) },
    { key: 'co', name: 'CO', unit: 'mg/m³', value: Number((0.4 + (seed % 9) * 0.1).toFixed(1)) },
  ]

  const trend = {
    pm2p5: buildAirTrend(seed, pollutants[0].value),
    pm10: buildAirTrend(seed, pollutants[1].value),
    o3: buildAirTrend(seed, pollutants[2].value),
    no2: buildAirTrend(seed, pollutants[3].value),
    so2: buildAirTrend(seed, pollutants[4].value),
    co: buildAirTrend(seed, pollutants[5].value, 0.1),
  }

  return {
    city: {
      id: `mock-${seed}`,
      name: normalizedCity,
      adm2: normalizedCity,
      adm1: '中国',
      country: '中国',
    },
    now: {
      obsTime: toIsoLocal(nowTime),
      temp: baseTemp,
      feelsLike: baseTemp - 1 + (seed % 3),
      text: currentWeather.text,
      icon: currentWeather.icon,
      humidity: clamp(48 + (seed % 32), 40, 89),
      windDir: WIND_DIRECTIONS[seed % WIND_DIRECTIONS.length],
      windScale: String(2 + (seed % 5)),
      windSpeed,
      pressure: 1002 + (seed % 21),
      vis: clamp(8 + (seed % 18), 6, 26),
      uvIndex: clamp(3 + (seed % 8), 1, 11),
      sunrise: `${forecast[0].date}T06:${pad((seed % 24) + 10)}:00+08:00`,
      sunset: `${forecast[0].date}T18:${pad((seed % 28) + 10)}:00+08:00`,
      precipitation: Number((((seed % 16) + 2) / 10).toFixed(1)),
    },
    hourly,
    forecast,
    airQuality: {
      aqi,
      category: airGrade.category,
      level: airGrade.level,
      advice: airGrade.advice,
      primary: pollutants.sort((a, b) => Number(b.value) - Number(a.value))[0].name,
      pollutants,
      trend,
    },
    meta: {
      source: 'mock',
      generatedAt: toIsoLocal(nowTime),
    },
  }
}

export const createMockAirQualityData = (city) => {
  const weatherData = createMockWeatherData(city)
  return {
    city: weatherData.city,
    airQuality: weatherData.airQuality,
    meta: weatherData.meta,
  }
}

export const isMockWeatherData = (payload) => payload?.meta?.source === 'mock'

export const mockWeatherTrendKeys = POLLUTANT_KEYS
