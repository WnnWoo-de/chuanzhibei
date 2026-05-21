/**
 * controllers/quizController.js - 环保问答控制器
 * 负责题库初始化、题目查询、用户答题记录查询与保存
 */
const { QuizQuestion, QuizRecord } = require('../models');

// 默认题库：当数据库中还没有题目时，首次请求会自动写入这些种子题
const seedQuestions = [
    { id: 1, category: '垃圾分类', type: 'single', question: '以下哪种垃圾属于可回收物？', options: [{ label: 'A', text: '废旧报纸' }, { label: 'B', text: '剩菜剩饭' }, { label: 'C', text: '用过的纸巾' }, { label: 'D', text: '烟蒂' }], answer: ['A'], explanation: '废旧报纸属于可回收物，回收后可以重新制浆造纸。', points: 10, sortOrder: 1 },
    { id: 2, category: '低碳出行', type: 'single', question: '短距离出行时，以下哪种方式更低碳？', options: [{ label: 'A', text: '开私家车' }, { label: 'B', text: '步行或骑自行车' }, { label: 'C', text: '怠速停车等待' }, { label: 'D', text: '单人长距离开车' }], answer: ['B'], explanation: '步行和骑行几乎不产生直接碳排放，适合短距离通勤。', points: 10, sortOrder: 2 },
    { id: 3, category: '节水节电', type: 'judge', question: '离开房间随手关灯可以减少不必要的电力消耗。', options: [{ label: 'A', text: '正确' }, { label: 'B', text: '错误' }], answer: ['A'], explanation: '随手关灯是最容易坚持的节能行为之一，也能降低家庭用电成本。', points: 10, sortOrder: 3 },
    { id: 4, category: '绿色饮食', type: 'single', question: '以下哪种行为更符合绿色饮食理念？', options: [{ label: 'A', text: '按需点餐，减少浪费' }, { label: 'B', text: '每餐大量剩饭' }, { label: 'C', text: '频繁使用一次性餐具' }, { label: 'D', text: '只购买过度包装食品' }], answer: ['A'], explanation: '按需点餐可以减少食物浪费，也能降低生产和处理过程中的资源消耗。', points: 10, sortOrder: 4 },
    { id: 5, category: '旧物利用', type: 'multiple', question: '以下哪些做法属于旧物利用？', options: [{ label: 'A', text: '把旧玻璃瓶改造成花瓶' }, { label: 'B', text: '修补旧衣服继续穿' }, { label: 'C', text: '还能用的物品直接丢弃' }, { label: 'D', text: '旧纸箱改成收纳盒' }], answer: ['A', 'B', 'D'], explanation: '旧物利用可以延长物品生命周期，减少新资源消耗和废弃物产生。', points: 10, sortOrder: 5 },
];

/** 若题库为空，则自动写入默认题目，方便项目开箱即用 */
const ensureQuestions = async () => {
    const count = await QuizQuestion.count();
    if (count > 0) return;
    await QuizQuestion.bulkCreate(seedQuestions, { ignoreDuplicates: true });
};

/** 将数据库题目对象裁剪为前端所需字段 */
const formatQuestion = (item) => ({
    id: item.id,
    category: item.category,
    type: item.type,
    question: item.question,
    options: Array.isArray(item.options) ? item.options : [],
    answer: Array.isArray(item.answer) ? item.answer : [],
    explanation: item.explanation,
    points: item.points,
});

/** 统一答题记录返回格式，避免前端直接依赖 Sequelize 原始对象 */
const formatRecord = (item) => ({
    id: item.id,
    date: item.date,
    questionIds: Array.isArray(item.questionIds) ? item.questionIds : [],
    correctCount: item.correctCount,
    totalCount: item.totalCount,
    earnedPoints: item.earnedPoints,
    completed: item.completed,
    createdAt: item.createdAt,
});

/**
 * GET /api/v1/quiz/questions
 * 返回启用中的题库列表，若数据库为空则先自动初始化种子题
 */
exports.listQuestions = async (_, res) => {
    try {
        await ensureQuestions();
        const items = await QuizQuestion.findAll({
            where: { enabled: true },
            order: [['sortOrder', 'ASC'], ['id', 'ASC']],
            limit: 20,
        });
        res.json({ items: items.map(formatQuestion) });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

/**
 * GET /api/v1/quiz/records
 * 获取当前登录用户最近的答题记录
 */
exports.listMyRecords = async (req, res) => {
    try {
        const items = await QuizRecord.findAll({
            where: { userId: req.user.id },
            order: [['date', 'DESC'], ['createdAt', 'DESC']],
            limit: 30,
        });
        res.json({ items: items.map(formatRecord) });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

/**
 * POST /api/v1/quiz/records
 * 保存当前用户某一天的答题结果；同一天重复提交会更新原记录
 */
exports.saveRecord = async (req, res) => {
    try {
        // 取 yyyy-mm-dd 作为自然日主键，避免同一天产生多条成绩记录
        const date = String(req.body?.date || new Date().toISOString().slice(0, 10)).slice(0, 10);
        const questionIds = Array.isArray(req.body?.questionIds) ? req.body.questionIds : [];
        const correctCount = Number(req.body?.correctCount);
        const totalCount = Number(req.body?.totalCount);
        const earnedPoints = Number(req.body?.earnedPoints);

        // 基础校验：答题数量必须合理，积分必须是有限且非负的数字
        if (!Number.isInteger(correctCount) || !Number.isInteger(totalCount) || totalCount <= 0) {
            return res.status(400).json({ error: '答题数量无效' });
        }
        if (!Number.isFinite(earnedPoints) || earnedPoints < 0 || earnedPoints > 10000) {
            return res.status(400).json({ error: '积分数据无效' });
        }

        // 将正确题数限制在 [0, totalCount] 范围内，避免前端误传异常值
        const payload = {
            questionIds,
            correctCount: Math.max(0, Math.min(correctCount, totalCount)),
            totalCount,
            earnedPoints,
            completed: true,
        };

        // 同一用户同一天只保留一条记录：没有就创建，有就更新
        const [record] = await QuizRecord.findOrCreate({
            where: { userId: req.user.id, date },
            defaults: { userId: req.user.id, date, ...payload },
        });
        if (!record.isNewRecord) {
            await record.update(payload);
        }

        res.status(201).json({ record: formatRecord(record) });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
