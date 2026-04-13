import axios from 'axios'
import { requestAxios } from '@/utils/api'

export const fetchAchievements = async () => {
  const result = await requestAxios(() => axios.get('/api/v1/achievements'), {
    fallbackMessage: '加载成就失败',
  })
  if (!result.ok) return { ok: false, items: [], message: result.message }
  return { ok: true, items: Array.isArray(result.data?.items) ? result.data.items : [], message: '' }
}
