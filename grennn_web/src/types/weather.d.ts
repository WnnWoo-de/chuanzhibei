export type PollutantKey = 'pm2p5' | 'pm10' | 'o3' | 'no2' | 'so2' | 'co'

export interface PollutantItem {
  key: PollutantKey
  name: string
  unit: string
  value: number | null
}

export interface PollutantTrendPoint {
  date: string
  value: number | null
}

export interface WeatherCity {
  id: string
  name: string
  adm2: string
  adm1: string
  country: string
}

export interface CurrentWeather {
  obsTime: string
  temp: number | null
  feelsLike: number | null
  text: string
  icon: string
  humidity: number | null
  windDir: string
  windScale: string
  pressure: number | null
  vis: number | null
}

export interface ForecastDay {
  date: string
  textDay: string
  textNight: string
  iconDay: string
  iconNight: string
  tempMax: number | null
  tempMin: number | null
  humidity: number | null
  precip: number | null
  windDirDay: string
  windScaleDay: string
}

export interface AirQualityData {
  aqi: number | null
  category: string
  level: string
  advice: string
  primary: string
  pollutants: PollutantItem[]
  trend: Record<PollutantKey, PollutantTrendPoint[]>
}

export interface WeatherQueryResult {
  city: WeatherCity
  now: CurrentWeather
  forecast: ForecastDay[]
  airQuality: AirQualityData
}
