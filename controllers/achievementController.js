const { Achievement, UserAchievement } = require('../models');

function extractTarget(conditionJson) {
    if (!conditionJson || typeof conditionJson !== 'object') return null;
    const value = Number(conditionJson.value);
    return Number.isFinite(value) ? value : null;
}

exports.getAchievements = async (req, res) => {
    try {
        const achievements = await Achievement.findAll({
            order: [['sortOrder', 'ASC'], ['id', 'ASC']],
        });

        const userAchievements = await UserAchievement.findAll({
            where: { userId: req.user.id },
        });
        const progressMap = new Map(userAchievements.map((item) => [item.achievementId, item]));

        const items = achievements.map((achievement) => {
            const progress = progressMap.get(achievement.id);
            const target = progress?.target ?? extractTarget(achievement.conditionJson);
            return {
                id: achievement.id,
                code: achievement.code,
                name: achievement.name,
                description: achievement.description,
                icon: achievement.icon,
                category: achievement.category,
                requirement: achievement.requirement,
                points: achievement.pointsReward,
                rarity: achievement.rarity,
                unlocked: Boolean(progress?.unlockedAt),
                unlockedAt: progress?.unlockedAt || null,
                progress: progress?.progress ?? 0,
                target,
            };
        });

        res.json({ items });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
