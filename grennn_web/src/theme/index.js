import { computed, ref } from 'vue'

export const THEME_KEY = 'greensight_theme'
export const THEMES = {
  system: 'system',
  light: 'light',
  dark: 'dark',
}
export const DEFAULT_THEME = THEMES.system

const isTheme = (value) => Object.values(THEMES).includes(value)

const getSystemTheme = () => {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
    return THEMES.light
  }

  return window.matchMedia('(prefers-color-scheme: dark)').matches ? THEMES.dark : THEMES.light
}

const getStoredTheme = () => {
  if (typeof localStorage === 'undefined') return null

  try {
    const storedTheme = localStorage.getItem(THEME_KEY)
    return isTheme(storedTheme) ? storedTheme : null
  } catch (err) {
    void err
    return null
  }
}

const resolveTheme = (preference) => {
  if (preference === THEMES.system) return getSystemTheme()
  return isTheme(preference) && preference !== THEMES.system ? preference : getSystemTheme()
}

const getInitialThemePreference = () => getStoredTheme() || DEFAULT_THEME

export const themePreference = ref(getInitialThemePreference())
export const theme = ref(resolveTheme(themePreference.value))
export const isDarkTheme = computed(() => theme.value === THEMES.dark)

const applyTheme = (nextTheme, nextPreference = themePreference.value) => {
  if (typeof document === 'undefined') return

  const root = document.documentElement
  root.dataset.theme = nextTheme
  root.dataset.themePreference = nextPreference
  root.classList.toggle('theme-dark', nextTheme === THEMES.dark)
  root.classList.toggle('theme-light', nextTheme === THEMES.light)
  root.style.colorScheme = nextTheme
}

export const setTheme = (nextPreference = DEFAULT_THEME) => {
  const normalizedPreference = isTheme(nextPreference) ? nextPreference : DEFAULT_THEME
  const resolvedTheme = resolveTheme(normalizedPreference)

  themePreference.value = normalizedPreference
  theme.value = resolvedTheme

  if (typeof localStorage !== 'undefined') {
    try {
      localStorage.setItem(THEME_KEY, normalizedPreference)
    } catch (err) {
      void err
    }
  }

  applyTheme(resolvedTheme, normalizedPreference)
}

export const toggleTheme = () => {
  setTheme(theme.value === THEMES.dark ? THEMES.light : THEMES.dark)
}

export const syncThemeFromSystem = () => {
  if (themePreference.value !== THEMES.system) return
  const nextTheme = getSystemTheme()
  theme.value = nextTheme
  applyTheme(nextTheme, THEMES.system)
}

applyTheme(theme.value, themePreference.value)

if (typeof window !== 'undefined' && typeof window.matchMedia === 'function') {
  const systemThemeQuery = window.matchMedia('(prefers-color-scheme: dark)')
  const handleSystemThemeChange = () => syncThemeFromSystem()

  if (typeof systemThemeQuery.addEventListener === 'function') {
    systemThemeQuery.addEventListener('change', handleSystemThemeChange)
  } else if (typeof systemThemeQuery.addListener === 'function') {
    systemThemeQuery.addListener(handleSystemThemeChange)
  }
}
