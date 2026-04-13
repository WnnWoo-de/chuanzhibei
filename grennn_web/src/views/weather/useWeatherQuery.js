import { ref } from 'vue'
import { queryWeatherByCity } from '@/services/weatherService'

const DEFAULT_CITY = '北京'

export const useWeatherQuery = () => {
  const searchCity = ref(DEFAULT_CITY)
  const weather = ref(null)
  const loading = ref(false)
  const errorMessage = ref('')
  const infoMessage = ref('')
  const isMockData = ref(false)
  const globalMinTemp = ref(0)
  const globalMaxTemp = ref(40)
  const lastSuccessfulCity = ref(DEFAULT_CITY)

  const getBarStyle = (min, max) => {
    const range = globalMaxTemp.value - globalMinTemp.value || 1
    const left = ((min - globalMinTemp.value) / range) * 100
    const width = ((max - min) / range) * 100
    return {
      left: `${Math.max(0, left)}%`,
      width: `${Math.max(0, width)}%`,
      background: 'linear-gradient(90deg, rgba(255,255,255,0.72), rgba(255,205,118,0.92), rgba(255,172,120,0.96))',
      boxShadow: '0 0 10px rgba(255, 197, 120, 0.32)',
    }
  }

  const applyForecastRange = (data) => {
    if (data.forecast && data.forecast.length > 0) {
      const temps = []
      data.forecast.forEach((day) => {
        temps.push(day.tempMin, day.tempMax)
      })
      globalMinTemp.value = Math.min(...temps)
      globalMaxTemp.value = Math.max(...temps)
    }
  }

  const handleSearch = async (rawCity = searchCity.value) => {
    const city = (rawCity || searchCity.value || lastSuccessfulCity.value || DEFAULT_CITY).trim() || DEFAULT_CITY

    searchCity.value = city
    loading.value = true
    errorMessage.value = ''
    infoMessage.value = ''
    isMockData.value = false

    const result = await queryWeatherByCity(city)
    loading.value = false

    if (result.ok && result.data) {
      weather.value = result.data
      lastSuccessfulCity.value = city
      errorMessage.value = ''
      isMockData.value = Boolean(result.mock)
      infoMessage.value = result.mock ? result.message || '当前展示的是本地模拟天气数据。' : ''
      applyForecastRange(result.data)
      return
    }

    errorMessage.value = result.message || '查询失败，请重试'

    if (!weather.value && city !== DEFAULT_CITY) {
      loading.value = true
      const fallbackResult = await queryWeatherByCity(DEFAULT_CITY)
      loading.value = false

      if (fallbackResult.ok && fallbackResult.data) {
        weather.value = fallbackResult.data
        searchCity.value = DEFAULT_CITY
        lastSuccessfulCity.value = DEFAULT_CITY
        isMockData.value = Boolean(fallbackResult.mock)
        infoMessage.value = fallbackResult.mock
          ? fallbackResult.message || '当前展示的是本地模拟天气数据。'
          : '已为你展示默认城市天气'
        applyForecastRange(fallbackResult.data)
        errorMessage.value = `${result.message || '查询失败'}，已为你展示默认城市天气`
      }
    }
  }

  return {
    defaultCity: DEFAULT_CITY,
    searchCity,
    weather,
    loading,
    errorMessage,
    infoMessage,
    isMockData,
    lastSuccessfulCity,
    getBarStyle,
    handleSearch,
  }
}
