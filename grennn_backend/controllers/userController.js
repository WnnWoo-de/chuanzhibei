/**
 * controllers/userController.js - 用户信息控制器
 *
 * 提供用户个人信息查询、资料更新与积分管理功能：
 *   getMe         - 获取当前登录用户的基本信息
 *   updateMe      - 更新当前登录用户的资料
 *   updatePoints  - 为当前用户增加或扣减积分
 *
 * 所有接口均需要通过 protect 中间件验证，req.user 已由中间件填充。
 */

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
            emailVerified: user.emailVerified
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
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
        const username = String(req.body?.username || '').trim();
        const avatar = String(req.body?.avatar || '').trim();
        const bio = String(req.body?.bio || '').trim();
        const user = req.user;

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
                emailVerified: user.emailVerified
            }
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

/**
 * POST /api/v1/users/me/points
 * 更新当前用户的积分（增加或扣减）
 *
 * 请求体：{ amount }  - 积分变化量（正数为增加，负数为扣减）
 *
 * 校验规则：
 *   - amount 必须是有限数字（排除 NaN、Infinity）
 *   - 单次变化量绝对值不超过 10000（防止异常大额操作）
 *   - 积分最低为 0，不会出现负积分
 *
 * 返回：{ message, points }  - points 为更新后的积分值
 */
exports.updatePoints = async (req, res) => {
    try {
        const amount = Number(req.body?.amount);

        // 参数校验：必须是有效数字
        if (!Number.isFinite(amount)) {
            return res.status(400).json({ error: 'amount 必须是有效数字' });
        }

        // 安全校验：单次操作量不超过 ±10000，防止恶意或误操作
        if (Math.abs(amount) > 10000) {
            return res.status(400).json({ error: 'amount 超出允许范围' });
        }

        const user = req.user;

        // 更新积分：确保积分不低于 0（不允许负积分）
        user.points = Math.max(0, (user.points || 0) + amount);
        await user.save();

        res.json({ message: 'Points updated', points: user.points });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
