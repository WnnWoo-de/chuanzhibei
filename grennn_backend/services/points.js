/**
 * services/points.js - 服务端积分发放服务
 *
 * 设计原则：
 *   - 积分只能由服务端在业务事件完成后发放，客户端不能直接提交积分变化量；
 *   - 每个业务事件使用唯一 eventKey，重复请求不会重复发分；
 *   - 高价值事件支持每日上限，降低刷分风险；
 *   - 发放过程在事务内锁定用户行，保证并发下余额一致。
 */

const { Op } = require('sequelize');
const { sequelize, User, PointTransaction } = require('../models');

const DEFAULT_DAILY_CAPS = {
    quiz: 300,
    community: 100,
    reconstruction: 200,
    waste: 100,
    volunteer: 1000,
};

const startOfToday = () => {
    const date = new Date();
    date.setHours(0, 0, 0, 0);
    return date;
};

/**
 * 为指定用户发放积分。
 *
 * @param {object} options
 * @param {string} options.userId     用户 ID
 * @param {number} options.amount     本次希望发放的积分（正整数）
 * @param {string} options.reason     事件类型，用于统计每日上限
 * @param {string} options.eventKey   业务事件唯一键，用于幂等
 * @param {number} [options.dailyCap] 当日该类型积分上限，传 0 表示不限制
 * @returns {Promise<{awarded:number, points:number|null, duplicated:boolean, capped:boolean}>}
 */
const awardPoints = async ({ userId, amount, reason, eventKey, dailyCap }) => {
    const requested = Math.floor(Number(amount));
    const empty = { awarded: 0, points: null, duplicated: false, capped: false };

    if (!userId || !eventKey || !Number.isFinite(requested) || requested <= 0) {
        return empty;
    }

    const cap = dailyCap === undefined
        ? (DEFAULT_DAILY_CAPS[reason] ?? 0)
        : Math.max(0, Math.floor(Number(dailyCap) || 0));

    const transaction = await sequelize.transaction();
    let committed = false;

    try {
        const existing = await PointTransaction.findOne({
            where: { eventKey },
            transaction,
        });
        if (existing) {
            await transaction.commit();
            committed = true;
            return { ...empty, duplicated: true };
        }

        // 锁定用户行：并发发分、兑换扣分都会串行读取余额
        const user = await User.findByPk(userId, {
            transaction,
            lock: transaction.LOCK.UPDATE,
        });
        if (!user) {
            await transaction.commit();
            committed = true;
            return empty;
        }

        let awarded = requested;
        if (cap > 0) {
            const usedToday = Number(await PointTransaction.sum('amount', {
                where: {
                    userId,
                    reason,
                    createdAt: { [Op.gte]: startOfToday() },
                },
                transaction,
            })) || 0;
            awarded = Math.max(0, Math.min(requested, cap - usedToday));
        }

        if (awarded <= 0) {
            await transaction.commit();
            committed = true;
            return { ...empty, points: user.points, capped: true };
        }

        user.points = Math.max(0, Number(user.points || 0) + awarded);
        await user.save({ transaction });

        await PointTransaction.create({
            userId,
            eventKey,
            amount: awarded,
            reason,
            balanceAfter: user.points,
        }, { transaction });

        await transaction.commit();
        committed = true;
        return { awarded, points: user.points, duplicated: false, capped: false };
    } catch (err) {
        if (!committed) {
            try { await transaction.rollback(); } catch (rollbackErr) { void rollbackErr; }
        }
        // eventKey 唯一约束冲突说明同一事件已被其他并发请求发放
        if (err?.name === 'SequelizeUniqueConstraintError') {
            return { ...empty, duplicated: true };
        }
        throw err;
    }
};

module.exports = { awardPoints, DEFAULT_DAILY_CAPS };