const { VolunteerActivity, VolunteerEnrollment } = require('../models');

const defaultActivities = [
    {
        title: '城市公园清洁行动',
        description: '加入周末公园清洁行动，共同美化城市环境，让绿色空间更洁净。',
        category: '社区清洁',
        location: '中山公园东门',
        startTime: '2026-04-12 09:00:00',
        endTime: '2026-04-12 12:00:00',
        durationHours: 3,
        maxParticipants: 30,
        currentCount: 18,
        pointsReward: 90,
        pointsPerHour: 30,
        status: 'confirmed',
        isUrgent: false,
        notes: '请携带手套和水壶。',
    },
    {
        title: '海滩垃圾清理志愿行',
        description: '共同清理海滩垃圾，保护海洋生态环境，为蓝色地球贡献一份力量。',
        category: '环境保护',
        location: '海滩公园南入口',
        startTime: '2026-04-19 08:30:00',
        endTime: '2026-04-19 12:30:00',
        durationHours: 4,
        maxParticipants: 25,
        currentCount: 25,
        pointsReward: 160,
        pointsPerHour: 40,
        status: 'confirmed',
        isUrgent: true,
        notes: '请穿着旧衣服，备好防晒用品。',
    },
    {
        title: '小学生环保科普教育',
        description: '向小学生传授环保知识，开展趣味环保实验和手工活动。',
        category: '教育支持',
        location: '阳光小学',
        startTime: '2026-04-26 14:00:00',
        endTime: '2026-04-26 16:00:00',
        durationHours: 2,
        maxParticipants: 15,
        currentCount: 8,
        pointsReward: 80,
        pointsPerHour: 40,
        status: 'pending',
        isUrgent: false,
        notes: '建议提前 20 分钟到校完成签到。',
    },
    {
        title: '社区树木种植活动',
        description: '共同种植城市树木，增加城市绿化面积，改善社区生态环境。',
        category: '环境保护',
        location: '南山公园内',
        startTime: '2026-05-03 09:00:00',
        endTime: '2026-05-03 12:00:00',
        durationHours: 3,
        maxParticipants: 40,
        currentCount: 12,
        pointsReward: 90,
        pointsPerHour: 30,
        status: 'pending',
        isUrgent: false,
        notes: '现场提供工具，请穿耐脏衣物。',
    },
    {
        title: '关爱老人探访志愿',
        description: '探望居家老人，提供陪伴、情感支持和日常协助。',
        category: '关爱老人',
        location: '阳光社区养老中心',
        startTime: '2026-05-10 10:00:00',
        endTime: '2026-05-10 12:00:00',
        durationHours: 2,
        maxParticipants: 10,
        currentCount: 6,
        pointsReward: 60,
        pointsPerHour: 30,
        status: 'pending',
        isUrgent: false,
        notes: '请保持耐心，注意沟通礼仪。',
    },
    {
        title: '垃圾分类宣传志愿行动',
        description: '在社区内开展垃圾分类宣传，帮助居民正确投放垃圾。',
        category: '社区清洁',
        location: '幸福居住区',
        startTime: '2026-05-17 09:30:00',
        endTime: '2026-05-17 11:30:00',
        durationHours: 2,
        maxParticipants: 20,
        currentCount: 5,
        pointsReward: 50,
        pointsPerHour: 25,
        status: 'pending',
        isUrgent: false,
        notes: '活动结束后统一回收宣传物料。',
    },
];

async function ensureDefaultActivities() {
    const count = await VolunteerActivity.count();
    if (count > 0) return;
    await VolunteerActivity.bulkCreate(defaultActivities);
}

function toActivityPayload(activity, enrollment) {
    const startTime = activity.startTime ? new Date(activity.startTime) : null;
    return {
        id: activity.id,
        title: activity.title,
        description: activity.description,
        category: activity.category,
        location: activity.location,
        startTime: activity.startTime,
        endTime: activity.endTime,
        date: startTime ? startTime.toISOString().slice(0, 16).replace('T', ' ') : '',
        durationHours: Number(activity.durationHours || 0),
        hours: Number(activity.durationHours || 0),
        maxParticipants: activity.maxParticipants,
        capacity: activity.maxParticipants,
        currentCount: activity.currentCount,
        enrolled: activity.currentCount,
        pointsReward: activity.pointsReward,
        points: activity.pointsReward,
        pointsPerHour: activity.pointsPerHour,
        status: activity.status,
        isUrgent: Boolean(activity.isUrgent),
        urgent: Boolean(activity.isUrgent),
        notes: activity.notes,
        coverImage: activity.coverImage,
        enrollment: enrollment ? {
            id: enrollment.id,
            status: enrollment.status,
            loggedHours: Number(enrollment.loggedHours || 0),
            pointsAwarded: enrollment.pointsAwarded,
            enrolledAt: enrollment.enrolledAt,
            completedAt: enrollment.completedAt,
        } : null,
    };
}

exports.getActivities = async (req, res) => {
    try {
        await ensureDefaultActivities();
        const activities = await VolunteerActivity.findAll({
            order: [['startTime', 'ASC']],
        });
        const userId = req.user?.id || null;
        const enrollments = userId ? await VolunteerEnrollment.findAll({ where: { userId } }) : [];
        const enrollmentMap = new Map(enrollments.map((item) => [item.activityId, item]));
        res.json({ items: activities.map((activity) => toActivityPayload(activity, enrollmentMap.get(activity.id))) });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.enroll = async (req, res) => {
    try {
        await ensureDefaultActivities();
        const activity = await VolunteerActivity.findByPk(req.params.id);
        if (!activity) return res.status(404).json({ error: 'Activity not found' });

        const existing = await VolunteerEnrollment.findOne({
            where: { userId: req.user.id, activityId: activity.id },
        });
        if (existing) return res.json({ item: toActivityPayload(activity, existing) });

        if (activity.maxParticipants && activity.currentCount >= activity.maxParticipants) {
            return res.status(400).json({ error: 'Activity is full' });
        }

        const enrollment = await VolunteerEnrollment.create({
            userId: req.user.id,
            activityId: activity.id,
            phone: String(req.body?.phone || '').trim() || null,
            remark: String(req.body?.remark || '').trim() || null,
            agreedRules: Boolean(req.body?.agreedRules),
            status: 'confirmed',
            enrolledAt: new Date(),
        });

        activity.currentCount = (activity.currentCount || 0) + 1;
        await activity.save();

        res.status(201).json({ item: toActivityPayload(activity, enrollment) });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.logHours = async (req, res) => {
    try {
        const enrollment = await VolunteerEnrollment.findOne({
            where: { userId: req.user.id, activityId: req.params.id },
        });
        if (!enrollment) return res.status(404).json({ error: 'Enrollment not found' });

        const activity = await VolunteerActivity.findByPk(req.params.id);
        if (!activity) return res.status(404).json({ error: 'Activity not found' });

        const hours = Number(req.body?.hours);
        if (!Number.isFinite(hours) || hours <= 0) {
            return res.status(400).json({ error: 'hours must be a positive number' });
        }

        enrollment.loggedHours = hours;
        enrollment.reflection = String(req.body?.reflection || '').trim() || null;
        enrollment.status = 'completed';
        enrollment.completedAt = new Date();
        enrollment.pointsAwarded = Math.max(0, Math.round(hours * Number(activity.pointsPerHour || 0)));
        await enrollment.save();

        res.json({
            hours: Number(enrollment.loggedHours),
            pointsAwarded: enrollment.pointsAwarded,
            completedAt: enrollment.completedAt,
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
