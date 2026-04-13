import { marked } from 'marked'

const markdownRenderer = new marked.Renderer()
markdownRenderer.html = () => ''

marked.setOptions({
  renderer: markdownRenderer,
  breaks: true,
  mangle: false,
  headerIds: false,
})

export const renderChatMarkdown = (text) => {
  try {
    return marked.parse(String(text || ''))
  } catch (err) {
    void err
    return ''
  }
}
