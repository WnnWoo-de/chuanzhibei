/**
 * controllers/storeController.js - 积分商城控制器
 * 负责商品初始化、商品查询、兑换记录查询和积分兑换流程
 */
const { sequelize, RewardProduct, RedeemRecord } = require('../models');

// 默认兑换商品清单：数据库为空时会自动写入，便于项目演示和初始化
const seedProducts = [
    { id: 1, name: '环保帆布袋', category: '实物商品', description: '可重复使用，适合购物、通勤、日常收纳。', points: 500, stock: 20, productType: 'physical', icon: 'ShoppingBag', accent: 'accent-green', tags: ['低碳', '可重复使用'], sortOrder: 1 },
    { id: 2, name: '可重复使用水杯', category: '实物商品', description: '减少一次性杯具使用，适合校园与通勤场景。', points: 800, stock: 12, productType: 'physical', icon: 'CoffeeCup', accent: 'accent-blue', tags: ['随身', '减塑'], sortOrder: 2 },
    { id: 3, name: '竹纤维餐具套装', category: '实物商品', description: '轻便餐具组合，降低外卖一次性餐具依赖。', points: 1200, stock: 8, productType: 'physical', icon: 'Goods', accent: 'accent-amber', tags: ['餐具', '低废弃'], sortOrder: 3 },
    { id: 4, name: '垃圾分类贴纸', category: '实物商品', description: '家庭分类提醒贴，帮助全家快速识别投放类别。', points: 200, stock: 40, productType: 'physical', icon: 'CollectionTag', accent: 'accent-cyan', tags: ['分类', '家庭'], sortOrder: 4 },
    { id: 5, name: '绿色知识达人徽章', category: '虚拟徽章', description: '完成环保知识学习后可展示在个人成就墙。', points: 300, stock: 99, productType: 'virtual', icon: 'Medal', accent: 'accent-lime', tags: ['徽章', '知识'], sortOrder: 5 },
    { id: 6, name: '低碳生活头像框', category: '头像装饰', description: '为个人主页增加低碳主题头像装饰。', points: 400, stock: 99, productType: 'virtual', icon: 'Present', accent: 'accent-rose', tags: ['装饰', '虚拟'], sortOrder: 6 },
    { id: 7, name: '公益树苗认养证书', category: '公益证书', description: '生成一份公益认养证书，记录你的绿色行动。', points: 1500, stock: 6, productType: 'certificate', icon: 'Reading', accent: 'accent-emerald', tags: ['公益', '证书'], sortOrder: 7 },
];

/** 若商品表为空，则自动写入默认商品 */
const ensureProducts = async () => {
    const count = await RewardProduct.count();
    if (count > 0) return;
    await RewardProduct.bulkCreate(seedProducts, { ignoreDuplicates: true });
};

/** 将商品模型格式化为前端展示所需字段 */
const formatProduct = (item) => ({
    id: item.id,
    name: item.name,
    category: item.category,
    description: item.description,
    points: item.points,
    stock: item.stock,
    productType: item.productType,
    icon: item.icon,
    accent: item.accent,
    tags: Array.isArray(item.tags) ? item.tags : [],
    enabled: item.enabled,
});

/** 将兑换记录模型转换为前端可直接渲染的结构 */
const formatRecord = (item) => ({
    id: item.id,
    productId: item.productId,
    productName: item.productName,
    category: item.category,
    productType: item.productType,
    costPoints: item.costPoints,
    status: item.status,
    statusText: item.status === 'fulfilled' ? '已到账' : item.status === 'pending' ? '已提交申请' : '已取消',
    createdAt: item.createdAt,
    fulfilledAt: item.fulfilledAt,
});

/**
 * GET /api/v1/store/products
 * 返回当前可兑换商品列表；若数据库为空则先初始化默认商品
 */
exports.listProducts = async (_, res) => {
    try {
        await ensureProducts();
        const items = await RewardProduct.findAll({
            where: { enabled: true },
            order: [['sortOrder', 'ASC'], ['id', 'ASC']],
        });
        res.json({ items: items.map(formatProduct) });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

/**
 * GET /api/v1/store/records
 * 返回当前用户的积分兑换历史
 */
exports.listMyRedeemRecords = async (req, res) => {
    try {
        const items = await RedeemRecord.findAll({
            where: { userId: req.user.id },
            include: [{ model: RewardProduct, as: 'product', required: false }],
            order: [['createdAt', 'DESC']],
            limit: 50,
        });
        res.json({ items: items.map(formatRecord) });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

/**
 * POST /api/v1/store/redeem
 * 使用积分兑换指定商品；在事务中同时扣减库存和用户积分
 */
exports.redeemProduct = async (req, res) => {
    const productId = Number(req.body?.productId);
    if (!Number.isInteger(productId) || productId <= 0) {
        return res.status(400).json({ error: 'productId 无效' });
    }

    // 使用数据库事务保证“扣库存、扣积分、写记录”三个动作的一致性
    const t = await sequelize.transaction();
    try {
        const product = await RewardProduct.findOne({
            where: { id: productId, enabled: true },
            transaction: t,
            lock: t.LOCK.UPDATE,
        });

        // 依次校验：商品存在、库存充足、用户积分足够
        if (!product) {
            await t.rollback();
            return res.status(404).json({ error: '商品不存在或已下架' });
        }
        if (product.stock <= 0) {
            await t.rollback();
            return res.status(400).json({ error: '商品库存不足' });
        }
        if ((req.user.points || 0) < product.points) {
            await t.rollback();
            return res.status(400).json({ error: '绿色积分不足' });
        }

        // 扣减库存
        product.stock -= 1;
        await product.save({ transaction: t });

        // 扣减用户积分，且保证不出现负数
        req.user.points = Math.max(0, (req.user.points || 0) - product.points);
        await req.user.save({ transaction: t });

        // 虚拟商品可视为即时到账，实物商品则进入待处理状态
        const isInstant = product.productType !== 'physical';
        const record = await RedeemRecord.create({
            userId: req.user.id,
            productId: product.id,
            productName: product.name,
            category: product.category,
            productType: product.productType,
            costPoints: product.points,
            status: isInstant ? 'fulfilled' : 'pending',
            fulfilledAt: isInstant ? new Date() : null,
        }, { transaction: t });

        // 事务提交后再统一返回兑换结果
        await t.commit();
        res.status(201).json({
            message: 'Redeemed',
            product: formatProduct(product),
            record: formatRecord(record),
            points: req.user.points,
        });
    } catch (err) {
        // 任一步骤失败时回滚事务，避免只扣了积分或只扣了库存
        await t.rollback();
        res.status(500).json({ error: err.message });
    }
};
