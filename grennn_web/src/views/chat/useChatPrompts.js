import { ref } from 'vue'

// 预设快捷提问池：用于聊天页下方“灵感提示”随机展示
const allPrompts = [
  '如何回收废旧电池？',
  '旧牛仔裤可以改造成什么？',
  '什么是碳足迹？',
  '推荐一些环保生活习惯',
  '玻璃瓶的创意改造方案',
  '怎么制作环保酵素？',
  '家用电器如何节能？',
  '快递纸箱怎么回收利用？',
  '什么是“零废弃”生活？',
  '如何减少塑料使用？',
  '旧衣物如何回收？',
  '什么是绿色建筑？',
]

export const useChatPrompts = () => {
  const quickPrompts = ref([])        // 当前展示的 4 条快捷提问
  const isShuffling = ref(false)      // 是否正在执行“换一换”动画

  /** 随机抽取 4 条问题，配合短暂延时让按钮旋转动画更自然 */
  const shufflePrompts = async () => {
    isShuffling.value = true
    await new Promise((resolve) => setTimeout(resolve, 300))
    quickPrompts.value = [...allPrompts].sort(() => 0.5 - Math.random()).slice(0, 4)
    isShuffling.value = false
  }

  return {
    allPrompts,
    quickPrompts,
    isShuffling,
    shufflePrompts,
  }
}
