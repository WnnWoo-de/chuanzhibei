import { marked } from 'marked'
import DOMPurify from 'dompurify'

/**
 * 聊天 Markdown 渲染
 *
 * 安全检查：
 *   1. 禁用原生 HTML，避免 Markdown 中的原始标签直接进入页面；
 *   2. 链接和图片地址只允许 http/https/mailto/tel 与站内相对路径；
 *   3. 属性值统一转义，防止通过 title/href 注入事件属性；
 *   4. 最终 HTML 再交给 DOMPurify 做标签与属性白名单净化。
 */

const SAFE_URL = /^(https?:\/\/|mailto:|tel:|\/|#)/i

const escapeHtml = (value) => String(value ?? '')
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;')
  .replace(/'/g, '&#39;')

const hasUnsafeChars = (value) => Array.from(value).some((char) => {
  const code = char.charCodeAt(0)
  return code <= 0x1f || code === 0x7f || /\s/.test(char)
})

const safeUrl = (value) => {
  const url = String(value ?? '').trim()
  if (!url) return ''
  if (!SAFE_URL.test(url)) return ''
  // 拒绝包含控制字符或空格的伪协议
  if (hasUnsafeChars(url)) return ''
  return escapeHtml(url)
}

const renderer = new marked.Renderer()
renderer.html = () => ''
renderer.link = ({ href, title, tokens }) => {
  const text = tokens ? marked.Parser.parseInline(tokens) : escapeHtml(href || '')
  const url = safeUrl(href)
  if (!url) return text
  const titleAttr = title ? ` title="${escapeHtml(title)}"` : ''
  return `<a href="${url}"${titleAttr} target="_blank" rel="noopener noreferrer nofollow">${text}</a>`
}
renderer.image = ({ href, title, text }) => {
  const url = safeUrl(href)
  if (!url) return escapeHtml(text || '')
  const titleAttr = title ? ` title="${escapeHtml(title)}"` : ''
  return `<img src="${url}" alt="${escapeHtml(text || '')}"${titleAttr} loading="lazy" />`
}

marked.setOptions({
  renderer,
  breaks: true,
  gfm: true,
})

const PURIFY_CONFIG = {
  ALLOWED_TAGS: [
    'p', 'br', 'strong', 'em', 'del', 'code', 'pre', 'blockquote',
    'ul', 'ol', 'li', 'a', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
    'hr', 'table', 'thead', 'tbody', 'tr', 'th', 'td', 'img', 'span',
  ],
  ALLOWED_ATTR: ['href', 'title', 'target', 'rel', 'src', 'alt', 'class'],
  ALLOW_DATA_ATTR: false,
  FORBID_TAGS: ['style', 'script', 'iframe', 'object', 'embed', 'form', 'input', 'button'],
  FORBID_ATTR: ['style', 'onerror', 'onload', 'onclick'],
}

if (typeof window !== 'undefined' && DOMPurify?.addHook) {
  DOMPurify.addHook('afterSanitizeAttributes', (node) => {
    if (node.tagName === 'A') {
      const href = node.getAttribute('href') || ''
      if (!SAFE_URL.test(href)) {
        node.removeAttribute('href')
      } else {
        node.setAttribute('target', '_blank')
        node.setAttribute('rel', 'noopener noreferrer nofollow')
      }
    }
    if (node.tagName === 'IMG') {
      const src = node.getAttribute('src') || ''
      if (!SAFE_URL.test(src)) node.removeAttribute('src')
    }
  })
}

const escapeFallback = (text) => escapeHtml(text).replace(/\n/g, '<br>')

export const renderChatMarkdown = (text) => {
  const source = String(text || '')
  try {
    const html = marked.parse(source)
    if (typeof window === 'undefined') return escapeFallback(source)
    return DOMPurify.sanitize(html, PURIFY_CONFIG)
  } catch (err) {
    void err
    return escapeFallback(source)
  }
}