// ============================================================
// services/communityService.js - 社区服务
// 封装社区帖子的获取、点赞、发布等 API 调用
// ============================================================

import axios from 'axios'
import { requestAxios } from '@/utils/api'
import { buildPostFromApi, extractPostItems } from '@/utils/community'

/**
 * 获取社区帖子列表（分页）
 * @param {object} options
 * @param {number} options.page - 页码（从 1 开始）
 * @param {number} options.limit - 每页条数
 * @param {string} options.sort - 排序方式（'latest' 最新 / 'hot' 热门）
 * @returns {{ ok: boolean, items: Array, message: string }}
 */
export const fetchCommunityPosts = async ({ page = 1, limit = 10, sort = 'latest' } = {}) => {
  const result = await requestAxios(
    () => axios.get('/api/v1/community/posts', { params: { page, limit, sort } }),
    { fallbackMessage: '加载失败' },
  )
  if (!result.ok) return { ok: false, items: [], message: result.message }

  // 从响应中提取帖子数组，并规范化每条帖子数据，过滤掉无 ID 的无效数据
  const items = extractPostItems(result.data).map(buildPostFromApi).filter((p) => p.id)
  return { ok: true, items, message: '' }
}

/**
 * 对帖子进行点赞或取消点赞
 * @param {string|number} postId - 帖子 ID
 * @param {boolean} liked - true 为点赞，false 为取消
 * @returns {{ ok: boolean, message: string, status: string, count: number|null }}
 */
export const likeCommunityPost = async (postId, liked) => {
  const result = await requestAxios(
    () => axios.post(`/api/v1/community/posts/${postId}/like`, { action: liked ? 'like' : 'unlike' }),
    { fallbackMessage: '操作失败' },
  )
  if (!result.ok) {
    return { ok: false, message: result.message, status: '', count: null }
  }
  // 提取后端返回的最新点赞状态和数量
  const status = String(result.data?.status || '')
  const count = Number(result.data?.count ?? result.data?.likes_count)
  return { ok: true, message: '', status, count: Number.isFinite(count) ? count : null }
}

/**
 * 发布新帖子
 * @param {object} options
 * @param {string} options.content - 帖子文字内容
 * @param {string[]} options.imageUrls - 图片 URL 列表
 * @returns {{ ok: boolean, message: string, post: object|null }}
 */
export const createCommunityPost = async ({ content, imageUrls = [] } = {}) => {
  const payload = { content: String(content || ''), image_urls: imageUrls }
  const result = await requestAxios(() => axios.post('/api/v1/community/posts', payload), {
    fallbackMessage: '发布失败',
  })
  if (!result.ok) return { ok: false, message: result.message, post: null }

  // 规范化后端返回的帖子数据（兼容不同包装字段名）
  const raw = result.data?.item || result.data?.post || result.data
  const post = buildPostFromApi({ ...(raw || {}), content: payload.content })
  return { ok: true, message: '', post }
}
