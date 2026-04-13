// ============================================================
// stores/counter.js - 计数器示例 Store
// 这是 Pinia 的官方示例 Store，用于演示 Setup Store 写法
// 实际项目中可替换为业务 Store
// ============================================================

import { ref, computed } from 'vue'
import { defineStore } from 'pinia'

/**
 * useCounterStore - 计数器状态管理
 * 使用 Setup Store 风格（与 Composition API 写法一致）
 */
export const useCounterStore = defineStore('counter', () => {
  // 当前计数值（响应式）
  const count = ref(0)

  // 计算属性：count 的两倍，自动随 count 更新
  const doubleCount = computed(() => count.value * 2)

  /**
   * 增加计数
   */
  function increment() {
    count.value++
  }

  return { count, doubleCount, increment }
})
