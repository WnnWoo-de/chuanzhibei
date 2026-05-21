import axios from 'axios'
import { requestAxios } from '@/utils/api'

// ============================================================
// services/achievementService.js - 成就服务
// 负责拉取后端成就列表，供成就页和用户中心复用
// ============================================================

/** 获取成就列表，并统一成前端易消费的返回结构 */
export const fetchAchievements = async () => {
  const result = await requestAxios(() => axios.get('/api/v1/achievements'), {
    fallbackMessage: '加载成就失败',
  })
  if (!result.ok) return { ok: false, items: [], message: result.message }
  return { ok: true, items: Array.isArray(result.data?.items) ? result.data.items : [], message: '' }
}
