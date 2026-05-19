export const getSimulatedChatResponse = async ({ isTyping, userMessage }) => {
  await new Promise((resolve) => setTimeout(resolve, 1200))
  if (!isTyping()) return ''

  const lastUserMsg = String(userMessage || '').toLowerCase()

  if (lastUserMsg.includes('牛仔裤')) {
    return '旧牛仔裤是非常棒的改造材料！\n\n**推荐方案：**\n1. **时尚托特包**：剪下裤腿，缝合底部，用腰带做提手。\n2. **收纳挂袋**：利用后口袋制作墙面收纳。\n3. **拼接抱枕**：将不同颜色的牛仔布拼接成独特的抱枕套。\n\n您想了解具体的制作步骤吗？'
  }
  if (lastUserMsg.includes('电池')) {
    return '废旧电池属于**有害垃圾**，请勿随意丢弃。\n\n**处理建议：**\n- 请投放到专门的红色有害垃圾回收桶。\n- 部分超市或便利店设有电池回收箱。\n- 充电电池建议循环使用以减少污染。\n\n保护土壤和水源，从正确投放电池开始！🌱'
  }
  if (lastUserMsg.includes('玻璃瓶')) {
    return '玻璃瓶是绝佳的装饰材料！✨\n\n**创意灵感：**\n- **氛围灯**：放入LED灯串，瞬间变身浪漫夜灯。\n- **水培花瓶**：清洗干净后直接用于水培绿萝等植物。\n- **彩绘装饰**：用丙烯颜料绘制图案，作为独一无二的摆件。'
  }
  if (lastUserMsg.includes('塑料')) {
    return '**减少塑料使用小贴士：**\n1. 购物自带布袋。\n2. 拒绝使用一次性吸管，改用不锈钢或纸吸管。\n3. 购买散装蔬菜，减少塑料包装。\n4. 使用可重复使用的水杯，减少购买瓶装水。\n\n每一个小小的改变，都能为地球减负！'
  }
  if (lastUserMsg.includes('酵素')) {
    return '**环保酵素制作方法：**\n\n**材料比例**：黑糖 1 : 果皮 3 : 水 10\n\n1. 将切碎的果皮放入容器。\n2. 加入黑糖和水，搅拌均匀。\n3. 密封发酵3个月，第一个月每天开盖放气。\n\n**用途**：清洁剂、肥料、除臭剂。非常有用的变废为宝技巧！'
  }
  if (lastUserMsg.includes('碳足迹')) {
    return '**碳足迹**是指个人或组织在日常生活中直接或间接产生的温室气体排放总量。\n\n您可以使用我们侧边栏的 **“碳足迹分析”** 工具来计算您的个人碳足迹，并获取针对性的减排建议。'
  }
  if (lastUserMsg.includes('你好') || lastUserMsg.includes('hello')) {
    return '你好！很高兴见到你 🌱 我是 GS AI 对话助手，来自 GreenSight-绿我同行。我们可以聊聊如何让生活更环保，或者你有具体的旧物想要改造吗？'
  }

  return '这是一个很好的环保问题！\n\n作为 GS AI 对话助手，我建议你：\n1. **减少浪费** (Reduce)：优先选择耐用品。\n2. **重复使用** (Reuse)：寻找物品的第二次生命。\n3. **回收利用** (Recycle)：正确分类回收。\n\n如果你有具体的旧物想要改造，欢迎拍照上传到“旧物重构”板块，我会为你提供专属方案！'
}
