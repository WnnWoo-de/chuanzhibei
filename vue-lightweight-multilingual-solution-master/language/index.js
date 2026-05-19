import { ref, computed } from 'vue';

import { text as en } from './lang/en';
import { text as cn } from './lang/cn';
import { text as fr } from './lang/fr';
import { text as de } from './lang/de';
import { text as he } from './lang/he';

// 默认语言
export const DEFAULT_LANG = 'EN';
export const LANG_KEY = 'lang';

// 语言模板
export const langTemplate = {
    EN: { text: en, name: 'English', discription: '英语' },
    CN: { text: cn, name: '繁體', discription: '繁体中文' },
    FR: { text: fr, name: 'Français', discription: '法语' },
    DE: { text: de, name: 'Deutsch', discription: '德语' },
    HE: { text: he, name: 'עִברִית', discription: '希伯来语' },
};

// 语言控制 (默认英文)
export const lang = ref(localStorage.getItem(LANG_KEY) || DEFAULT_LANG);

// 语言包
export const langText = computed(() => {
    return {
        text: langTemplate[lang.value].text
    }
});

// 语言切换
export const changeLang = (newLang) => {
    if (lang.value === newLang) return ;     // 语言相同不需要切换
    if (!langTemplate[newLang]) return ;     // 语言包不存在不需要切换
    lang.value = newLang;                    // 切换语言
    localStorage.setItem(LANG_KEY, newLang); // 记住用户选择的语言
}