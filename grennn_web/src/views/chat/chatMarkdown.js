import { marked } from 'marked'

const markdownRenderer = new marked.Renderer()
markdownRenderer.html = () => ''
markdownRenderer.link = ({ href, title, tokens }) => {
  const text = tokens ? marked.Parser.parseInline(tokens) : href || ''
  const safeHref = typeof href === 'string' ? href : ''
  const safeTitle = typeof title === 'string' ? title : ''
  return `<a href="${safeHref}" title="${safeTitle}" target="_blank" rel="noopener noreferrer">${text}</a>`
}

marked.setOptions({
  renderer: markdownRenderer,
  breaks: true,
  gfm: true,
})

export const renderChatMarkdown = (text) => {
  try {
    return marked.parse(String(text || ''))
  } catch (err) {
    void err
    return String(text || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;')
      .replace(/\n/g, '<br>')
  }
}
