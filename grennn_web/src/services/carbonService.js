import axios from 'axios'
import { requestAxios } from '@/utils/api'

export const createCarbonRecord = async (payload = {}) => {
  const result = await requestAxios(() => axios.post('/api/v1/carbon/records', payload), {
    fallbackMessage: '保存碳足迹失败',
  })
  if (!result.ok) return { ok: false, data: null, message: result.message }
  return { ok: true, data: result.data || null, message: '' }
}

export const fetchLatestCarbonRecord = async () => {
  const result = await requestAxios(() => axios.get('/api/v1/carbon/records/latest'), {
    fallbackMessage: '加载最近记录失败',
  })
  if (!result.ok) return { ok: false, data: null, message: result.message }
  return { ok: true, data: result.data || null, message: '' }
}
