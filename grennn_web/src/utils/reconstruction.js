// ============================================================
// utils/reconstruction.js - 旧物重构模块工具函数
// 将后端 AI 分析结果规范化为前端展示格式
// ============================================================

/**
 * 将后端 AI 分析结果映射为前端展示所需的数据结构
 * 若后端返回字段缺失，则使用预设的默认值
 * @param {object} data - 后端 /api/v1/reconstruction/analyze 的响应数据
 * @returns {{ meta: object, suggestions: Array|null }}
 */
export const mapAnalyzeResult = (data) => {
  // 默认元数据（后端未返回时的兜底值）
  const meta = {
    material: '98.5% 木质',
    integrity: '良好 (B+)',
    carbonReduction: '12.5 kg CO₂e',
  }

  // 从后端数据中提取并覆盖默认值（兼容 snake_case 和 camelCase）
  const material = data?.material
  const integrity = data?.integrity
  const carbonReduction = data?.carbon_reduction || data?.carbonReduction

  if (typeof material === 'string' && material.trim()) meta.material = material.trim()
  if (typeof integrity === 'string' && integrity.trim()) meta.integrity = integrity.trim()
  if (typeof carbonReduction === 'string' && carbonReduction.trim()) {
    meta.carbonReduction = carbonReduction.trim()
  }

  // 规范化重构建议列表
  const suggestionsRaw = data?.suggestions
  const suggestions = Array.isArray(suggestionsRaw)
    ? suggestionsRaw
        .map((s) => ({
          title: String(s?.title || '').trim(),
          // description 优先使用字符串，其次将 steps 数组拼接为字符串
          description: typeof s?.description === 'string' && s.description.trim()
            ? s.description.trim()
            : Array.isArray(s?.steps)
              ? s.steps.filter(Boolean).join('；')
              : '',
          difficulty: String(s?.difficulty || '').trim() || '中等', // 默认难度：中等
          steps: Array.isArray(s?.steps) ? s.steps.filter(Boolean) : [], // 制作步骤列表
          duration: String(s?.duration || '').trim() || '2-4 小时',  // 默认用时
        }))
        .filter((s) => s.title) // 过滤掉没有标题的建议
    : null // 后端未返回建议时返回 null，前端将使用预设建议

  return { meta, suggestions }
}
