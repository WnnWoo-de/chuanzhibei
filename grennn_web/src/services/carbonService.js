import axios from 'axios'
import { requestAxios } from '@/utils/api'

// ============================================================
// services/carbonService.js - 碳足迹服务
// 封装碳足迹记录的新增与最近记录查询
// ============================================================

/** 创建一条新的碳足迹记录 */
export const createCarbonRecord = async (payload = {}) => {
  const result = await requestAxios(() => axios.post('/api/v1/carbon/records', payload), {
    fallbackMessage: '保存碳足迹失败',
  })
  if (!result.ok) return { ok: false, data: null, message: result.message }
  return { ok: true, data: result.data || null, message: '' }
}

/** 获取当前用户最近一次保存的碳足迹记录 */
export const fetchLatestCarbonRecord = async () => {
  const result = await requestAxios(() => axios.get('/api/v1/carbon/records/latest'), {
    fallbackMessage: '加载最近记录失败',
  })
  if (!result.ok) return { ok: false, data: null, message: result.message }
  return { ok: true, data: result.data || null, message: '' }
}
