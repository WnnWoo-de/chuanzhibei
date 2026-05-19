# Vue 轻量级多语言解决方案

一个基于 Vue 3 Composition API 的轻量级多语言模块，支持响应式语言切换和本地存储记忆功能。

## 目录结构

```
language/
├── index.js          # 核心模块，导出语言控制相关 API
└── lang/
    ├── cn.js         # 繁体中文语言包
    ├── de.js         # 德语语言包
    ├── en.js         # 英语语言包
    ├── fr.js         # 法语语言包
    └── he.js         # 希伯来语语言包
```

## 功能特性

- 🌍 支持多语言切换（英语、繁体中文、法语、德语、希伯来语 有其他语言需要可以自行添加）
- 🔄 响应式语言切换，自动更新界面
- 💾 本地存储记忆，记住用户选择的语言
- 🪶 轻量级实现，基于 Vue 3 Composition API
- 📦 模块化设计，易于扩展更多语言

## 使用方法

### 1. 引入语言模块

```javascript
// 将本项目中的 language 目录存放到 vue项目 的 src目录下
// 存放至其他地方也可以 引入时留意路径即可
import { langText, changeLang } from '@/language';
```

### 2. 在模板中使用

1. 使用 `langText.value.text` 访问当前语言包的内容：
    ```vue
    <template>
    <div>
        <!-- 访问简单文本 -->
        <h1>{{ langText.text.title }}</h1>
        
        <!-- 访问嵌套对象 -->
        <p>{{ langText.text.xx_page.name }}</p>
        <p>{{ langText.text.xx_page.title }}</p>
        
        <!-- 访问数组 -->
        <table>
        <thead>
            <tr>
            <th v-for="(header, index) in langText.text.xx_table.header" :key="index">
                {{ header }}
            </th>
            </tr>
        </thead>
        </table>
    </div>
    </template>

    <script setup>
    import { langText } from './language/index.js';
    </script>
    ```

1. 使用计算属性简化访问流程
    ```vue
    <template>
    <div>
        <!-- 访问简单文本 -->
        <h1>{{ t.title }}</h1>
        
        <!-- 访问嵌套对象 -->
        <p>{{ xx_page_t.name }}</p>
        <p>{{ xx_page_t.title }}</p>
        
        <!-- 访问数组 -->
        <table>
        <thead>
            <tr>
            <th v-for="(header, index) in xx_table_t.header" :key="index">
                {{ header }}
            </th>
            </tr>
        </thead>
        </table>
    </div>
    </template>

    <script setup>
    import { computed } from 'vue';
    import { langText } from './language/index.js';

    const t = computed(() => langText.value.text);
    const xx_page_t = computed(() => langText.value.text.xx_page);
    const xx_table_t = computed(() => langText.value.text.xx_table);
    </script>
    ```

### 3. 切换语言

使用 `changeLang()` 函数切换语言：

```vue
<template>
  <div>
    <button @click="changeLang('EN')">English</button>
    <button @click="changeLang('CN')">繁體中文</button>
    <button @click="changeLang('FR')">Français</button>
    <button @click="changeLang('DE')">Deutsch</button>
    <button @click="changeLang('HE')">עִברִית</button>
  </div>
</template>

<script setup>
import { changeLang, lang } from './language/index.js';
</script>
```

### 4. 获取当前语言

```javascript
import { lang } from './language/index.js';

// lang 是一个 ref，需要使用 .value 获取当前语言
console.log(lang.value); // 'EN' 或 'CN' 等
```

### 5. 获取可用语言列表

```javascript
import { langTemplate } from './language/index.js';

// langTemplate 包含所有支持的语言信息
console.log(langTemplate);
// {
//   EN: { text: {...}, name: 'English', discription: '英语' },
//   CN: { text: {...}, name: '繁體', discription: '繁体中文' },
//   ...
// }
```

## API 参考

### 导出常量

| 常量名 | 类型 | 说明 |
|--------|------|------|
| `DEFAULT_LANG` | String | 默认语言代码，值为 `'EN'` |
| `LANG_KEY` | String | localStorage 存储键名，值为 `'lang'` |

### 导出变量

| 变量名 | 类型 | 说明 |
|--------|------|------|
| `lang` | Ref<String> | 当前语言代码的响应式引用 |
| `langText` | ComputedRef<Object> | 当前语言包内容的计算属性 |
| `langTemplate` | Object | 所有语言模板配置对象 |

### 导出函数

| 函数名 | 参数 | 返回值 | 说明 |
|--------|------|--------|------|
| `changeLang(newLang)` | `newLang`: String | void | 切换语言，自动保存到 localStorage |

## 语言包格式

语言包是一个导出 `text` 对象的 JavaScript 模块：

```javascript
// lang/xx.js
export const text = {
    title: '页面标题',
    page_name: {
        name: '页面名称',
        title: '页面标题'
    },
    table_name: {
        name: '表格名称',
        header: ['列1', '列2', '列3']
    },
    // ... 更多文本内容
};
```

## 添加新语言

1. 在 `lang/` 目录下创建新的语言文件，如 `jp.js`：

```javascript
export const text = {
    title: 'こんにちは世界',
    xx_page: {
        name: 'ページ',
        title: 'タイトル'
    },
    xx_table: {
        name: 'テーブル',
        header: ['ID', '名前', '年齢']
    },
};
```

2. 在 `index.js` 中导入并注册：

```javascript
import { text as jp } from './lang/jp';

export const langTemplate = {
    EN: { text: en, name: 'English', discription: '英语' },
    CN: { text: cn, name: '繁體', discription: '繁体中文' },
    FR: { text: fr, name: 'Français', discription: '法语' },
    DE: { text: de, name: 'Deutsch', discription: '德语' },
    HE: { text: he, name: 'עִברִית', discription: '希伯来语' },
    JP: { text: jp, name: '日本語', discription: '日语' },  // 新增
};
```

## 注意事项

1. 语言切换时会自动保存到 `localStorage`，下次访问会自动恢复上次选择的语言(如果使用环境不支持 localstorage 则用户需手动修改保存逻辑 或者 不使用记忆功能即可)
2. 如果传入的语言代码不存在于 `langTemplate` 中，`changeLang()` 不会执行任何操作
3. 如果切换的语言与当前语言相同，`changeLang()` 不会执行任何操作
4. `langText` 是一个计算属性，会自动响应 `lang` 的变化
