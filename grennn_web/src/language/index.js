import { computed, ref } from 'vue'
import { text as cn } from './lang/cn'
import { text as en } from './lang/en'
import { text as jp } from './lang/jp'

// 默认语言与持久化键
export const DEFAULT_LANG = 'CN'
export const LANG_KEY = 'greensight_lang'

// 语言模板：统一维护文案对象、显示名称和描述
export const langTemplate = {
  CN: { text: cn, name: '简体中文', description: 'Chinese' },
  EN: { text: en, name: 'English', description: '英语' },
  JP: { text: jp, name: '日本語', description: '日语' },
}

/** 获取应用启动时的默认语言，优先读取 localStorage */
const getInitialLang = () => {
  if (typeof localStorage === 'undefined') return DEFAULT_LANG
  return langTemplate[localStorage.getItem(LANG_KEY)] ? localStorage.getItem(LANG_KEY) : DEFAULT_LANG
}

export const lang = ref(getInitialLang())

// 当前激活语言的完整文案对象，页面通常直接读取这个 computed
export const langText = computed(() => langTemplate[lang.value]?.text || langTemplate[DEFAULT_LANG].text)

/** 切换界面语言，并将选择结果持久化 */
export const changeLang = (newLang) => {
  if (!langTemplate[newLang] || lang.value === newLang) return
  lang.value = newLang
  if (typeof localStorage !== 'undefined') {
    localStorage.setItem(LANG_KEY, newLang)
  }
}
