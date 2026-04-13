const { Post, PostLike, User } = require('../models');

exports.getPosts = async (req, res) => {
    try {
        const page = Math.max(1, parseInt(req.query?.page, 10) || 1);
        const limit = Math.min(50, Math.max(1, parseInt(req.query?.limit, 10) || 10));
        const offset = (page - 1) * limit;
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

exports.createPost = async (req, res) => {
    try {
        const { content, image_urls } = req.body;

        if (!content && (!image_urls || image_urls.length === 0)) {
            return res.status(400).json({ error: 'Content or images are required' });
        }

        const post = await Post.create({
            content: content || '',
            images: image_urls || [],
            userId: req.user.id,
        });

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

exports.likePost = async (req, res) => {
    try {
        const post = await Post.findByPk(req.params.id);
        if (!post) {
            return res.status(404).json({ error: 'Post not found' });
        }

        const existingLike = await PostLike.findOne({
            where: {
                postId: post.id,
                userId: req.user.id,
            }
        });

        const wantsUnlike = req.body?.action === 'unlike';

        if (wantsUnlike) {
            if (existingLike) {
                await existingLike.destroy();
                post.likes_count = Math.max(0, (post.likes_count || 0) - 1);
                await post.save();
            }
            return res.json({ status: 'unliked', count: post.likes_count, likes_count: post.likes_count });
        }

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
