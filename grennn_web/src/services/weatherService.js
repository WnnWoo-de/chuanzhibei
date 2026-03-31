// ============================================================
// services/weatherService.js - 天气服务
// 封装天气查询 API 调用，对接后端 /api/v1/weather 接口
// ============================================================

/**
 * 查询指定城市的综合天气数据
 * 后端接口：GET /api/v1/weather/query?city=<城市名>
 *
 * @param {string} city - 城市名称（中文），例如 '北京'
 * @returns {Promise<{ ok: boolean, message: string, data: import('../types/weather').WeatherQueryResult | null }>}
 */
export async function queryWeatherByCity(city) {
  try {
    const url = `/api/v1/weather/query?city=${encodeURIComponent(city)}`
    const response = await fetch(url)
    const json = await response.json()

    if (!response.ok) {
      return {
        ok: false,
        message: json?.error || `请求失败（${response.status}）`,
        data: null,
      }
    }

    return { ok: true, message: '', data: json }
  } catch (err) {
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
 *
 * @param {string} city - 城市名称（中文）
 * @returns {Promise<{ ok: boolean, message: string, data: object | null }>}
 */
export async function queryAirQualityByCity(city) {
  try {
    const url = `/api/v1/weather/air-quality?city=${encodeURIComponent(city)}`
    const response = await fetch(url)
    const json = await response.json()

    if (!response.ok) {
      return {
        ok: false,
        message: json?.error || `请求失败（${response.status}）`,
        data: null,
      }
    }

    return { ok: true, message: '', data: json }
  } catch (err) {
    return {
      ok: false,
      message: err instanceof Error ? err.message : '网络请求失败',
      data: null,
    }
  }
}
