/**
 * controllers/userController.js - 用户信息控制器
 *
 * 提供用户个人信息查询、资料更新与积分流水查询功能：
 *   getMe               - 获取当前登录用户的基本信息
 *   updateMe            - 更新当前登录用户的资料
 *   listPointTransactions - 查询当前用户的积分流水
 *
 * 积分不再提供客户端直接写入接口，由服务端在业务事件完成后发放。
 */

const { PointTransaction } = require('../models');
const { getUserRole } = require('../services/roles');

/**
 * GET /api/v1/users/me
 * 获取当前登录用户的基本信息
 *
 * 返回字段：id、username、email、points、avatar、bio、emailVerified
 * 注意：不返回 password、verificationToken 等敏感字段
 */
exports.getMe = async (req, res) => {
    try {
        const user = req.user; // 由 protect 中间件从数据库查询并注入

        res.json({
            id:            user.id,
            username:      user.username,
            email:         user.email,
            points:        user.points,
            avatar:        user.avatar,
            bio:           user.bio,
            emailVerified: user.emailVerified,
            role:          getUserRole(user),
        });
    } catch (err) {
        console.error('GetMe controller error:', err);
        res.status(500).json({ error: '获取用户信息失败，请稍后重试' });
    }
};

/**
 * PUT /api/v1/users/me
 * 更新当前登录用户资料
 *
 * 请求体：{ username, avatar, bio }
 *
 * 校验规则：
 *   - username 必填，长度 2-20
 *   - avatar 可为空；如存在则必须是 http/https 链接
 *   - bio 最多 500 字
 */
exports.updateMe = async (req, res) => {
    try {
        const user = req.user;
        const username = String(req.body?.username || '').trim();
        // 未传 avatar / bio 时保留原值，避免只修改用户名时清空其他资料
        const avatar = req.body?.avatar === undefined
            ? String(user.avatar || '').trim()
            : String(req.body.avatar || '').trim();
        const bio = req.body?.bio === undefined
            ? String(user.bio || '').trim()
            : String(req.body.bio || '').trim();

        if (!username) {
            return res.status(400).json({ error: '请输入用户名', errors: { username: '请输入用户名' } });
        }
        if (username.length < 2 || username.length > 20) {
            return res.status(400).json({
                error: '用户名长度需为 2-20 个字符',
                errors: { username: '用户名长度需为 2-20 个字符' }
            });
        }
        if (bio.length > 500) {
            return res.status(400).json({ error: '个人简介最多 500 个字符', errors: { bio: '个人简介最多 500 个字符' } });
        }
        if (avatar) {
            const isHttpUrl = /^https?:\/\//i.test(avatar);
            if (!isHttpUrl) {
                return res.status(400).json({
                    error: '头像地址必须为有效的 http 或 https 链接',
                    errors: { avatar: '头像地址必须为有效的 http 或 https 链接' }
                });
            }
        }

        const existingUser = await user.constructor.findOne({ where: { username } });
        if (existingUser && existingUser.id !== user.id) {
            return res.status(409).json({ error: '该用户名已被占用', errors: { username: '该用户名已被占用' } });
        }

        user.username = username;
        user.avatar = avatar || null;
        user.bio = bio || null;
        await user.save({ fields: ['username', 'avatar', 'bio'] });

        res.json({
            message: 'Profile updated',
            user: {
                id:            user.id,
                username:      user.username,
                email:         user.email,
                points:        user.points,
                avatar:        user.avatar,
                bio:           user.bio,
                emailVerified: user.emailVerified,
                role:          getUserRole(user),
            }
        });
    } catch (err) {
        if (err?.name === 'SequelizeUniqueConstraintError') {
            return res.status(409).json({
                error: '该用户名已被占用',
                errors: { username: '该用户名已被占用' }
            });
        }
        console.error('UpdateMe controller error:', err);
        res.status(500).json({ error: '更新资料失败，请稍后重试' });
    }
};

/**
 * GET /api/v1/users/me/points
 * 返回当前用户最近的积分流水，便于个人中心展示积分来源。
 */
exports.listPointTransactions = async (req, res) => {
    try {
        const items = await PointTransaction.findAll({
            where: { userId: req.user.id },
            order: [['createdAt', 'DESC']],
            limit: 50,
            attributes: ['id', 'amount', 'reason', 'balanceAfter', 'createdAt'],
        });
        res.json({ items, points: req.user.points });
    } catch (err) {
        console.error('listPointTransactions controller error:', err);
        res.status(500).json({ error: '获取积分流水失败，请稍后重试' });
    }
};
