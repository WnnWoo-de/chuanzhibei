import { computed, ref } from 'vue'
import { text as cn } from './lang/cn'
import { text as en } from './lang/en'
import { text as jp } from './lang/jp'

export const DEFAULT_LANG = 'CN'
export const LANG_KEY = 'greensight_lang'

export const langTemplate = {
  CN: { text: cn, name: '简体中文', description: 'Chinese' },
  EN: { text: en, name: 'English', description: '英语' },
  JP: { text: jp, name: '日本語', description: '日语' },
}

const getInitialLang = () => {
  if (typeof localStorage === 'undefined') return DEFAULT_LANG
  return langTemplate[localStorage.getItem(LANG_KEY)] ? localStorage.getItem(LANG_KEY) : DEFAULT_LANG
}

export const lang = ref(getInitialLang())

export const langText = computed(() => langTemplate[lang.value]?.text || langTemplate[DEFAULT_LANG].text)

export const changeLang = (newLang) => {
  if (!langTemplate[newLang] || lang.value === newLang) return
  lang.value = newLang
  if (typeof localStorage !== 'undefined') {
    localStorage.setItem(LANG_KEY, newLang)
  }
}
