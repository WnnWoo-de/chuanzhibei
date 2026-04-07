// ============================================================
// services/weatherService.js - 天气服务
// 封装天气查询 API 调用，对接后端 /api/v1/weather 接口
// 在 Cloudflare 静态部署等无法直连后端时自动回退到模拟数据
// ============================================================

import { createMockAirQualityData, createMockWeatherData } from './weatherMockData'

const WEATHER_API_BASE = '/api/v1/weather'
const MOCK_MESSAGE = '当前为演示数据：Cloudflare 静态部署未连接天气后端，已自动展示模拟天气。'

const parseJsonSafely = async (response) => {
  try {
    return await response.json()
  } catch {
    return null
  }
}

const createMockResult = (factory, city) => ({
  ok: true,
  message: MOCK_MESSAGE,
  data: factory(city),
})

/**
 * 查询指定城市的综合天气数据
 * 后端接口：GET /api/v1/weather/query?city=<城市名>
 *
 * @param {string} city - 城市名称（中文），例如 '北京'
 * @returns {Promise<{ ok: boolean, message: string, data: import('../types/weather').WeatherQueryResult | null }>}
 */
export async function queryWeatherByCity(city) {
  const normalizedCity = String(city || '').trim() || '北京'

  try {
    const url = `${WEATHER_API_BASE}/query?city=${encodeURIComponent(normalizedCity)}`
    const response = await fetch(url)
    const json = await parseJsonSafely(response)

    if (!response.ok) {
      return createMockResult(createMockWeatherData, normalizedCity)
    }

    return {
      ok: true,
      message: '',
      data: json,
    }
  } catch {
    return createMockResult(createMockWeatherData, normalizedCity)
  }
}

/**
 * 单独查询指定城市的实时空气质量
 * 后端接口：GET /api/v1/weather/air-quality?city=<城市名>
 *
 * @param {string} city - 城市名称（中文）
 * @returns {Promise<{ ok: boolean, message: string, data: object | null }>}
 */
export async function queryAirQualityByCity(city) {
  const normalizedCity = String(city || '').trim() || '北京'

  try {
    const url = `${WEATHER_API_BASE}/air-quality?city=${encodeURIComponent(normalizedCity)}`
    const response = await fetch(url)
    const json = await parseJsonSafely(response)

    if (!response.ok) {
      return createMockResult(createMockAirQualityData, normalizedCity)
    }

    return { ok: true, message: '', data: json }
  } catch {
    return createMockResult(createMockAirQualityData, normalizedCity)
  }
}
