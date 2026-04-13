// ============================================================
// views/__tests__/WeatherQuery.spec.js - WeatherQuery 组件单元测试
// 使用 Vitest + Vue Test Utils 测试天气查询页面的核心交互
// Mock 策略：vi.mock 替换 weatherService，控制接口返回值
// ============================================================
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import WeatherView from '../WeatherView.vue'
import { queryWeatherByCity } from '@/services/weatherService'

// Mock weatherService，避免真实 HTTP 请求
vi.mock('@/services/weatherService', () => ({
  queryWeatherByCity: vi.fn(),
}))

// ---- 测试数据 Fixture ----
// 模拟后端返回的完整天气数据（北京，AQI=92）
const successPayload = {
  city: { id: '101010100', name: '北京', adm2: '北京', adm1: '北京', country: '中国' },
  now: {
    obsTime: '2026-03-19T09:00+08:00',
    temp: 16,
    feelsLike: 15,
    text: '多云',
    icon: '101',
    humidity: 48,
    windDir: '东南风',
    windScale: '3',
    pressure: 1012,
    vis: 18,
  },
  forecast: [
    { date: '2026-03-19', textDay: '多云', textNight: '晴', iconDay: '101', iconNight: '150', tempMax: 20, tempMin: 11, humidity: 43, precip: 0, windDirDay: '东南风', windScaleDay: '3' },
    { date: '2026-03-20', textDay: '晴', textNight: '晴', iconDay: '100', iconNight: '150', tempMax: 22, tempMin: 12, humidity: 41, precip: 0, windDirDay: '东风', windScaleDay: '2' },
    { date: '2026-03-21', textDay: '晴', textNight: '多云', iconDay: '100', iconNight: '101', tempMax: 23, tempMin: 13, humidity: 45, precip: 0, windDirDay: '东风', windScaleDay: '2' },
    { date: '2026-03-22', textDay: '小雨', textNight: '阴', iconDay: '305', iconNight: '104', tempMax: 18, tempMin: 10, humidity: 57, precip: 2.5, windDirDay: '北风', windScaleDay: '3' },
    { date: '2026-03-23', textDay: '阴', textNight: '多云', iconDay: '104', iconNight: '101', tempMax: 19, tempMin: 9, humidity: 55, precip: 1.2, windDirDay: '北风', windScaleDay: '2' },
  ],
  airQuality: {
    aqi: 92,
    category: '良',
    level: '良',
    advice: '空气质量良好，敏感人群适度减少高强度户外运动。',
    primary: 'PM2.5',
    pollutants: [
      { key: 'pm2p5', name: 'PM2.5', unit: 'μg/m³', value: 36 },
      { key: 'pm10', name: 'PM10', unit: 'μg/m³', value: 68 },
      { key: 'o3', name: 'O₃', unit: 'μg/m³', value: 90 },
      { key: 'no2', name: 'NO₂', unit: 'μg/m³', value: 22 },
      { key: 'so2', name: 'SO₂', unit: 'μg/m³', value: 7 },
      { key: 'co', name: 'CO', unit: 'mg/m³', value: 0.8 },
    ],
    trend: {
      pm2p5: [
        { date: '2026-03-19', value: 28 },
        { date: '2026-03-20', value: 31 },
        { date: '2026-03-21', value: 35 },
        { date: '2026-03-22', value: 30 },
        { date: '2026-03-23', value: 36 },
      ],
      pm10: [
        { date: '2026-03-19', value: 56 },
        { date: '2026-03-20', value: 62 },
        { date: '2026-03-21', value: 68 },
        { date: '2026-03-22', value: 65 },
        { date: '2026-03-23', value: 70 },
      ],
      o3: [],
      no2: [],
      so2: [],
      co: [],
    },
  },
}

describe('WeatherView', () => {
  // 每个测试前清空所有 mock 调用记录，保证用例相互独立
  beforeEach(() => {
    vi.clearAllMocks()
  })

  /**
   * 正常路径：接口返回成功数据
   * 验证：城市名、5天预报标题、AQI 数值均正确渲染
   */
  it('加载成功后渲染天气核心信息', async () => {
    queryWeatherByCity.mockResolvedValue({ ok: true, message: '', data: successPayload })
    const wrapper = mount(WeatherView)
    await flushPromises() // 等待所有异步操作（接口调用、DOM 更新）完成

    expect(queryWeatherByCity).toHaveBeenCalledWith('北京')
    expect(wrapper.text()).toContain('天气查询')
    expect(wrapper.text()).toContain('未来 5 天预报')
    expect(wrapper.text()).toContain('北京')
    expect(wrapper.get('[data-testid="aqi-value"]').text()).toBe('92')
  })

  /**
   * 异常路径：首次请求失败，用户点击重试后成功
   * 验证：错误边界文本展示、重试按钮触发二次请求、成功后渲染结果
   */
  it('查询失败时显示错误边界并支持重试', async () => {
    queryWeatherByCity
      .mockResolvedValueOnce({ ok: false, message: '网络异常', data: null }) // 第一次失败
      .mockResolvedValueOnce({ ok: true, message: '', data: successPayload }) // 重试成功
    const wrapper = mount(WeatherView)
    await flushPromises()

    expect(wrapper.text()).toContain('天气数据加载失败')
    expect(wrapper.text()).toContain('网络异常')

    await wrapper.get('[data-testid="retry-button"]').trigger('click')
    await flushPromises()
    expect(wrapper.text()).toContain('污染物监测')
  })

  /**
   * 交互路径：切换污染物趋势图类型
   * 验证：点击 PM10 按钮后，该按钮应获得 active 样式（bg-black）
   */
  it('支持污染物趋势切换按钮状态', async () => {
    queryWeatherByCity.mockResolvedValue({ ok: true, message: '', data: successPayload })
    const wrapper = mount(WeatherView)
    await flushPromises()

    const pm10Toggle = wrapper.get('[data-testid="trend-toggle-pm10"]')
    await pm10Toggle.trigger('click')
    expect(pm10Toggle.classes().includes('bg-black')).toBe(true)
  })
})
