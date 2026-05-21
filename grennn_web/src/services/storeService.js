import axios from 'axios'
import { requestAxios } from '@/utils/api'

// ============================================================
// services/storeService.js - 积分商城服务
// 封装商品列表、兑换记录以及商品兑换请求
// ============================================================

/** 获取可兑换商品列表 */
export const fetchRewardProducts = async () => {
  const result = await requestAxios(() => axios.get('/api/v1/store/products'), {
    fallbackMessage: '加载兑换商品失败',
  })
  if (!result.ok) return { ok: false, items: [], message: result.message }
  return { ok: true, items: Array.isArray(result.data?.items) ? result.data.items : [], message: '' }
}

/** 获取当前用户的兑换记录 */
export const fetchRedeemRecords = async () => {
  const result = await requestAxios(() => axios.get('/api/v1/store/records'), {
    fallbackMessage: '加载兑换记录失败',
  })
  if (!result.ok) return { ok: false, items: [], message: result.message }
  return { ok: true, items: Array.isArray(result.data?.items) ? result.data.items : [], message: '' }
}

/** 使用积分兑换指定商品 */
export const redeemRewardProduct = async (productId) => {
  const result = await requestAxios(() => axios.post('/api/v1/store/redeem', { productId }), {
    fallbackMessage: '兑换失败',
  })
  if (!result.ok) return { ok: false, data: null, message: result.message, status: result.status }
  return { ok: true, data: result.data, message: '' }
}
