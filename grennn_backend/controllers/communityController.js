/**
 * controllers/communityController.js - 社区动态控制器
 *
 * 提供社区帖子的增删查及点赞功能：
 *   getPosts   - 分页获取帖子列表（支持按时间或热度排序）
 *   createPost - 发布新帖子（文字 + 图片 URL 数组）
 *   likePost   - 为帖子点赞或取消点赞
 *
 * 注意：点赞目前为简单计数模型（无用户维度去重），
 * 前端负责乐观更新与切换状态，后端接收 delta 增量。
 */

const Post = require('../models/Post');
const User = require('../models/User');

/**
 * GET /api/v1/community/posts
 * 分页获取社区帖子列表
 *
 * 查询参数：
 *   page  - 页码（默认 1，最小 1）
 *   limit - 每页条数（默认 10，范围 1-50）
 *   sort  - 排序方式：'popular'（按点赞数降序）| 其他（按创建时间降序）
 *
 * 返回：{ items, total, page, limit, totalPages }
 */
exports.getPosts = async (req, res) => {
    try {
        // 解析并限制分页参数，防止非法值
        const page   = Math.max(1, parseInt(req.query?.page)  || 1);
        const limit  = Math.min(50, Math.max(1, parseInt(req.query?.limit) || 10));
        const offset = (page - 1) * limit; // 计算 SQL OFFSET

        // 排序策略：popular → 按点赞数降序；默认 → 按创建时间降序（最新在前）
        const sort = req.query?.sort === 'popular'
            ? [['likes_count', 'DESC']]
            : [['createdAt',   'DESC']];

        // 联表查询：同时返回帖子作者的基础信息（id、用户名、头像）
        const { count, rows: posts } = await Post.findAndCountAll({
            include: [{
                model:      User,
                as:         'author',              // 对应 Post.belongsTo(User, { as: 'author' })
                attributes: ['id', 'username', 'avatar'] // 只返回必要字段，不暴露密码等敏感信息
            }],
            order:  sort,
            limit,
            offset,
        });

        res.json({
            items:      posts,
            total:      count,
            page,
            limit,
            totalPages: Math.ceil(count / limit),
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

/**
 * POST /api/v1/community/posts
 * 发布新帖子（需登录）
 *
 * 请求体：
 *   content    - 帖子文字内容（字符串）
 *   image_urls - 图片 URL 数组（可选）
 *
 * 校验：content 和 image_urls 至少提供一项
 * 返回：带作者信息的完整帖子对象（201）
 */
exports.createPost = async (req, res) => {
    try {
        const { content, image_urls } = req.body;

        // 内容校验：文字和图片至少有一个
        if (!content && (!image_urls || image_urls.length === 0)) {
            return res.status(400).json({ error: 'Content or images are required' });
        }

        // 创建帖子记录（userId 来自 protect 中间件注入的 req.user）
        const post = await Post.create({
            content: content || '',
            images:  image_urls || [],
            userId:  req.user.id
        });

        // 重新查询以附带作者信息后返回（ensure 关联数据完整）
        const postWithAuthor = await Post.findByPk(post.id, {
            include: [{
                model:      User,
                as:         'author',
                attributes: ['id', 'username', 'avatar']
            }]
        });

        res.status(201).json(postWithAuthor);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

/**
 * POST /api/v1/community/posts/:id/like
 * 为指定帖子点赞或取消点赞（需登录）
 *
 * 请求体：
 *   action - 'unlike' 表示取消点赞，其他值（默认）表示点赞
 *
 * 实现说明：
 *   当前为简单计数模型，后端只记录点赞数的增量 delta（+1 或 -1）。
 *   前端通过乐观更新（optimistic update）管理每个用户的点赞状态。
 *   likes_count 最低为 0，不会出现负值。
 *
 * 返回：{ status, count, likes_count }
 */
exports.likePost = async (req, res) => {
    try {
        const post = await Post.findByPk(req.params.id);

        // 帖子不存在 → 返回 404
        if (!post) {
            return res.status(404).json({ error: 'Post not found' });
        }

        // 根据 action 决定增量：unlike → -1，like → +1
        const delta = req.body?.action === 'unlike' ? -1 : 1;

        // 更新点赞数，确保不小于 0
        post.likes_count = Math.max(0, (post.likes_count || 0) + delta);
        await post.save();

        const status = delta > 0 ? 'liked' : 'unliked';
        res.json({ status, count: post.likes_count, likes_count: post.likes_count });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
