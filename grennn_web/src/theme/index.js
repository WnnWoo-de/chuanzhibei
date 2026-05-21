import { computed, ref } from 'vue'

// 主题持久化键：用于 localStorage 保存用户偏好
export const THEME_KEY = 'greensight_theme'
// 默认主题：首次访问或读取异常时回退到亮色主题
export const DEFAULT_THEME = 'light'

// 主题元数据模板：用于界面展示当前主题名称与描述
export const themeTemplate = {
  light: { name: 'Light', description: '明亮' },
  dark: { name: 'Dark', description: '暗色' },
}

/** 对输入主题名做安全归一化，非法值统一回退到默认主题 */
const normalizeTheme = (value) => (themeTemplate[value] ? value : DEFAULT_THEME)

/** 读取首次加载时应使用的主题 */
const getInitialTheme = () => {
  if (typeof localStorage === 'undefined') return DEFAULT_THEME
  return normalizeTheme(localStorage.getItem(THEME_KEY))
}

/** 将主题真正应用到根节点，供 CSS 变量和 data-theme 选择器消费 */
const applyTheme = (value) => {
  if (typeof document === 'undefined') return
  const nextTheme = normalizeTheme(value)
  document.documentElement.dataset.theme = nextTheme
  document.documentElement.classList.toggle('theme-dark', nextTheme === 'dark')
  document.documentElement.style.colorScheme = nextTheme
}

export const theme = ref(getInitialTheme())
export const isDarkTheme = computed(() => theme.value === 'dark')

/** 设置指定主题，并同步写入 localStorage */
export const setTheme = (value) => {
  const nextTheme = normalizeTheme(value)
  theme.value = nextTheme
  if (typeof localStorage !== 'undefined') {
    localStorage.setItem(THEME_KEY, nextTheme)
  }
  applyTheme(nextTheme)
}

/** 在亮色/暗色之间切换 */
export const toggleTheme = () => {
  setTheme(isDarkTheme.value ? 'light' : 'dark')
}

// 模块加载时立即应用一次，避免首屏闪烁到错误主题
applyTheme(theme.value)
