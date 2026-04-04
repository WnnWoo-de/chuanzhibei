import { ref } from 'vue'

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
  const quickPrompts = ref([])
  const isShuffling = ref(false)

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
