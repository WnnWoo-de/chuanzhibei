// ============================================================
// services/weatherService.js - 天气服务
// 在后端不可用时自动回退到本地模拟天气数据，保证页面部署后可直接展示
// ============================================================

// 是否允许在接口失败时回退到本地模拟天气数据
const MOCK_ENABLED = true
// 天气文案与图标池：模拟数据会按城市 seed 稳定抽取
const WEATHER_TEXT_POOL = [
  { text: '晴', icon: '100' },
  { text: '多云', icon: '101' },
  { text: '阴', icon: '104' },
  { text: '小雨', icon: '305' },
]
// 风向候选池
const WIND_DIR_POOL = ['北风', '东北风', '东风', '东南风', '南风', '西南风', '西风', '西北风']
// AQI 分级配置：用于给模拟空气质量匹配等级、建议和首要污染物
const AQI_LEVELS = [
  { max: 50, level: '优', category: 'excellent', advice: '空气清新，适合外出活动。', primary: 'PM2.5' },
  { max: 100, level: '良', category: 'good', advice: '空气质量良好，敏感人群适度防护。', primary: 'PM10' },
  { max: 150, level: '轻度污染', category: 'light', advice: '建议减少长时间户外剧烈运动。', primary: 'O3' },
  { max: 200, level: '中度污染', category: 'moderate', advice: '外出建议佩戴口罩并注意补水。', primary: 'PM2.5' },
]

/** 根据城市名生成稳定 seed，让同一城市每次都得到近似一致的模拟天气 */
const createSeed = (city = '北京') => {
  return [...city].reduce((total, char) => total + char.charCodeAt(0), 0)
}

/** 数字补零工具：把 6 转成 "06" */
const pad = (value) => String(value).padStart(2, '0')

/** 将 Date 格式化为 yyyy-mm-dd */
const formatDate = (date) => {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
}

/** 将 Date 格式化为带时区的 ISO 风格时间文本 */
const formatIsoTime = (date) => {
  return `${formatDate(date)}T${pad(date.getHours())}:${pad(date.getMinutes())}:00+08:00`
}

/** 根据 seed 和索引从天气池中选取一组天气文案/图标 */
const pickWeatherMeta = (seed, index = 0) => {
  return WEATHER_TEXT_POOL[(seed + index) % WEATHER_TEXT_POOL.length]
}

/** 构建整套模拟天气数据，结构尽量贴近真实接口返回 */
const buildMockWeatherData = (city = '北京') => {
  const safeCity = city?.trim() || '北京'
  const seed = createSeed(safeCity)
  const now = new Date()
  const baseTemp = 16 + (seed % 12)
  const currentMeta = pickWeatherMeta(seed)
  const aqi = 38 + (seed % 90)
  const aqiMeta = AQI_LEVELS.find((item) => aqi <= item.max) || AQI_LEVELS[AQI_LEVELS.length - 1]

  const hourly = Array.from({ length: 12 }, (_, index) => {
    const hourDate = new Date(now)
    hourDate.setHours(now.getHours() + index)
    const meta = pickWeatherMeta(seed, index)
    return {
      time: formatIsoTime(hourDate),
      temp: baseTemp + Math.round(Math.sin(index / 2) * 3) + (index % 3 === 0 ? 1 : 0),
      icon: meta.icon,
      text: meta.text,
    }
  })

  const forecast = Array.from({ length: 7 }, (_, index) => {
    const date = new Date(now)
    date.setDate(now.getDate() + index)
    const meta = pickWeatherMeta(seed, index)
    const tempMin = baseTemp - 4 + (index % 3)
    const tempMax = tempMin + 6 + ((seed + index) % 4)
    return {
      date: formatDate(date),
      textDay: meta.text,
      textNight: index % 2 === 0 ? '多云' : '晴',
      iconDay: meta.icon,
      iconNight: index % 2 === 0 ? '151' : '150',
      tempMax,
      tempMin,
      humidity: 48 + ((seed + index * 7) % 30),
      precip: meta.text.includes('雨') ? 3 + (index % 4) : index % 3,
      windDirDay: WIND_DIR_POOL[(seed + index) % WIND_DIR_POOL.length],
      windScaleDay: `${2 + ((seed + index) % 4)}`,
    }
  })

  const pollutants = [
    { key: 'pm2p5', name: 'PM2.5', unit: 'μg/m³', value: 18 + (seed % 28) },
    { key: 'pm10', name: 'PM10', unit: 'μg/m³', value: 32 + (seed % 34) },
    { key: 'o3', name: 'O₃', unit: 'μg/m³', value: 62 + (seed % 40) },
    { key: 'no2', name: 'NO₂', unit: 'μg/m³', value: 14 + (seed % 16) },
    { key: 'so2', name: 'SO₂', unit: 'μg/m³', value: 6 + (seed % 10) },
    { key: 'co', name: 'CO', unit: 'mg/m³', value: Number((0.6 + (seed % 6) * 0.1).toFixed(1)) },
  ]

  const trend = Object.fromEntries(
    pollutants.map((pollutant, pollutantIndex) => [
      pollutant.key,
      Array.from({ length: 5 }, (_, pointIndex) => {
        const date = new Date(now)
        date.setDate(now.getDate() - (4 - pointIndex))
        return {
          date: formatDate(date),
          value: Number((pollutant.value * (0.8 + ((pollutantIndex + pointIndex) % 4) * 0.08)).toFixed(1)),
        }
      }),
    ]),
  )

  return {
    city: {
      id: `mock-${safeCity}`,
      name: safeCity,
      adm2: safeCity,
      adm1: '模拟天气站',
      country: '中国',
    },
    now: {
      obsTime: formatIsoTime(now),
      temp: baseTemp,
      feelsLike: baseTemp - 1 + (seed % 3),
      text: currentMeta.text,
      icon: currentMeta.icon,
      humidity: 52 + (seed % 24),
      windDir: WIND_DIR_POOL[seed % WIND_DIR_POOL.length],
      windScale: `${2 + (seed % 4)}`,
      windSpeed: 10 + (seed % 18),
      pressure: 1008 + (seed % 18),
      vis: 8 + (seed % 8),
      uvIndex: 2 + (seed % 7),
      sunrise: `${formatDate(now)}T06:${pad(5 + (seed % 20))}:00+08:00`,
      sunset: `${formatDate(now)}T18:${pad(10 + (seed % 25))}:00+08:00`,
      precipitation: currentMeta.text.includes('雨') ? 4 + (seed % 6) : seed % 3,
    },
    hourly,
    forecast,
    airQuality: {
      aqi,
      category: aqiMeta.category,
      level: aqiMeta.level,
      advice: aqiMeta.advice,
      primary: aqiMeta.primary,
      pollutants,
      trend,
    },
  }
}

