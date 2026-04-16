// ============================================================
// services/reconstructionService.js - 旧物重构服务
// 封装旧物图片 AI 分析调用与结果规范化
// ============================================================

import axios from 'axios'
import { requestAxios } from '@/utils/api'

/**
 * 将后端 AI 分析结果映射为前端展示所需的数据结构
 * @param {object} data - 后端 /api/v1/reconstruction/analyze 的响应数据
 * @returns {{ meta: object, suggestions: Array, summary: object }}
 */
export const mapAnalyzeResult = (data) => {
  const meta = {
    itemName: '未识别物品',
    material: '未识别',
    integrity: '不适用',
    carbonReduction: '不适用',
    confidence: '低',
    reconstructable: false,
    reason: '暂未获得可靠判断依据',
    disposalAdvice: '请结合材质与当地回收要求分类处理',
  }

  const itemName = data?.item_name || data?.itemName
  const material = data?.material
  const integrity = data?.integrity
  const carbonReduction = data?.carbon_reduction || data?.carbonReduction
  const confidence = data?.confidence
  const reason = data?.reason
  const disposalAdvice = data?.disposal_advice || data?.disposalAdvice

  if (typeof itemName === 'string' && itemName.trim()) meta.itemName = itemName.trim()
  if (typeof material === 'string' && material.trim()) meta.material = material.trim()
  if (typeof integrity === 'string' && integrity.trim()) meta.integrity = integrity.trim()
  if (typeof carbonReduction === 'string' && carbonReduction.trim()) {
    meta.carbonReduction = carbonReduction.trim()
  }
  if (typeof confidence === 'string' && confidence.trim()) meta.confidence = confidence.trim()
  if (typeof reason === 'string' && reason.trim()) meta.reason = reason.trim()
  if (typeof disposalAdvice === 'string' && disposalAdvice.trim()) {
    meta.disposalAdvice = disposalAdvice.trim()
  }
  meta.reconstructable = Boolean(data?.reconstructable)

  const suggestionsRaw = data?.suggestions
  const suggestions = Array.isArray(suggestionsRaw)
    ? suggestionsRaw
        .map((s) => ({
          title: String(s?.title || '').trim(),
          description:
            typeof s?.description === 'string' && s.description.trim()
              ? s.description.trim()
              : Array.isArray(s?.steps)
                ? s.steps.filter(Boolean).join('；')
                : '',
          difficulty: String(s?.difficulty || '').trim() || '中等',
          steps: Array.isArray(s?.steps) ? s.steps.filter(Boolean) : [],
          duration: String(s?.duration || '').trim() || '2-4 小时',
        }))
        .filter((s) => s.title)
    : []

  return {
    meta,
    suggestions,
    summary: {
      isReconstructable: meta.reconstructable,
      hasSuggestions: suggestions.length > 0,
    },
  }
}

/**
 * 上传旧物图片并调用 AI 分析
 * 后端将使用 AI 模型识别物品材质、结构，并返回重构建议
 * @param {File} file - 用户选择的图片文件
 * @returns {{ ok: boolean, message: string, data: object|null }}
 */
export const analyzeReconstruction = async (file) => {
  if (!file) return { ok: false, message: '缺少文件', data: null }

  const formData = new FormData()
  formData.append('file', file)

  const result = await requestAxios(
    () => axios.post('/api/v1/reconstruction/analyze', formData),
    { fallbackMessage: '分析失败' },
  )

  if (!result.ok) return { ok: false, message: result.message, data: null }
  return { ok: true, message: '', data: result.data }
}

