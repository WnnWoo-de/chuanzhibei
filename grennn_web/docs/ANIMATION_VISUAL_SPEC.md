# GreenSight 动效与视觉规范 v1.0

## 概述

本规范定义了 GreenSight 官网沉浸式首屏与滚动交互的完整视觉与动效系统。采用浅色主题（白色主表面）、玻璃拟态、科技实验室背景与生态柔和气质的平衡设计。

**核心原则：**
- 先清晰后惊艳：文字对比度、信息层级优先
- 科技与生态平衡：硬核质感与柔和气质并存
- 性能与包容性：移动端 ≥50fps，尊重 prefers-reduced-motion

---

## 设计令牌系统

### 色彩系统（浅色主题）

**主表面与背景**
- `--color-surface-primary: #ffffff` - 卡片、背景主体
- `--color-surface-secondary: #f9fcf9` - 次级背景
- `--color-surface-tertiary: #f0f5f0` - 进度条轨道

**品牌绿**
- `--color-primary: #2e7d32` - 主交互、强调
- `--color-primary-light: #7cc486` - 光晕、脉冲
- `--color-primary-lighter: #c8e6c9` - 浅背景
- `--color-primary-lightest: #e8f5e9` - 极浅背景

**文本**
- `--color-text-primary: #1a1a1a` - 正文、标题（对比度 21:1）
- `--color-text-secondary: #4a4a4a` - 副文本（对比度 8.5:1）
- `--color-text-tertiary: #7a7a7a` - 辅助文本

### 玻璃拟态参数

| 强度 | 模糊 | 不透明度 | 用途 |
|------|------|---------|------|
| Strong | 18px | 92% | 主要卡片 |
| Medium | 12px | 82% | 次级容器 |
| Light | 8px | 72% | 轻量级背景 |
| Subtle | 4px | 62% | 极简背景 |

### 动效时长与缓动

- **入场快**：300ms，`cubic-bezier(0.2, 0.8, 0.2, 1)`
- **入场**：500ms，`cubic-bezier(0.2, 0.8, 0.2, 1)`
- **入场慢**：800ms，`cubic-bezier(0.2, 0.8, 0.2, 1)`
- **循环**：2.5s，`cubic-bezier(0.25, 0.46, 0.45, 0.94)`
- **循环慢**：4s，`cubic-bezier(0.25, 0.46, 0.45, 0.94)`

---

## 核心组件规格

### 1. ScrollIndicator（鼠标下滑提示）

**位置**：首屏底部中央，`fixed bottom-2rem`

**动画**：
- 呼吸灯背景：`breathingGlow 2.5s ease-smooth infinite`
- 鼠标 SVG：`mouseBreathe 2.5s ease-smooth infinite`
- 向下箭头：`arrowBounce 1.5s ease-smooth infinite`

**触发**：首屏滚动后（`scrollY > 100`）淡出

### 2. ResilienceProgress（呼吸进度条）

**规格**：
- 轨道高：8px（移动端 6px）
- 主条渐变：`#2e7d32` → `#7cc486`
- 呼吸光晕：`resilience-glow-pulse 2s infinite`

**触发**：元素进入视口时启动（`IntersectionObserver threshold: 0.25`）

### 3. SoilFundBackground（有机背景）

**特性**：
- 3 条 Bezier 曲线路径
- 噪声纹理：`feTurbulence baseFrequency="0.02"`
- 动画：`soil-drift 4s ease-smooth infinite`（错开延迟）

**移动端**：SVG 添加 `filter: blur(0.5px)` 降低复杂度

### 4. DataDashboard（数据看板）

**布局**：响应式网格 `grid-cols-1 md:grid-cols-2 lg:grid-cols-4`

**数值动画**：
- 触发：元素进入视口（`threshold: 0.2`）
- 时长：600ms
- 缓动：`cubic-bezier(0.2, 0.8, 0.2, 1)`
- 延迟：每卡片错开 60ms

**脉冲光晕**：`data-pulse 2s ease-out infinite`

---

## 无障碍与性能

### 无障碍检查清单

- [ ] 文本对比度 ≥7:1（正文/关键信息）
- [ ] 交互控件对比度 ≥4.5:1
- [ ] 焦点可见：`outline 2px solid var(--color-primary)`
- [ ] 键盘可达：所有交互元素支持 Tab 导航
- [ ] 读屏支持：`aria-label`、`role` 属性完整
- [ ] 减动效偏好：`@media (prefers-reduced-motion: reduce)` 禁用所有动画

### 性能预算

| 指标 | 目标 |
|------|------|
| 移动端帧率 | ≥50fps |
| 长任务 | <50ms |
| 动画总时长 | ≤800ms |
| 合成层 | ≤5 |

---

## PC 与移动端适配

### 响应式断点

| 断点 | 宽度 | 调整 |
|------|------|------|
| Mobile | <640px | 字体缩小 20%，间距减半 |
| Tablet | 640-1024px | 字体缩小 10%，间距 75% |
| Desktop | >1024px | 标准参数 |

---

## 文件清单

### 组件
- `src/components/ScrollIndicator.vue` - 鼠标下滑提示
- `src/components/ResilienceProgress.vue` - 呼吸进度条
- `src/components/SoilFundBackground.vue` - 有机背景
- `src/components/DataDashboard.vue` - 数据看板

### 样式
- `src/styles/design-tokens.css` - 设计令牌系统

### 视图
- `src/views/HomeView.vue` - 首页（集成所有组件）

---

**版本**：v1.0 | **更新**：2025-04-02
