// ============================================================
// utils/community.js - 社区模块工具函数
// 提供帖子数据处理、颜色生成等辅助函数
// ============================================================

/**
 * 将字符串转换为 32 位无符号整数哈希值
 * 用于根据用户名或 ID 生成稳定的随机色相值
 * @param {*} value - 任意可转换为字符串的值
 * @returns {number} 无符号 32 位整数哈希值
 */
export const hashString = (value) => {
  const str = String(value || '')
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    // 多项式滚动哈希：hash = hash * 31 + charCode，>>> 0 保证无符号
    hash = (hash * 31 + str.charCodeAt(i)) >>> 0
  }
  return hash
}

/**
 * 根据哈希值和偏移量生成 HSL 颜色字符串
 * 用于为用户头像生成渐变起止色，同一用户颜色始终一致
 * @param {number} hash - 字符串哈希值
 * @param {number} offset - 色相偏移量（度），用于生成第二个颜色
 * @returns {string} HSL 颜色字符串，如 "hsl(120 70% 55%)"
 */
export const colorFromHash = (hash, offset) => {
  const hue = (hash + offset) % 360
  return `hsl(${hue} 70% 55%)`
}

/**
 * 从接口响应中提取帖子数组
 * 兼容多种后端返回结构：数组、{ items: [] }、{ data: [] }
 * @param {*} data - 接口返回的原始数据
 * @returns {Array} 帖子数组
 */
export const extractPostItems = (data) => {
  if (!data) return []
  if (Array.isArray(data)) return data              // 直接是数组
  if (Array.isArray(data.items)) return data.items  // 包裹在 items 字段中
  if (Array.isArray(data.data)) return data.data    // 包裹在 data 字段中
  return []
}

/**
 * 将后端帖子原始数据规范化为前端统一格式
 * 兼容不同后端字段命名（snake_case / camelCase）
 * @param {object} raw - 后端原始帖子数据
 * @returns {object} 规范化的帖子对象
 */
export const buildPostFromApi = (raw) => {
  // 提取帖子 ID（兼容多种字段名）
  const id = raw?.id ?? raw?._id ?? raw?.post_id ?? raw?.postId ?? ''

  // 提取作者名（优先取嵌套对象中的字段，依次降级）
  const author =
    raw?.author?.username ||
    raw?.author?.name ||
    raw?.author?.email ||
    raw?.user?.username ||
    raw?.user?.name ||
    raw?.user ||
    ''

  const content = typeof raw?.content === 'string' ? raw.content : ''

  // 提取图片（兼容数组和单图字段）
  const images = raw?.images || raw?.image_urls || raw?.imageUrls
  const image = Array.isArray(images) ? images[0] : typeof raw?.image === 'string' ? raw.image : null

  // 提取点赞数和评论数（兼容不同字段名）
  const likes = Number(raw?.likes_count ?? raw?.likes ?? 0) || 0
  const comments = Number(raw?.comments_count ?? raw?.comments ?? 0) || 0
  const liked = Boolean(raw?.is_liked ?? raw?.liked)

  // 格式化创建时间
  const createdAt = raw?.created_at || raw?.createdAt
  const time =
    typeof createdAt === 'string' && createdAt
      ? new Date(createdAt).toLocaleString()
      : new Date().toLocaleTimeString('en-GB')

  // 根据作者名或 ID 生成稳定的头像渐变色
  const seed = hashString(author || id)
  const avatarColor1 = colorFromHash(seed, 0)    // 渐变起始色
  const avatarColor2 = colorFromHash(seed, 120)  // 渐变结束色（色相偏移 120°）

  return {
    id,
    user: author || '匿名用户',
    time,
    content,
    fullContent: content,  // 完整内容（用于展开/折叠）
    expanded: false,       // 是否已展开全文
    image,
    likes,
    comments,
    liked,
    avatarColor1,
    avatarColor2,
    commentList: [],       // 评论列表（初始为空，按需加载）
    remote: true,          // 标记为远程数据（区别于本地模拟数据）
  }
}
