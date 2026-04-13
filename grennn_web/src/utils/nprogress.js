// ============================================================
// utils/nprogress.js - 轻量级页面顶部加载进度条
// 无第三方依赖，通过 DOM 操作实现进度条动画
// ============================================================

const NProgress = {
  // 配置项
  settings: {
    speed: 350,    // 动画持续时间（毫秒）
    easing: 'ease',// CSS 过渡曲线
    minimum: 0.1,  // 进度条起始最小值（0~1）
  },

  status: null, // 当前进度值（null 表示未启动或已完成）

  /**
   * 启动进度条
   * 若尚未启动则从 0 开始，随后通过 work() 递增
   */
  start() {
    if (!this.status) this.set(0)

    // 递归调用，模拟进度缓慢增长
    const work = () => {
      setTimeout(() => {
        if (!this.status) return // 已完成则停止
        this.inc()
        work()
      }, this.settings.speed)
    }
    work()
  },

  /**
   * 直接设置进度值
   * @param {number} n - 目标进度（0~1）
   */
  set(n) {
    // 限制在 [minimum, 1] 区间内
    n = this.clamp(n, this.settings.minimum, 1)
    // 进度为 1 时重置状态（完成后再进行淡出移除）
    this.status = n === 1 ? null : n

    if (typeof document === 'undefined') return

    // 获取或创建进度条元素
    let progress = document.getElementById('nprogress-bar')
    if (!progress) {
      this.render()
      progress = document.getElementById('nprogress-bar')
      if (!progress) return
    }

    // 更新进度条宽度
    progress.style.width = n * 100 + '%'

    // 进度到达 100% 时，延迟淡出并移除 DOM
    if (n === 1) {
      setTimeout(() => {
        progress.style.opacity = '0'
        setTimeout(() => {
          this.remove()
        }, this.settings.speed)
      }, this.settings.speed)
    }
  },

  /**
   * 自动增加进度
   * 根据当前进度所在区间自动计算步长（越接近 100% 增速越慢）
   * @param {number} [amount] - 手动指定增加量（可选）
   */
  inc(amount) {
    let n = this.status
    if (!n) {
      return this.start()
    }
    if (n > 1) {
      return
    }
    // 根据当前进度区间自动计算步长
    if (typeof amount !== 'number') {
      if (n >= 0 && n < 0.2) {
        amount = 0.1    // 0~20%：每次增加 10%
      } else if (n >= 0.2 && n < 0.5) {
        amount = 0.04   // 20~50%：每次增加 4%
      } else if (n >= 0.5 && n < 0.8) {
        amount = 0.02   // 50~80%：每次增加 2%
      } else if (n >= 0.8 && n < 0.99) {
        amount = 0.005  // 80~99%：每次增加 0.5%（永远到不了 100%，等待手动完成）
      } else {
        amount = 0
      }
    }
    // 进度最多到 99.4%，防止自动到达 100%
    n = this.clamp(n + amount, 0, 0.994)
    return this.set(n)
  },

  /**
   * 完成进度条（进度跳到 100% 并淡出）
   * @param {boolean} [force] - 强制完成，即使当前没有进度条
   */
  done(force) {
    if (!force && !this.status) return
    // 先跳一段进度再设为 1，使动画更自然
    this.inc(0.3 + 0.5 * Math.random())
    this.set(1)
  },

  /**
   * 创建进度条 DOM 并插入到 body
   */
  render() {
    if (typeof document === 'undefined') return
    if (document.getElementById('nprogress')) return // 防止重复创建
    const container = document.createElement('div')
    container.id = 'nprogress'
    container.innerHTML =
      '<div id="nprogress-bar" class="bar" role="bar"><div class="peg"></div></div>'
    document.body.appendChild(container)
  },

  /**
   * 从 body 中移除进度条 DOM
   */
  remove() {
    if (typeof document === 'undefined') return
    const container = document.getElementById('nprogress')
    if (container) {
      document.body.removeChild(container)
    }
  },

  /**
   * 将值限制在 [min, max] 区间内
   * @param {number} n - 输入值
   * @param {number} min - 最小值
   * @param {number} max - 最大值
   * @returns {number} 限制后的值
   */
  clamp(n, min, max) {
    if (n < min) return min
    if (n > max) return max
    return n
  },
}

export default NProgress
