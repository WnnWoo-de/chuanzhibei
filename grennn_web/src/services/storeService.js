import axios from 'axios'
import { requestAxios } from '@/utils/api'

export const fetchRewardProducts = async () => {
  const result = await requestAxios(() => axios.get('/api/v1/store/products'), {
    fallbackMessage: '加载兑换商品失败',
  })
  if (!result.ok) return { ok: false, items: [], message: result.message }
  return { ok: true, items: Array.isArray(result.data?.items) ? result.data.items : [], message: '' }
}

export const fetchRedeemRecords = async () => {
  const result = await requestAxios(() => axios.get('/api/v1/store/records'), {
    fallbackMessage: '加载兑换记录失败',
  })
  if (!result.ok) return { ok: false, items: [], message: result.message }
  return { ok: true, items: Array.isArray(result.data?.items) ? result.data.items : [], message: '' }
}

export const redeemRewardProduct = async (productId) => {
  const result = await requestAxios(() => axios.post('/api/v1/store/redeem', { productId }), {
    fallbackMessage: '兑换失败',
  })
  if (!result.ok) return { ok: false, data: null, message: result.message, status: result.status }
  return { ok: true, data: result.data, message: '' }
}
