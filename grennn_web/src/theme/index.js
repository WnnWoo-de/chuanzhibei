import { computed, ref } from 'vue'

export const THEME_KEY = 'greensight_theme'
export const DEFAULT_THEME = 'light'

export const themeTemplate = {
  light: { name: 'Light', description: '明亮' },
  dark: { name: 'Dark', description: '暗色' },
}

const normalizeTheme = (value) => (themeTemplate[value] ? value : DEFAULT_THEME)

const getInitialTheme = () => {
  if (typeof localStorage === 'undefined') return DEFAULT_THEME
  return normalizeTheme(localStorage.getItem(THEME_KEY))
}

const applyTheme = (value) => {
  if (typeof document === 'undefined') return
  const nextTheme = normalizeTheme(value)
  document.documentElement.dataset.theme = nextTheme
  document.documentElement.classList.toggle('theme-dark', nextTheme === 'dark')
  document.documentElement.style.colorScheme = nextTheme
}

export const theme = ref(getInitialTheme())
export const isDarkTheme = computed(() => theme.value === 'dark')

export const setTheme = (value) => {
  const nextTheme = normalizeTheme(value)
  theme.value = nextTheme
  if (typeof localStorage !== 'undefined') {
    localStorage.setItem(THEME_KEY, nextTheme)
  }
  applyTheme(nextTheme)
}

export const toggleTheme = () => {
  setTheme(isDarkTheme.value ? 'light' : 'dark')
}

applyTheme(theme.value)
