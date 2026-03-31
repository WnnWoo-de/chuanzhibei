/**
 * controllers/userController.js - 用户信息控制器
 *
 * 提供用户个人信息查询与积分管理功能：
 *   getMe        - 获取当前登录用户的基本信息
 *   updatePoints - 为当前用户增加或扣减积分
 *
 * 所有接口均需要通过 protect 中间件验证，req.user 已由中间件填充。
 */

/**
 * GET /api/v1/users/me
 * 获取当前登录用户的基本信息
 *
 * 返回字段：id、username、email、points、avatar
 * 注意：不返回 password、verificationToken 等敏感字段
 */
exports.getMe = async (req, res) => {
    try {
        const user = req.user; // 由 protect 中间件从数据库查询并注入

        res.json({
            id:       user.id,
            username: user.username,
            email:    user.email,
            points:   user.points,
            avatar:   user.avatar
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
