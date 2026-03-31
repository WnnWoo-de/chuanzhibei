/**
 * controllers/reconstructionController.js - 旧物重构 AI 分析控制器
 *
 * 提供旧物图片智能分析功能：
 *   analyzeImage - 接收上传的旧物图片，返回材质识别结果与 3 条改造建议
 *
 * 当前实现为模拟分析（随机生成结果），接入真实视觉 AI 时替换此处逻辑。
 *
 * 返回数据结构：
 *   analysis_id    - 唯一分析 ID（rec_ + 时间戳）
 *   image_url      - 上传图片的访问路径
 *   material       - 材质识别结果
 *   integrity      - 物品完整度评估
 *   carbon_reduction - 预估碳减排量
 *   suggestions    - 3 条改造建议（含标题、描述、步骤、难度、时长、碳减排量）
 */

exports.analyzeImage = (req, res) => {
    // 检查是否有文件上传（由 uploadMiddleware 处理后挂载到 req.file）
    if (!req.file) {
        return res.status(400).json({ error: 'No image uploaded' });
    }

    // ── 模拟 AI 分析结果 ──────────────────────────────────────────────────────
    // TODO: 接入真实视觉 AI（如通义千问-VL、GPT-4o 等）时替换以下逻辑

    // 随机识别材质类型
    const materials       = ['木质', '金属', '织物', '玻璃', '塑料', '陶瓷'];
    const randomMaterial  = materials[Math.floor(Math.random() * materials.length)];

    // 随机生成预估碳减排量（5.0 ~ 20.0 kg CO₂e）
    const carbonSavings   = (Math.random() * 15 + 5).toFixed(1);

    // ── 改造建议库 ─────────────────────────────────────────────────────────────
    // 预设 5 条改造方案，每次随机抽取 3 条返回给用户
    const allSuggestions = [
        {
            title:            '复古花架',
            description:      '保留框架结构，添加木板作为置物层，适合放置多肉植物。',
            steps: [
                '清洁表面，去除污渍',
                '打磨粗糙边缘，确保安全',
                '涂刷天然木蜡油保护',
                '搭配花盆摆放绿植'
            ],
            difficulty:       '简单',
            duration:         '1-2 小时',
            carbon_reduction: `${(Math.random() * 5 + 3).toFixed(1)} kg CO₂e`,
        },
        {
            title:            '儿童书架',
            description:      '拆解部分结构，重新组合成层架，适合摆放书籍或收纳玩具。',
            steps: [
                '拆解多余部件，保留主体结构',
                '加固关键连接处',
                '打磨上色或贴装饰纸',
                '安装隔板和收纳配件'
            ],
            difficulty:       '中等',
            duration:         '3-5 小时',
            carbon_reduction: `${(Math.random() * 5 + 5).toFixed(1)} kg CO₂e`,
        },
        {
            title:            '装饰挂架',
            description:      '利用物品框架结构制作壁挂装饰，搭配植物或小摆件。',
            steps: [
                '清洗干净并晾干',
                '按照设计切割或折叠',
                '安装壁挂固定件',
                '悬挂装饰品或植物'
            ],
            difficulty:       '简单',
            duration:         '1-2 小时',
            carbon_reduction: `${(Math.random() * 3 + 2).toFixed(1)} kg CO₂e`,
        },
        {
            title:            '工具收纳架',
            description:      '改造为多功能收纳架，适合放置工具、文具或厨房用品。',
            steps: [
                '测量并规划收纳空间',
                '钻孔或焊接固定支架',
                '安装挂钩和收纳盒',
                '喷漆或贴标签美化'
            ],
            difficulty:       '中等',
            duration:         '2-3 小时',
            carbon_reduction: `${(Math.random() * 4 + 4).toFixed(1)} kg CO₂e`,
        },
        {
            title:            '创意灯具',
            description:      '结合 LED 灯带或灯泡，打造独一无二的氛围照明装置。',
            steps: [
                '确认结构安全，无锋利边角',
                '布线并安装灯泡/灯带',
                '做好绝缘和防水处理',
                '安装开关并测试'
            ],
            difficulty:       '较难',
            duration:         '4-6 小时',
            carbon_reduction: `${(Math.random() * 6 + 6).toFixed(1)} kg CO₂e`,
        },
    ];

    // 随机打乱后取前 3 条作为本次分析建议
    const suggestions = allSuggestions
        .sort(() => 0.5 - Math.random())
        .slice(0, 3);

    // ── 构造并返回分析结果 ────────────────────────────────────────────────────
    const analysis = {
        analysis_id:      `rec_${Date.now()}`,             // 唯一分析 ID
        image_url:        `/uploads/${req.file.filename}`, // 可通过此路径访问已上传图片
        material:         `识别为：${randomMaterial}类材质`,
        integrity:        '良好 (B+)',                      // 模拟完整度评估
        carbon_reduction: `${carbonSavings} kg CO₂e`,      // 整体预估碳减排
        suggestions,
    };

    res.json(analysis);
};
