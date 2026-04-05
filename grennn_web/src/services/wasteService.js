import axios from 'axios'
import { requestAxios } from '@/utils/api'

export const analyzeWasteImage = async (file) => {
  if (!file) return { ok: false, data: null, message: '缺少文件' }

  const formData = new FormData()
  formData.append('file', file)

  const result = await requestAxios(() => axios.post('/api/v1/waste/analyze', formData), {
    fallbackMessage: '识别失败',
  })

  if (!result.ok) return { ok: false, data: null, message: result.message }
  return { ok: true, data: result.data || null, message: '' }
}
