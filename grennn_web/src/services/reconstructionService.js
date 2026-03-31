// ============================================================
// services/reconstructionService.js - 旧物重构服务
// 封装旧物图片 AI 分析的 API 调用
// ============================================================

import axios from 'axios'
import { requestAxios } from '@/utils/api'

/**
 * 上传旧物图片并调用 AI 分析
 * 后端将使用 AI 模型识别物品材质、结构，并返回重构建议
 * @param {File} file - 用户选择的图片文件
 * @returns {{ ok: boolean, message: string, data: object|null }}
 */
export const analyzeReconstruction = async (file) => {
  if (!file) return { ok: false, message: '缺少文件', data: null }

  // 使用 FormData 发送多部分表单数据（multipart/form-data）
  const formData = new FormData()
  formData.append('file', file)

  const result = await requestAxios(
    () => axios.post('/api/v1/reconstruction/analyze', formData),
    { fallbackMessage: '分析失败' },
  )

  if (!result.ok) return { ok: false, message: result.message, data: null }
  return { ok: true, message: '', data: result.data }
}
