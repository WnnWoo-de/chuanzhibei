# 认证页面更新指南

## 概述

已将登录和注册页面统一为单一的 `AuthView.vue`，实现动态切换效果：
- **登录模式**：表单在左，彩色角色动画在右（眼睛跟随鼠标）
- **注册模式**：表单在左，成长树动画在左

## 文件结构

```
src/
├── views/auth/
│   ├── AuthView.vue              # 统一认证页面（新）
│   ├── LoginView.vue             # 已弃用（保留备份）
│   └── RegisterView.vue          # 已弃用（保留备份）
├── components/auth/
│   └── AuthAnimation.vue         # 动画组件（新）
└── router/
    └── index.js                  # 路由配置（已更新）
```

## 路由配置

| 路径 | 名称 | 说明 |
|------|------|------|
| `/auth` | `auth` | 主认证页面（登录/注册切换） |
| `/auth/login` | `login` | 重定向到 `/auth` |
| `/auth/register` | `register` | 重定向到 `/auth` |
| `/auth/callback` | `auth-callback` | OAuth 回调处理 |

## 核心功能

### AuthView.vue
- ✅ 统一的登录/注册表单
- ✅ 动态模式切换（点击"立即注册"/"立即登录"按钮）
- ✅ 响应式布局：PC 端左右布局，移动端上下堆叠
- ✅ 表单验证（邮箱、密码、用户名、确认密码）
- ✅ OAuth 登录支持（Google、Microsoft）
- ✅ 游客模式入口
- ✅ 无障碍支持（焦点管理、ARIA 标签）

### AuthAnimation.vue
- ✅ 登录动画：4 个彩色角色浮动 + 光晕脉冲
  - **眼睛跟随鼠标**：实时计算眼球位置，最大移动距离 3px
  - 橙色圆形、紫色矩形、黑色矩形、黄色圆形
- ✅ 注册动画：树叶分层生长 + 星星闪烁
- ✅ 平滑淡入淡出过渡
- ✅ 减动效偏好支持

## 眼睛跟随鼠标实现

### 原理
使用 `Math.atan2()` 计算鼠标相对于眼睛的角度，然后在该方向上移动眼球（最大 3px）。

### 代码示例
```javascript
const calculateEyePosition = (eyeCenterX, eyeCenterY, mouseX, mouseY, maxDistance = 3) => {
  const angle = Math.atan2(mouseY - eyeCenterY, mouseX - eyeCenterX)
  return {
    x: Math.cos(angle) * maxDistance,
    y: Math.sin(angle) * maxDistance
  }
}
```

### 性能优化
- 使用 `ref` 存储眼睛位置，避免频繁重新渲染
- 仅在登录模式下启用鼠标跟踪
- 移动端自动禁用（通过 CSS `hidden lg:flex`）

## 动画参数

### 登录动画
| 元素 | 动画 | 时长 | 延迟 | 说明 |
|------|------|------|------|------|
| 橙色圆形 | float | 3s | 0s | 浮动 ±15px |
| 紫色矩形 | float | 3.5s | 0.3s | 浮动 ±15px |
| 黑色矩形 | float | 3.2s | 0.6s | 浮动 ±15px |
| 黄色圆形 | float | 3.8s | 0.9s | 浮动 ±15px |
| 光晕 | glow-pulse | 2.5s | 0s | 脉冲 0.2→0.5 |
| 眼睛 | mousemove | 实时 | - | 跟随鼠标 |

### 注册动画
| 元素 | 动画 | 时长 | 延迟 | 说明 |
|------|------|------|------|------|
| 树叶层 1 | grow | 2s | 0s | 缩放 0.8→1.05→1 |
| 树叶层 2 | grow | 2.5s | 0.3s | 缩放 0.8→1.05→1 |
| 树叶层 3 | grow | 3s | 0.6s | 缩放 0.8→1.05→1 |
| 星星 | sparkle | 1.5s | 0s | 闪烁 0.3→1 |

## 响应式设计

### PC 端（lg 及以上）
- 左侧：表单卡片（固定宽度）
- 右侧：动画区域（灵活宽度）
- 登录时：表单左、动画右
- 注册时：表单左、动画左（通过 `order` 类调整）

### 移动端（< lg）
- 动画隐藏（`hidden lg:flex`）
- 表单全宽
- 上下堆叠布局

## 表单验证规则

### 登录
- **邮箱/用户名**：必填，邮箱格式需符合 `^[^\s@]+@[^\s@]+\.[^\s@]+$`
- **密码**：必填，至少 6 位

### 注册
- **用户名**：必填，2-20 个字符
- **邮箱**：必填，格式同上
- **密码**：必填，至少 6 位
- **确认密码**：必填，需与密码一致

## 无障碍特性

- ✅ 焦点管理：自动聚焦第一个错误字段
- ✅ ARIA 标签：所有输入框都有 `aria-label`
- ✅ 键盘导航：支持 Tab 键切换焦点
- ✅ 减动效偏好：`prefers-reduced-motion: reduce` 下禁用所有动画
- ✅ 对比度：文本对比度 ≥7:1

## 使用示例

### 导航到认证页面

```javascript
// 推荐方式
router.push({ name: 'auth' })

// 或使用旧路由（自动重定向）
router.push({ name: 'login' })
router.push({ name: 'register' })
```

### 在模板中使用

```vue
<router-link :to="{ name: 'auth' }">
  前往认证
</router-link>
```

## 常见问题

**Q: 眼睛跟随鼠标在移动端工作吗？**
A: 不工作。动画仅在 PC 端（lg 及以上）显示，移动端隐藏以节省空间和性能。

**Q: 如何自定义眼睛跟随的距离？**
A: 编辑 `AuthAnimation.vue` 中的 `calculateEyePosition` 函数，修改 `maxDistance` 参数（默认 3px）。

**Q: 如何自定义动画？**
A: 编辑 `AuthAnimation.vue` 中的 SVG 和 CSS 动画参数。

**Q: 旧的 LoginView.vue 和 RegisterView.vue 还需要吗？**
A: 可以保留作为备份，或删除以清理代码库。

---

**更新日期**：2025-04-02  
**版本**：1.1（添加眼睛跟随鼠标功能）