/** 统一构建模拟查询返回结构 */
const createMockResponse = (city, message = '当前为本地模拟天气数据（未连接后端服务）') => {
  return {
    ok: true,
    message,
    data: buildMockWeatherData(city),
    mock: true,
  }
}

/**
 * 查询指定城市的综合天气数据
 * 后端接口：GET /api/v1/weather/query?city=<城市名>
 * 无后端时自动返回模拟数据，保证页面可展示。
 *
 * @param {string} city - 城市名称（中文），例如 '北京'
 * @returns {Promise<{ ok: boolean, message: string, data: import('../types/weather').WeatherQueryResult | null, mock?: boolean }>}
 */
export async function queryWeatherByCity(city) {
  const targetCity = city?.trim() || '北京'

  try {
    const url = `/api/v1/weather/query?city=${encodeURIComponent(targetCity)}`
    const response = await fetch(url)
    const json = await response.json()

    if (!response.ok) {
      return MOCK_ENABLED
        ? createMockResponse(targetCity)
        : {
            ok: false,
            message: json?.error || `请求失败（${response.status}）`,
            data: null,
          }
    }

    return { ok: true, message: '', data: json }
  } catch (err) {
    if (MOCK_ENABLED) {
      return createMockResponse(targetCity)
    }

    return {
      ok: false,
      message: err instanceof Error ? err.message : '网络请求失败',
      data: null,
    }
  }
}

/**
 * 单独查询指定城市的实时空气质量
 * 后端接口：GET /api/v1/weather/air-quality?city=<城市名>
 * 无后端时从本地模拟天气数据中提取空气质量。
 *
 * @param {string} city - 城市名称（中文）
 * @returns {Promise<{ ok: boolean, message: string, data: object | null, mock?: boolean }>}
 */
export async function queryAirQualityByCity(city) {
  const targetCity = city?.trim() || '北京'

  try {
    const url = `/api/v1/weather/air-quality?city=${encodeURIComponent(targetCity)}`
    const response = await fetch(url)
    const json = await response.json()

    if (!response.ok) {
      return MOCK_ENABLED
        ? {
            ok: true,
            message: '当前为空气质量模拟数据（未连接后端服务）',
            data: buildMockWeatherData(targetCity).airQuality,
            mock: true,
          }
        : {
            ok: false,
            message: json?.error || `请求失败（${response.status}）`,
            data: null,
          }
    }

    return { ok: true, message: '', data: json }
  } catch (err) {
    if (MOCK_ENABLED) {
      return {
        ok: true,
        message: '当前为空气质量模拟数据（未连接后端服务）',
        data: buildMockWeatherData(targetCity).airQuality,
        mock: true,
      }
    }

    return {
      ok: false,
      message: err instanceof Error ? err.message : '网络请求失败',
      data: null,
    }
  }
}
