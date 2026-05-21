/**
 * controllers/communityController.js - 社区帖子控制器
 * 处理帖子分页查询、发帖和点赞/取消点赞等社区互动逻辑
 */
const { Post, PostLike, User } = require('../models');

/**
 * GET /api/v1/community/posts
 * 按分页和排序方式返回帖子列表，并附带作者基础信息
 */
exports.getPosts = async (req, res) => {
    try {
        // 读取分页参数并设置安全范围，避免超大 limit 压垮数据库
        const page = Math.max(1, parseInt(req.query?.page, 10) || 1);
        const limit = Math.min(50, Math.max(1, parseInt(req.query?.limit, 10) || 10));
        const offset = (page - 1) * limit;
        // 支持按点赞数热门排序，否则默认按发布时间倒序
        const sort = req.query?.sort === 'popular' ? [['likes_count', 'DESC']] : [['createdAt', 'DESC']];

        const { count, rows: posts } = await Post.findAndCountAll({
            include: [{
                model: User,
                as: 'author',
                attributes: ['id', 'username', 'avatar']
            }],
            order: sort,
            limit,
            offset,
        });

        // 统一返回分页元数据，方便前端做分页或“加载更多”
        res.json({
            items: posts,
            total: count,
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
 * 发布新帖子，至少需要文字内容或图片其一
 */
exports.createPost = async (req, res) => {
    try {
        const { content, image_urls } = req.body;

        // 纯空内容且没有图片时拒绝创建帖子
        if (!content && (!image_urls || image_urls.length === 0)) {
            return res.status(400).json({ error: 'Content or images are required' });
        }

        const post = await Post.create({
            content: content || '',
            images: image_urls || [],
            userId: req.user.id,
        });

        // 创建完成后重新查一次，补齐 author 关联信息后返回给前端
        const postWithAuthor = await Post.findByPk(post.id, {
            include: [{
                model: User,
                as: 'author',
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
 * 对帖子点赞或取消点赞，并同步维护帖子点赞总数
 */
exports.likePost = async (req, res) => {
    try {
        const post = await Post.findByPk(req.params.id);
        if (!post) {
            return res.status(404).json({ error: 'Post not found' });
        }

        // 判断当前用户是否已经给这条帖子点过赞
        const existingLike = await PostLike.findOne({
            where: {
                postId: post.id,
                userId: req.user.id,
            }
        });

        const wantsUnlike = req.body?.action === 'unlike';

        // 取消点赞：删除关联记录，并将点赞数减 1（最低不小于 0）
        if (wantsUnlike) {
            if (existingLike) {
                await existingLike.destroy();
                post.likes_count = Math.max(0, (post.likes_count || 0) - 1);
                await post.save();
            }
            return res.json({ status: 'unliked', count: post.likes_count, likes_count: post.likes_count });
        }

        // 点赞：只有尚未点赞时才新增记录，避免重复累计
        if (!existingLike) {
            await PostLike.create({
                postId: post.id,
                userId: req.user.id,
            });
            post.likes_count = (post.likes_count || 0) + 1;
            await post.save();
        }

        res.json({ status: 'liked', count: post.likes_count, likes_count: post.likes_count });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
