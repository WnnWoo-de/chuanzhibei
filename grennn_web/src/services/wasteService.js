import axios from 'axios'
import { requestAxios } from '@/utils/api'

// ============================================================
// services/wasteService.js - 垃圾识别服务
// 上传图片到后端并获取 AI 返回的垃圾分类结果
// ============================================================

/** 上传待识别图片并返回识别结果 */
export const analyzeWasteImage = async (file) => {
  if (!file) return { ok: false, data: null, message: '缺少文件' }

  // 使用 multipart/form-data 上传图片文件
  const formData = new FormData()
  formData.append('file', file)

  const result = await requestAxios(() => axios.post('/api/v1/waste/analyze', formData), {
    fallbackMessage: '识别失败',
  })

  if (!result.ok) return { ok: false, data: null, message: result.message }
  return { ok: true, data: result.data || null, message: '' }
}
