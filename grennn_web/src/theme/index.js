import { ref } from 'vue'

export const THEME_KEY = 'greensight_theme'
export const DEFAULT_THEME = 'light'

export const theme = ref(DEFAULT_THEME)

export const setTheme = () => {
  theme.value = DEFAULT_THEME
  if (typeof localStorage !== 'undefined') {
    localStorage.setItem(THEME_KEY, DEFAULT_THEME)
  }
  if (typeof document !== 'undefined') {
    document.documentElement.dataset.theme = DEFAULT_THEME
    document.documentElement.classList.remove('theme-dark')
    document.documentElement.style.colorScheme = 'light'
  }
}

export const toggleTheme = () => {
  setTheme()
}

setTheme()
